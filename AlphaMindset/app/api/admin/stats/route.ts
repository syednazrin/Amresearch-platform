import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { start: startOfToday, end: endOfToday } = getTodayRange();

    // Get documents stats
    const documents = await getCollection('documents');
    const totalDocuments = await documents.countDocuments();
    const totalViewsAgg = await documents
      .aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }])
      .toArray();

    const totalViews = totalViewsAgg[0]?.total || 0;

    // Today's documents (published)
    const todaysDocuments = await documents
      .find({
        isPublished: true,
        uploadedAt: {
          $gte: startOfToday,
          $lt: endOfToday,
        },
      })
      .project<{ _id: unknown; viewCount: number }>({ _id: 1, viewCount: 1 })
      .toArray();

    const reportsPublishedToday = todaysDocuments.length;
    const viewsToday = todaysDocuments.reduce(
      (sum, doc) => sum + (doc.viewCount || 0),
      0
    );

    // Get feedback stats
    const feedback = await getCollection('document_feedback');

    const recentFeedbackCount = await feedback.countDocuments({
      submittedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    // Feedback for today's documents (for ratings/agree stats)
    const todayDocumentIds = todaysDocuments.map((d) => d._id);

    let averageRatingToday = 0;
    let agreeDisagreeRatioToday = {
      agreed: 0,
      disagreed: 0,
      agreementPercentage: 0,
    };

    if (todayDocumentIds.length > 0) {
      const todaysFeedback = await feedback
        .find({
          documentId: { $in: todayDocumentIds },
        })
        .toArray();

      const totalFeedbackToday = todaysFeedback.length;

      if (totalFeedbackToday > 0) {
        const totalRating = todaysFeedback.reduce(
          (sum, f: any) => sum + (f.rating || 0),
          0
        );
        averageRatingToday = Math.round((totalRating / totalFeedbackToday) * 10) / 10;

        const agreedCount = todaysFeedback.filter(
          (f: any) => f.agreedWithThesis
        ).length;
        const disagreedCount = totalFeedbackToday - agreedCount;

        agreeDisagreeRatioToday = {
          agreed: agreedCount,
          disagreed: disagreedCount,
          agreementPercentage:
            totalFeedbackToday > 0
              ? Math.round((agreedCount / totalFeedbackToday) * 100)
              : 0,
        };
      }
    }

    // Get bookings stats
    const bookings = await getCollection('bookings');
    const upcomingBookings = await bookings.countDocuments({
      date: { $gte: new Date() },
      status: { $ne: 'cancelled' },
    });

    // Get trips stats
    const trips = await getCollection('trips');
    const upcomingTrips = await trips.countDocuments({
      date: { $gte: new Date() },
    });

    // Get recent activity
    const recentDocuments = await documents
      .find()
      .sort({ uploadedAt: -1 })
      .limit(5)
      .toArray();

    const recentBookings = await bookings
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    return NextResponse.json({
      stats: {
        totalDocuments,
        totalViews,
        recentFeedback: recentFeedbackCount,
        upcomingBookings,
        upcomingTrips,
        // New analytics-focused metrics
        reportsPublishedToday,
        viewsToday,
        averageRatingToday,
        agreeDisagreeRatioToday,
      },
      recentActivity: {
        documents: recentDocuments,
        bookings: recentBookings,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get documents stats
    const documents = await getCollection('documents');
    const totalDocuments = await documents.countDocuments();
    const totalViews = await documents
      .aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }])
      .toArray();

    // Get feedback stats
    const feedback = await getCollection('document_feedback');
    const recentFeedbackCount = await feedback.countDocuments({
      submittedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

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
        totalViews: totalViews[0]?.total || 0,
        recentFeedback: recentFeedbackCount,
        upcomingBookings,
        upcomingTrips,
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

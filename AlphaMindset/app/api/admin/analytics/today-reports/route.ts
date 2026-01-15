import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get today's date range (start and end of today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch all reports published today
    const documents = await getCollection('documents');
    const todayReports = await documents
      .find({
        isPublished: true,
        uploadedAt: {
          $gte: today,
          $lt: tomorrow,
        },
      })
      .sort({ uploadedAt: -1 })
      .toArray();

    // Get feedback collection
    const feedbackCollection = await getCollection('document_feedback');

    // Calculate analytics for each report
    const reportsWithAnalytics = await Promise.all(
      todayReports.map(async (report) => {
        const reportId = report._id;

        // Get all feedback for this report
        const feedback = await feedbackCollection
          .find({ documentId: reportId })
          .toArray();

        // Calculate metrics
        const totalViews = report.viewCount || 0;
        const totalFeedback = feedback.length;

        // Agree/Disagree calculation
        const agreedCount = feedback.filter((f) => f.agreedWithThesis === true).length;
        const disagreedCount = feedback.filter((f) => f.agreedWithThesis === false).length;
        const agreePercentage = totalFeedback > 0
          ? Math.round((agreedCount / totalFeedback) * 100)
          : 0;

        // Average rating
        const averageRating = totalFeedback > 0
          ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / totalFeedback
          : 0;

        // Comment count (feedback with non-empty feedback field)
        const commentCount = feedback.filter((f) => f.feedback && f.feedback.trim().length > 0).length;

        // Format publish time
        const publishTime = report.uploadedAt
          ? new Date(report.uploadedAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '';

        return {
          _id: report._id.toString(),
          title: report.title,
          publishTime,
          totalViews,
          agreePercentage,
          averageRating: Math.round(averageRating * 10) / 10,
          commentCount,
          uploadedAt: report.uploadedAt,
        };
      })
    );

    return NextResponse.json({ reports: reportsWithAnalytics });
  } catch (error) {
    console.error('Error fetching today\'s reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today\'s reports' },
      { status: 500 }
    );
  }
}

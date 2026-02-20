import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const analystId = searchParams.get('analystId');
    if (!analystId) {
      return NextResponse.json(
        { error: 'analystId is required' },
        { status: 400 }
      );
    }

    const documents = await getCollection('documents');
    const reports = await documents
      .find({
        isPublished: true,
        analystId: new ObjectId(analystId),
      })
      .sort({ uploadedAt: -1 })
      .toArray();

    const feedbackCollection = await getCollection('document_feedback');

    const reportsWithAnalytics = await Promise.all(
      reports.map(async (report) => {
        const feedback = await feedbackCollection
          .find({ documentId: report._id })
          .toArray();

        const totalViews = report.viewCount || 0;
        const totalFeedback = feedback.length;
        const agreedCount = feedback.filter((f) => f.agreedWithThesis === true).length;
        const agreePercentage = totalFeedback > 0
          ? Math.round((agreedCount / totalFeedback) * 100)
          : 0;
        const averageRating = totalFeedback > 0
          ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / totalFeedback
          : 0;
        const commentCount = feedback.filter((f) => f.feedback && f.feedback.trim().length > 0).length;
        const publishTime = report.uploadedAt
          ? new Date(report.uploadedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
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

    const totalViews = reportsWithAnalytics.reduce((s, r) => s + r.totalViews, 0);
    const totalFeedback = await feedbackCollection.countDocuments({
      documentId: { $in: reports.map((r) => r._id) },
    });
    const allFeedback = totalFeedback > 0
      ? await feedbackCollection
          .find({ documentId: { $in: reports.map((r) => r._id) } })
          .toArray()
      : [];
    const agreedCount = allFeedback.filter((f) => f.agreedWithThesis === true).length;
    const agreePercentage = totalFeedback > 0 ? Math.round((agreedCount / totalFeedback) * 100) : 0;
    const averageRating = totalFeedback > 0
      ? allFeedback.reduce((s, f) => s + (f.rating || 0), 0) / totalFeedback
      : 0;

    return NextResponse.json({
      reports: reportsWithAnalytics,
      summary: {
        totalReports: reportsWithAnalytics.length,
        totalViews,
        totalFeedback,
        agreePercentage,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Error fetching analyst reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analyst reports' },
      { status: 500 }
    );
  }
}

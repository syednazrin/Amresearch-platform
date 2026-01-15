import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch the report
    const documents = await getCollection('documents');
    const report = await documents.findOne({ _id: new ObjectId(id) });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Get feedback for this report
    const feedbackCollection = await getCollection('document_feedback');
    const feedback = await feedbackCollection
      .find({ documentId: new ObjectId(id) })
      .sort({ submittedAt: -1 })
      .toArray();

    // Calculate basic metrics
    const totalViews = report.viewCount || 0;
    const totalFeedback = feedback.length;
    
    const agreedCount = feedback.filter((f) => f.agreedWithThesis === true).length;
    const disagreedCount = feedback.filter((f) => f.agreedWithThesis === false).length;
    
    const averageRating = totalFeedback > 0
      ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / totalFeedback
      : 0;

    // Views over time (daily breakdown since publish)
    // Since we don't track daily views, we'll create a simple distribution
    const publishDate = report.uploadedAt ? new Date(report.uploadedAt) : new Date();
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const viewsOverTime: Array<{ date: string; views: number }> = [];
    const currentDate = new Date(publishDate);
    currentDate.setHours(0, 0, 0, 0);
    
    // Distribute total views evenly across days since publish
    const daysSincePublish = Math.max(1, Math.ceil((today.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24)));
    const viewsPerDay = Math.floor(totalViews / daysSincePublish);
    const remainder = totalViews % daysSincePublish;
    
    while (currentDate <= today) {
      const dateKey = currentDate.toISOString().split('T')[0];
      let dayViews = viewsPerDay;
      
      // Distribute remainder across first few days
      const dayIndex = Math.floor((currentDate.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayIndex < remainder) {
        dayViews += 1;
      }
      
      viewsOverTime.push({
        date: dateKey,
        views: dayViews,
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Ratings distribution (1-5)
    const ratingsDistribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: feedback.filter((f) => f.rating === rating).length,
    }));

    // Format comments with metadata
    const comments = feedback
      .filter((f) => f.feedback && f.feedback.trim().length > 0)
      .map((f) => ({
        rating: f.rating,
        agreedWithThesis: f.agreedWithThesis,
        feedback: f.feedback,
        submittedAt: f.submittedAt,
      }));

    return NextResponse.json({
      report: {
        _id: report._id.toString(),
        title: report.title,
        uploadedAt: report.uploadedAt,
        totalViews,
        averageRating: Math.round(averageRating * 10) / 10,
        agreedCount,
        disagreedCount,
      },
      analytics: {
        viewsOverTime,
        ratingsDistribution,
        comments,
      },
    });
  } catch (error) {
    console.error('Error fetching report analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report analytics' },
      { status: 500 }
    );
  }
}

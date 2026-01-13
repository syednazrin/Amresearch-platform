import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { agreedWithThesis, rating, feedback } = await request.json();

    if (agreedWithThesis === undefined || !rating) {
      return NextResponse.json(
        { error: 'Agreement status and rating are required' },
        { status: 400 }
      );
    }

    const session = await getSession();
    const feedbackCollection = await getCollection('document_feedback');

    await feedbackCollection.insertOne({
      documentId: new ObjectId(id),
      userId: session ? new ObjectId(session.userId) : null,
      agreedWithThesis,
      rating,
      feedback: feedback || '',
      submittedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

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
    const feedbackCollection = await getCollection('document_feedback');

    const feedback = await feedbackCollection
      .find({ documentId: new ObjectId(id) })
      .sort({ submittedAt: -1 })
      .toArray();

    // Calculate statistics
    const totalFeedback = feedback.length;
    const agreedCount = feedback.filter((f) => f.agreedWithThesis).length;
    const disagreedCount = totalFeedback - agreedCount;
    const averageRating = totalFeedback > 0
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback
      : 0;

    return NextResponse.json({
      feedback,
      stats: {
        total: totalFeedback,
        agreed: agreedCount,
        disagreed: disagreedCount,
        agreementPercentage: totalFeedback > 0 ? Math.round((agreedCount / totalFeedback) * 100) : 0,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

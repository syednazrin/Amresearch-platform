import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const docId = new ObjectId(id);
    const documents = await getCollection('documents');
    const documentViews = await getCollection('document_views');

    await Promise.all([
      documents.updateOne({ _id: docId }, { $inc: { viewCount: 1 } }),
      documentViews.insertOne({
        documentId: docId,
        viewedAt: new Date(),
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return NextResponse.json(
      { error: 'Failed to increment view count' },
      { status: 500 }
    );
  }
}

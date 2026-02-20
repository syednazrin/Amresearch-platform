import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const analystId = searchParams.get('analystId');

    const documents = await getCollection('documents');

    let query: Record<string, unknown> = {};
    if (!session?.isAdmin) {
      query = { isPublished: true };
    }
    if (session?.isAdmin && analystId) {
      query.analystId = new ObjectId(analystId);
    }

    const docs = await documents
      .find(query)
      .sort({ uploadedAt: -1 })
      .toArray();

    return NextResponse.json({ documents: docs });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

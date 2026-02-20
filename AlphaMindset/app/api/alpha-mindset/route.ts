import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latest = searchParams.get('latest') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;

    const collection = await getCollection('alpha_mindset');
    const query = {}; // all published; you could add { published: true } if you add that field later
    let cursor = collection.find(query).sort({ publishedAt: -1, createdAt: -1 });

    if (limit) cursor = cursor.limit(limit);
    const items = await cursor.toArray();

    if (latest) {
      const item = items[0] || null;
      return NextResponse.json({ item });
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching alpha mindset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Alpha Mindset' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, excerpt, content, theme, publishedAt } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const collection = await getCollection('alpha_mindset');
    const now = new Date();
    const doc = {
      title: title?.trim() || 'Alpha Mindset Commentary',
      excerpt: excerpt?.trim() || '',
      content: content.trim(),
      theme: theme?.trim() || '',
      publishedAt: publishedAt ? new Date(publishedAt) : now,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(doc);
    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Error creating alpha mindset:', error);
    return NextResponse.json(
      { error: 'Failed to create Alpha Mindset' },
      { status: 500 }
    );
  }
}

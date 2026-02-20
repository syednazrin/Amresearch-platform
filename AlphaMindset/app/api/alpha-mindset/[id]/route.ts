import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collection = await getCollection('alpha_mindset');
    const item = await collection.findOne({ _id: new ObjectId(id) });

    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error fetching alpha mindset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Alpha Mindset' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, excerpt, content, theme, publishedAt } = body;

    const collection = await getCollection('alpha_mindset');
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title?.trim() || 'Alpha Mindset Commentary';
    if (excerpt !== undefined) updates.excerpt = excerpt?.trim() || '';
    if (content !== undefined) updates.content = content.trim();
    if (theme !== undefined) updates.theme = theme?.trim() || '';
    if (publishedAt !== undefined) updates.publishedAt = new Date(publishedAt);

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating alpha mindset:', error);
    return NextResponse.json(
      { error: 'Failed to update Alpha Mindset' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const collection = await getCollection('alpha_mindset');
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting alpha mindset:', error);
    return NextResponse.json(
      { error: 'Failed to delete Alpha Mindset' },
      { status: 500 }
    );
  }
}

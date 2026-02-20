import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { deleteFile, extractKeyFromUrl } from '@/lib/r2';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const documents = await getCollection('documents');
    const document = await documents.findOne({ _id: new ObjectId(id) });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if user can access this document
    const session = await getSession();
    if (!document.isPublished && !session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
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
    const { title, description, company, industry, theme, isPublished, analystId } = body;

    const documents = await getCollection('documents');
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (company !== undefined) updates.company = company && String(company).trim() ? String(company).trim() : null;
    if (industry !== undefined) updates.industry = industry && String(industry).trim() ? String(industry).trim() : null;
    if (theme !== undefined) updates.theme = theme && String(theme).trim() ? String(theme).trim() : null;
    if (isPublished !== undefined) updates.isPublished = isPublished;
    if (analystId !== undefined) {
      updates.analystId = analystId && String(analystId).trim() ? new ObjectId(analystId) : null;
    }
    const result = await documents.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
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
    const documents = await getCollection('documents');
    const document = await documents.findOne({ _id: new ObjectId(id) });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete from R2
    const key = extractKeyFromUrl(document.fileUrl);
    if (key) {
      try {
        await deleteFile(key);
      } catch (error) {
        console.error('Error deleting file from R2:', error);
      }
    }

    // Delete from database
    await documents.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}

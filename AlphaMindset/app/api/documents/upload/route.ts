import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { uploadFile, generateFileKey } from '@/lib/r2';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const isPublished = formData.get('isPublished') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique key and upload to R2
    const key = generateFileKey(file.name, 'documents');
    const uploadResult = await uploadFile(buffer, key, file.type);

    // Save to database
    const documents = await getCollection('documents');
    const result = await documents.insertOne({
      title: title || file.name,
      description: description || '',
      fileUrl: uploadResult.url,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date(),
      uploadedBy: new ObjectId(session.userId),
      viewCount: 0,
      isPublished,
    });

    return NextResponse.json({
      success: true,
      documentId: result.insertedId,
      url: uploadResult.url,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

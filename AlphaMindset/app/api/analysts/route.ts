import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const analysts = await getCollection('analysts');
    const analystsList = await analysts
      .find({ isActive: true })
      .sort({ order: 1 })
      .toArray();

    // Normalize _id to string for client consumption
    const normalized = analystsList.map((analyst: any) => ({
      ...analyst,
      _id: analyst._id?.toString?.() ?? analyst._id,
    }));

    return NextResponse.json({ analysts: normalized });
  } catch (error) {
    console.error('Error fetching analysts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysts' },
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

    const { name, title, bio, photoUrl, availabilitySlots, order, sectors } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const analysts = await getCollection('analysts');
    const result = await analysts.insertOne({
      name,
      title: title || '',
      bio: bio || '',
      photoUrl: photoUrl || '',
      availabilitySlots: availabilitySlots || [],
      isActive: true,
      order: order || 0,
      sectors: sectors || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Error creating analyst:', error);
    return NextResponse.json(
      { error: 'Failed to create analyst' },
      { status: 500 }
    );
  }
}

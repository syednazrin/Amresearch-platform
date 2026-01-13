import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const analysisTypes = await getCollection('analysis_types');
    const types = await analysisTypes
      .find({ isActive: true })
      .sort({ order: 1 })
      .toArray();

    return NextResponse.json({ analysisTypes: types });
  } catch (error) {
    console.error('Error fetching analysis types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis types' },
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

    const { name, description, duration, price, availabilitySlots, order } = await request.json();

    if (!name || !duration || !availabilitySlots) {
      return NextResponse.json(
        { error: 'Name, duration, and availability slots are required' },
        { status: 400 }
      );
    }

    const analysisTypes = await getCollection('analysis_types');
    const result = await analysisTypes.insertOne({
      name,
      description: description || '',
      duration,
      price: price || 0,
      availabilitySlots, // Array of slot objects
      isActive: true,
      order: order || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Error creating analysis type:', error);
    return NextResponse.json(
      { error: 'Failed to create analysis type' },
      { status: 500 }
    );
  }
}

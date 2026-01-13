import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const analysisTypes = await getCollection('analysis_types');
    const type = await analysisTypes.findOne({ _id: new ObjectId(params.id) });

    if (!type) {
      return NextResponse.json({ error: 'Analysis type not found' }, { status: 404 });
    }

    return NextResponse.json({ analysisType: type });
  } catch (error) {
    console.error('Error fetching analysis type:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis type' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, duration, price, availabilitySlots, isActive, order } =
      await request.json();

    const analysisTypes = await getCollection('analysis_types');
    const result = await analysisTypes.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          name,
          description,
          duration,
          price,
          availabilitySlots,
          isActive,
          order,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Analysis type not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating analysis type:', error);
    return NextResponse.json(
      { error: 'Failed to update analysis type' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analysisTypes = await getCollection('analysis_types');
    const result = await analysisTypes.deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Analysis type not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting analysis type:', error);
    return NextResponse.json(
      { error: 'Failed to delete analysis type' },
      { status: 500 }
    );
  }
}

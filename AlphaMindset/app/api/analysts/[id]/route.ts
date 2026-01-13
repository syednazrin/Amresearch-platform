import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const analysts = await getCollection('analysts');
    const analyst = await analysts.findOne({ _id: new ObjectId(params.id) });

    if (!analyst) {
      return NextResponse.json({ error: 'Analyst not found' }, { status: 404 });
    }

    return NextResponse.json({ analyst });
  } catch (error) {
    console.error('Error fetching analyst:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analyst' },
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

    const { name, title, bio, photoUrl, availabilitySlots, isActive, order } =
      await request.json();

    const analysts = await getCollection('analysts');
    const result = await analysts.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          name,
          title,
          bio,
          photoUrl,
          availabilitySlots,
          isActive,
          order,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Analyst not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating analyst:', error);
    return NextResponse.json(
      { error: 'Failed to update analyst' },
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

    const analysts = await getCollection('analysts');
    const result = await analysts.deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Analyst not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting analyst:', error);
    return NextResponse.json(
      { error: 'Failed to delete analyst' },
      { status: 500 }
    );
  }
}

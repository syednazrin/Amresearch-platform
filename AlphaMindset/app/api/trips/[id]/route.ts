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
    const trips = await getCollection('trips');
    const trip = await trips.findOne({ _id: new ObjectId(id) });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json({ trip });
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trip' },
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
    const { companyName, date, location, description, imageUrl, isOnline } = body;

    const trips = await getCollection('trips');
    const updates: Record<string, unknown> = {};
    if (companyName !== undefined) updates.companyName = companyName;
    if (date !== undefined) updates.date = new Date(date);
    if (description !== undefined) updates.description = description;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (isOnline !== undefined) {
      updates.isOnline = isOnline === true;
      updates.location = isOnline === true ? 'Online' : (location ?? '');
    } else if (location !== undefined) {
      updates.location = location;
    }

    const result = await trips.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json(
      { error: 'Failed to update trip' },
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
    const trips = await getCollection('trips');
    const trip = await trips.findOne({ _id: new ObjectId(id) });
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    if (trip.imageUrl) {
      let key = extractKeyFromUrl(trip.imageUrl);
      if (key && key.includes('trips/')) {
        if (key.includes('/') && !key.startsWith('trips/')) {
          key = key.replace(/^[^/]+\//, '');
        }
        try {
          await deleteFile(key);
        } catch (err) {
          console.error('Error deleting trip image from R2:', err);
        }
      }
    }

    await trips.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}

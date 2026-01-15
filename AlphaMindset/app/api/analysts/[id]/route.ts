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
    const analysts = await getCollection('analysts');
    
    // Try ObjectId first, fall back to string if it fails
    let analyst;
    try {
      analyst = await analysts.findOne({ _id: new ObjectId(id) });
    } catch {
      analyst = await analysts.findOne({ _id: id as any });
    }

    if (!analyst) {
      return NextResponse.json({ error: 'Analyst not found' }, { status: 404 });
    }

    // Normalize _id to string
    const normalized = {
      ...analyst,
      _id: analyst._id?.toString?.() ?? analyst._id,
    };

    return NextResponse.json({ analyst: normalized });
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { name, title, bio, photoUrl, availabilitySlots, isActive, order, sectors } =
      await request.json();

    const analysts = await getCollection('analysts');
    
    // Try ObjectId first, fall back to string if it fails
    let result;
    try {
      result = await analysts.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            name,
            title: title || '',
            bio: bio || '',
            photoUrl: photoUrl || '',
            availabilitySlots: availabilitySlots || [],
            isActive,
            order,
            sectors: sectors || [],
            updatedAt: new Date(),
          },
        }
      );
    } catch {
      result = await analysts.updateOne(
        { _id: id as any },
        {
          $set: {
            name,
            title: title || '',
            bio: bio || '',
            photoUrl: photoUrl || '',
            availabilitySlots: availabilitySlots || [],
            isActive,
            order,
            sectors: sectors || [],
            updatedAt: new Date(),
          },
        }
      );
    }

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const analysts = await getCollection('analysts');

    // First, try deleting by ObjectId (normal case)
    let result = { deletedCount: 0 };
    try {
      result = await analysts.deleteOne({ _id: new ObjectId(id) });
    } catch {
      // If ObjectId construction fails, fall back to string _id
      result = await analysts.deleteOne({ _id: id as any });
    }

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

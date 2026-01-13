import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const availabilitySlots = await getCollection('availability_slots');
    const slots = await availabilitySlots.find({}).sort({ dayOfWeek: 1 }).toArray();

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Error fetching availability slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability slots' },
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

    const { dayOfWeek, startTime, endTime, isActive } = await request.json();

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Day of week, start time, and end time are required' },
        { status: 400 }
      );
    }

    const availabilitySlots = await getCollection('availability_slots');
    const result = await availabilitySlots.insertOne({
      dayOfWeek,
      startTime,
      endTime,
      isActive: isActive !== false,
    });

    return NextResponse.json({ success: true, slotId: result.insertedId });
  } catch (error) {
    console.error('Error creating availability slot:', error);
    return NextResponse.json(
      { error: 'Failed to create availability slot' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slots } = await request.json();

    if (!slots || !Array.isArray(slots)) {
      return NextResponse.json(
        { error: 'Invalid slots data' },
        { status: 400 }
      );
    }

    const availabilitySlots = await getCollection('availability_slots');
    
    // Delete all existing slots
    await availabilitySlots.deleteMany({});
    
    // Insert new slots
    if (slots.length > 0) {
      await availabilitySlots.insertMany(slots);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating availability slots:', error);
    return NextResponse.json(
      { error: 'Failed to update availability slots' },
      { status: 500 }
    );
  }
}

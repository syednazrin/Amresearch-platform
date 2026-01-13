import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { tripId, name, email, company, phone, notes } = await request.json();

    if (!tripId || !name || !email) {
      return NextResponse.json(
        { error: 'Trip ID, name, and email are required' },
        { status: 400 }
      );
    }

    // Verify trip exists
    const trips = await getCollection('trips');
    const trip = await trips.findOne({ _id: new ObjectId(tripId) });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Check if trip is upcoming
    const tripDate = new Date(trip.date);
    if (tripDate < new Date()) {
      return NextResponse.json(
        { error: 'Cannot register for past trips' },
        { status: 400 }
      );
    }

    // Create registration
    const registrations = await getCollection('trip_registrations');
    const result = await registrations.insertOne({
      tripId: new ObjectId(tripId),
      name,
      email,
      company: company || '',
      phone: phone || '',
      notes: notes || '',
      status: 'pending',
      createdAt: new Date(),
    });

    return NextResponse.json({ 
      success: true, 
      registrationId: result.insertedId 
    });
  } catch (error) {
    console.error('Error creating trip registration:', error);
    return NextResponse.json(
      { error: 'Failed to register for trip' },
      { status: 500 }
    );
  }
}

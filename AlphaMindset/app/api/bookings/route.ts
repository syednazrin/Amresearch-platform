import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const bookings = await getCollection('bookings');
    
    let query = {};
    if (status) {
      query = { status };
    }

    const bookingsData = await bookings
      .find(query)
      .sort({ date: -1 })
      .toArray();

    // Populate analyst information
    const analysts = await getCollection('analysts');
    const enrichedBookings = await Promise.all(
      bookingsData.map(async (booking) => {
        if (booking.analystId) {
          const analyst = await analysts.findOne({
            _id: new ObjectId(booking.analystId),
          });
          return {
            ...booking,
            analyst: analyst ? {
              _id: analyst._id,
              name: analyst.name,
              title: analyst.title,
            } : null,
          };
        }
        return booking;
      })
    );

    return NextResponse.json({ bookings: enrichedBookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, date, time, duration, notes, analystId } = await request.json();

    if (!name || !email || !date || !time || !duration) {
      return NextResponse.json(
        { error: 'Name, email, date, time, and duration are required' },
        { status: 400 }
      );
    }

    // Parse date and time
    const [hours, minutes] = time.split(':').map(Number);
    const bookingDate = new Date(date);
    bookingDate.setHours(hours, minutes, 0, 0);

    const bookings = await getCollection('bookings');
    const result = await bookings.insertOne({
      name,
      email,
      phone: phone || '',
      date: bookingDate,
      duration,
      notes: notes || '',
      analystId: analystId ? new ObjectId(analystId) : null,
      status: 'pending',
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, bookingId: result.insertedId });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

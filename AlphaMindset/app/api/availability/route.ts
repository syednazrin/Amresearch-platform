import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { startOfDay, endOfDay, addMinutes, format, parse } from 'date-fns';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const analystId = searchParams.get('analystId');

    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const date = new Date(dateParam);
    const dayOfWeek = date.getDay();

    let slots = [];

    // If analystId is provided, get slots from that specific analyst
    if (analystId) {
      const analysts = await getCollection('analysts');
      const analyst = await analysts.findOne({
        _id: new ObjectId(analystId),
        isActive: true,
      });

      if (!analyst || !analyst.availabilitySlots) {
        return NextResponse.json({ availableSlots: [] });
      }

      slots = analyst.availabilitySlots.filter(
        (slot: any) => slot.dayOfWeek === dayOfWeek
      );
    } else {
      // Fallback to old availability_slots collection
      const availabilitySlots = await getCollection('availability_slots');
      slots = await availabilitySlots
        .find({ dayOfWeek, isActive: true })
        .toArray();
    }

    if (slots.length === 0) {
      return NextResponse.json({ availableSlots: [] });
    }

    // Get existing bookings for this date
    const bookings = await getCollection('bookings');
    const existingBookings = await bookings
      .find({
        date: {
          $gte: startOfDay(date),
          $lte: endOfDay(date),
        },
        status: { $ne: 'cancelled' },
      })
      .toArray();

    // Generate available time slots
    const availableSlots: string[] = [];
    
    for (const slot of slots) {
      const [startHour, startMinute] = slot.startTime.split(':').map(Number);
      const [endHour, endMinute] = slot.endTime.split(':').map(Number);
      
      let currentTime = new Date(date);
      currentTime.setHours(startHour, startMinute, 0, 0);
      
      const endTime = new Date(date);
      endTime.setHours(endHour, endMinute, 0, 0);
      
      while (currentTime < endTime) {
        const slotTime = format(currentTime, 'HH:mm');
        
        // Check if this slot is booked
        const isBooked = existingBookings.some((booking) => {
          const bookingTime = format(new Date(booking.date), 'HH:mm');
          return bookingTime === slotTime;
        });
        
        if (!isBooked) {
          availableSlots.push(slotTime);
        }
        
        // Move to next 15-minute slot
        currentTime = addMinutes(currentTime, 15);
      }
    }

    return NextResponse.json({ availableSlots });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

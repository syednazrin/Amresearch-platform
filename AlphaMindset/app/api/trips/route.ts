import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const trips = await getCollection('trips');
    
    let query = {};
    if (upcoming) {
      query = { date: { $gte: new Date() } };
    }

    let queryBuilder = trips.find(query).sort({ date: 1, order: 1 });
    
    if (limit) {
      queryBuilder = queryBuilder.limit(limit);
    }

    const tripsData = await queryBuilder.toArray();

    return NextResponse.json({ trips: tripsData });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
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

    const { companyName, date, location, description, imageUrl } = await request.json();

    if (!companyName || !date || !location) {
      return NextResponse.json(
        { error: 'Company name, date, and location are required' },
        { status: 400 }
      );
    }

    const trips = await getCollection('trips');
    const result = await trips.insertOne({
      companyName,
      date: new Date(date),
      location,
      description: description || '',
      imageUrl: imageUrl || '',
      createdAt: new Date(),
      order: 0,
    });

    return NextResponse.json({ success: true, tripId: result.insertedId });
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}

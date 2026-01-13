import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const MAX_EMBEDS = 3;

export async function GET() {
  try {
    const socialMedia = await getCollection('social_media');
    const embeds = await socialMedia
      .find({})
      .sort({ order: 1 })
      .toArray();

    return NextResponse.json({ embeds });
  } catch (error) {
    console.error('Error fetching social media embeds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social media embeds' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { embedCode, order } = body;

    if (!embedCode || !embedCode.trim()) {
      return NextResponse.json(
        { error: 'Embed code is required' },
        { status: 400 }
      );
    }

    const socialMedia = await getCollection('social_media');
    
    // Check current count
    const currentCount = await socialMedia.countDocuments();
    if (currentCount >= MAX_EMBEDS) {
      return NextResponse.json(
        { error: `Maximum of ${MAX_EMBEDS} Instagram embeds allowed` },
        { status: 400 }
      );
    }

    // Determine order
    let embedOrder = order;
    if (!embedOrder || embedOrder < 1 || embedOrder > MAX_EMBEDS) {
      // Auto-assign order (next available)
      embedOrder = currentCount + 1;
    }

    // If order is taken, shift existing items
    const existingWithOrder = await socialMedia.findOne({ order: embedOrder });
    if (existingWithOrder) {
      // Shift all items with order >= embedOrder
      await socialMedia.updateMany(
        { order: { $gte: embedOrder } },
        { $inc: { order: 1 } }
      );
    }

    const result = await socialMedia.insertOne({
      embedCode: embedCode.trim(),
      order: embedOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      embed: {
        _id: result.insertedId,
        embedCode: embedCode.trim(),
        order: embedOrder,
      },
    });
  } catch (error) {
    console.error('Error creating social media embed:', error);
    return NextResponse.json(
      { error: 'Failed to create social media embed' },
      { status: 500 }
    );
  }
}

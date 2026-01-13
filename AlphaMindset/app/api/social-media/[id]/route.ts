import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
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
    const objectId = new ObjectId(id);

    // Check if embed exists
    const existing = await socialMedia.findOne({ _id: objectId });
    if (!existing) {
      return NextResponse.json(
        { error: 'Social media embed not found' },
        { status: 404 }
      );
    }

    // If order is being changed, handle reordering
    if (order && order !== existing.order) {
      const oldOrder = existing.order;
      const newOrder = order;

      if (newOrder < 1 || newOrder > 3) {
        return NextResponse.json(
          { error: 'Order must be between 1 and 3' },
          { status: 400 }
        );
      }

      // Shift other items
      if (newOrder > oldOrder) {
        // Moving down: shift items between old and new order up
        await socialMedia.updateMany(
          { _id: { $ne: objectId }, order: { $gt: oldOrder, $lte: newOrder } },
          { $inc: { order: -1 } }
        );
      } else {
        // Moving up: shift items between new and old order down
        await socialMedia.updateMany(
          { _id: { $ne: objectId }, order: { $gte: newOrder, $lt: oldOrder } },
          { $inc: { order: 1 } }
        );
      }
    }

    const updateData: any = {
      embedCode: embedCode.trim(),
      updatedAt: new Date(),
    };

    if (order) {
      updateData.order = order;
    }

    await socialMedia.updateOne(
      { _id: objectId },
      { $set: updateData }
    );

    const updated = await socialMedia.findOne({ _id: objectId });

    return NextResponse.json({
      success: true,
      embed: updated,
    });
  } catch (error) {
    console.error('Error updating social media embed:', error);
    return NextResponse.json(
      { error: 'Failed to update social media embed' },
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
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const socialMedia = await getCollection('social_media');
    const objectId = new ObjectId(id);

    // Get the embed to know its order
    const embed = await socialMedia.findOne({ _id: objectId });
    if (!embed) {
      return NextResponse.json(
        { error: 'Social media embed not found' },
        { status: 404 }
      );
    }

    // Delete the embed
    await socialMedia.deleteOne({ _id: objectId });

    // Shift remaining items down
    await socialMedia.updateMany(
      { order: { $gt: embed.order } },
      { $inc: { order: -1 } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting social media embed:', error);
    return NextResponse.json(
      { error: 'Failed to delete social media embed' },
      { status: 500 }
    );
  }
}

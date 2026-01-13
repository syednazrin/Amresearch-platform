import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    
    // Check if user is super admin
    if (!session?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const { id } = await params;
    
    const users = await getCollection('users');
    
    // Check if user is trying to delete themselves or another super admin
    const userToDelete = await users.findOne({ _id: new ObjectId(id) });
    
    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (userToDelete.isSuperAdmin) {
      return NextResponse.json({ error: 'Cannot delete super admin' }, { status: 400 });
    }
    
    if (userToDelete._id.toString() === session.userId) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }
    
    // Delete user
    await users.deleteOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

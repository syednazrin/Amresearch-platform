import { NextRequest, NextResponse } from 'next/server';
import { getSession, hashPassword } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getSession();
    
    // Check if user is super admin
    if (!session?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const users = await getCollection('users');
    const allUsers = await users
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Remove passwords from response
    const sanitizedUsers = allUsers.map(user => ({
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin || false,
      createdAt: user.createdAt,
    }));
    
    return NextResponse.json({ users: sanitizedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    // Check if user is super admin
    if (!session?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const body = await request.json();
    const { email, password, name, isAdmin } = body;
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    const users = await getCollection('users');
    
    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    
    // Create new user
    const hashedPassword = await hashPassword(password);
    const result = await users.insertOne({
      email,
      password: hashedPassword,
      name: name || '',
      isAdmin: isAdmin || false,
      isSuperAdmin: false,
      createdAt: new Date(),
    });
    
    return NextResponse.json({
      user: {
        _id: result.insertedId.toString(),
        email,
        name,
        isAdmin: isAdmin || false,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

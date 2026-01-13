import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getCollection } from './mongodb';
import { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  email: string;
  password: string;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  name?: string;
  createdAt: Date;
}

export interface Session {
  userId: string;
  email: string;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
}

const SALT_ROUNDS = 10;
const SESSION_COOKIE_NAME = 'aminvest_session';

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Create session
export async function createSession(user: User): Promise<string> {
  const session: Session = {
    userId: user._id.toString(),
    email: user.email,
    isAdmin: user.isAdmin,
    isSuperAdmin: user.isSuperAdmin || false,
  };
  
  // Simple base64 encoding for session data
  // In production, consider using JWT or a more secure method
  const sessionData = Buffer.from(JSON.stringify(session)).toString('base64');
  
  return sessionData;
}

// Set session cookie
export async function setSessionCookie(sessionData: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Get session from cookie
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    
    if (!sessionCookie) {
      return null;
    }
    
    const sessionData = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
    const session: Session = JSON.parse(sessionData);
    
    return session;
  } catch (error) {
    return null;
  }
}

// Clear session
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.isAdmin === true;
}

// Check if user is super admin
export async function isSuperAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.isSuperAdmin === true;
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getCollection('users');
  return users.findOne({ email }) as Promise<User | null>;
}

// Create admin user if it doesn't exist
export async function ensureAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@aminvest.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const superAdminEmail = process.env.SUPERADMIN_EMAIL || 'superadmin@aminvest.com';
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD || 'superadmin123';
  
  const existingAdmin = await getUserByEmail(adminEmail);
  const existingSuperAdmin = await getUserByEmail(superAdminEmail);
  
  const users = await getCollection('users');
  
  if (!existingAdmin) {
    const hashedPassword = await hashPassword(adminPassword);
    
    await users.insertOne({
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin User',
      isAdmin: true,
      isSuperAdmin: false,
      createdAt: new Date(),
    } as any);
    
    console.log('Admin user created:', adminEmail);
  }
  
  if (!existingSuperAdmin) {
    const hashedPassword = await hashPassword(superAdminPassword);
    
    await users.insertOne({
      email: superAdminEmail,
      password: hashedPassword,
      name: 'Super Admin',
      isAdmin: true,
      isSuperAdmin: true,
      createdAt: new Date(),
    } as any);
    
    console.log('Super admin user created:', superAdminEmail);
  }
}

// Authenticate user
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email);
  
  if (!user) {
    return null;
  }
  
  const isValid = await verifyPassword(password, user.password);
  
  if (!isValid) {
    return null;
  }
  
  return user;
}

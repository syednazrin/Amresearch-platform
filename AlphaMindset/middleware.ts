import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is an admin route
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('aminvest_session');
    
    if (!sessionCookie) {
      // Redirect to login if no session
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    try {
      // Decode and verify session
      const sessionData = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
      const session = JSON.parse(sessionData);
      
      if (!session.isAdmin) {
        // Redirect to login if not admin
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      // Invalid session, redirect to login
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

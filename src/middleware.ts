import { auth } from './auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === '/login') {
    if (session) {
      // Redirect authenticated users to their dashboard
      return NextResponse.redirect(new URL(getDashboardUrl(session.user.role), request.url));
    }
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const userRole = session.user.role;

  // Role-based access control
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'ADMINISTRATOR') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  if (pathname.startsWith('/manager')) {
    if (userRole !== 'MANAGER' && userRole !== 'ADMINISTRATOR') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  if (pathname.startsWith('/member')) {
    if (userRole !== 'MEMBER') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

function getDashboardUrl(role: string): string {
  switch (role) {
    case 'ADMINISTRATOR':
      return '/admin';
    case 'MANAGER':
      return '/manager';
    case 'MEMBER':
      return '/member';
    default:
      return '/login';
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/manager/:path*',
    '/member/:path*',
    '/login',
  ],
};

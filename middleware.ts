import { betterFetch } from '@better-fetch/fetch';
import { NextResponse, type NextRequest } from 'next/server';
import type { Session } from '@/auth';
import { getSessionCookie } from 'better-auth/cookies';

const authRoutes = ['/sign-in', '/sign-up'];
const passwordRoutes = ['/reset-password', '/forgot-password'];
const adminRoutes = ['/admin'];

export default async function authMiddleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.includes(pathName);
  const isPasswordRoute = passwordRoutes.includes(pathName);
  const isAdminRoute = adminRoutes.includes(pathName);
  const isHomePage = pathName === '/';

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    if (isAuthRoute || isPasswordRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // If user is authenticated and trying to access  home page, redirect to passes
  if (sessionCookie && isHomePage) {
    return NextResponse.redirect(new URL('/passes', request.url));
  }

  if (isAdminRoute) {
    const { data: session } = await betterFetch<Session>('/api/auth/get-session', {
      baseURL: process.env.BETTER_AUTH_URL,
      headers: {
        //get the cookie from the request
        cookie: request.headers.get('cookie') || '',
      },
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};

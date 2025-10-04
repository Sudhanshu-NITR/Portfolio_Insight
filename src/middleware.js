// middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const url = req.nextUrl.clone();
  const pathname = req.nextUrl.pathname;

  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  // If a logged-in user visits an auth page, send them to the dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If not logged in and trying to access a protected route (middleware runs only for protected matcher),
  // redirect to sign in page.
  if (!token && !isAuthPage) {
    url.pathname = '/sign-in';
    // Optionally include original path as callbackUrl / redirect param
    url.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on pages that need protection
  matcher: [
    '/dashboard/:path*',
    '/dashboard',
    '/portfolio/:path*',
    '/profile/:path*',
    // add any other protected paths here
  ],
};

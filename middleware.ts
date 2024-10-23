// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
// import { NextResponse } from 'next/server'

// const isProtectedRoute = createRouteMatcher([
//   '/shows/:path*',
//   '/((?!sign-in|sign-up).*)'
// ]);


// export default clerkMiddleware((auth, request) => {
//   if (isProtectedRoute(request)) {
//     auth().protect();
//   }
//   return NextResponse.next(); 
// })

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files
//     '/((?!_next/static|_next/image|favicon.ico).*)',
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     // Always run for API routes
//     '/(api|trpc)(.*)',
//     '/(.*)', 
//     '/',
//   ],
// }

// import { clerkMiddleware } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// console.log('hits this code');

// export default clerkMiddleware((auth, request) => {
//   console.log('request: ', request);
//   console.log('auth: ', auth);
//   // Handle users who aren't authenticated
//   if (!auth().userId && !request.url.includes('/sign-in') && !request.url.includes('/sign-up')) {
//     const signInUrl = new URL('/sign-in', request.url);
//     signInUrl.searchParams.set('redirect_url', request.url);
//     return NextResponse.redirect(signInUrl);
//   }

//   return NextResponse.next();
// });

// export const config = {
//   matcher: [
//     "/((?!.+\\.[\\w]+$|_next).*)",
//     "/",
//     "/(api|trpc)(.*)",
//   ],
// };


import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public paths that don't require authentication
const publicPaths = ['/sign-in', '/sign-up', '/api/webhook'];

export default clerkMiddleware((auth, req) => {
  console.log('Request URL:', req.url);

  const url = new URL(req.url);
  
  // If the path is public, allow access
  if (publicPaths.some(path => url.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check authentication
  if (!auth().userId) {
    // For API requests, return 401 instead of redirecting
    if (url.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // For page requests, redirect to sign-in
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    console.log('Redirecting to:', signInUrl.toString());
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/api/:path*"
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  logSecurityEvent,
  createSecurityLog,
  logAdminApiRequest,
  logAdminApiSuccess,
  logAdminApiError,
} from '@/utils/security-logger';

// Helper function to apply consistent CORS headers across all responses
// This ensures our application maintains proper cross-origin resource sharing rules
function corsResponse(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Determine the correct origin based on environment
  const origin =
    process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_FRONTEND_URL ||
        'https://unicas-frontend-nuevaui.up.railway.app'
      : 'http://localhost:3000';

  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET,DELETE,PATCH,POST,PUT,OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  return response;
}

// Creates standardized error responses with appropriate status codes and CORS headers
function createErrorResponse(message: string, status: number) {
  return corsResponse(
    new NextResponse(JSON.stringify({ message }), {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  );
}

// Validates and decodes JWT tokens, checking for expiration
function decodeToken(token: string) {
  try {
    const [, payload] = token.split('.');
    const decodedPayload = JSON.parse(atob(payload));

    // Verify token hasn't expired
    const now = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp && decodedPayload.exp < now) {
      throw new Error('Token expired');
    }

    return decodedPayload;
  } catch (error) {
    return null;
  }
}

// Determines if a route requires admin privileges
function isAdminRoute(pathname: string): boolean {
  const adminRoutes = [
    '/admin',
    '/prestamo',
    '/api/users',
    '/api/juntas',
    '/api/members',
    '/api/assemblies',
    '/api/capital',
    '/api/multas',
    '/api/prestamos',
  ];

  return adminRoutes.some((route) => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return corsResponse(new NextResponse(null, { status: 200 }));
  }

  // Extract token from cookies and get the requested path
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Allow access to public routes without authentication
  if (
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname === '/' ||
    pathname.startsWith('/auth/') ||
    pathname.includes('/auth/') ||
    pathname === '/api/health'
  ) {
    return corsResponse(NextResponse.next());
  }

  // Handle cases where no token is provided
  if (!token) {
    logSecurityEvent(
      createSecurityLog(request, 'UNAUTHORIZED', {
        reason: 'No token provided',
      })
    );

    if (pathname.startsWith('/api/')) {
      return createErrorResponse('Authentication required', 401);
    }

    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return corsResponse(NextResponse.redirect(signInUrl));
  }

  // Validate and decode the provided token
  const decodedToken = decodeToken(token);
  if (!decodedToken) {
    logSecurityEvent(
      createSecurityLog(request, 'TOKEN_INVALID', {
        reason: 'Token validation failed',
      })
    );

    if (pathname.startsWith('/api/')) {
      return createErrorResponse('Invalid token', 401);
    }

    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return corsResponse(NextResponse.redirect(signInUrl));
  }

  // Handle admin route access control
  if (isAdminRoute(pathname)) {
    const isApiRequest = pathname.startsWith('/api/');

    // Log all attempts to access admin routes
    if (isApiRequest) {
      logAdminApiRequest(request, decodedToken.sub, decodedToken.role);
    } else {
      logSecurityEvent(
        createSecurityLog(request, 'ACCESS_ATTEMPT', {
          userId: decodedToken.sub,
          role: decodedToken.role,
        })
      );
    }

    // Verify admin role and handle unauthorized access
    if (decodedToken.role !== 'ADMIN') {
      if (isApiRequest) {
        logAdminApiError(
          request,
          decodedToken.sub,
          decodedToken.role,
          403,
          'Insufficient permissions for admin route'
        );
      } else {
        logSecurityEvent(
          createSecurityLog(request, 'ACCESS_DENIED', {
            userId: decodedToken.sub,
            role: decodedToken.role,
            reason: 'Insufficient permissions for admin route',
          })
        );
      }

      if (isApiRequest) {
        return createErrorResponse('Admin access required', 403);
      }
      return corsResponse(NextResponse.redirect(new URL('/', request.url)));
    }

    // Log successful admin access
    if (isApiRequest) {
      logAdminApiSuccess(request, decodedToken.sub, decodedToken.role, 200);
    } else {
      logSecurityEvent(
        createSecurityLog(request, 'ADMIN_ACCESS', {
          userId: decodedToken.sub,
          role: decodedToken.role,
        })
      );
    }
  }

  // Handle access control for junta-specific routes
  if (pathname.startsWith('/juntas/')) {
    const allowedRoles = ['ADMIN', 'FACILITADOR'];
    if (!allowedRoles.includes(decodedToken.role)) {
      logSecurityEvent(
        createSecurityLog(request, 'ACCESS_DENIED', {
          userId: decodedToken.sub,
          role: decodedToken.role,
          reason: 'Insufficient permissions for juntas route',
        })
      );

      if (pathname.startsWith('/api/')) {
        return createErrorResponse('Insufficient permissions', 403);
      }
      return corsResponse(NextResponse.redirect(new URL('/', request.url)));
    }
  }

  // Allow the request to proceed if all checks pass
  return corsResponse(NextResponse.next());
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Match all paths except Next.js internal routes
    '/((?!api/health|_next/static|_next/image|favicon.ico).*)',
  ],
};

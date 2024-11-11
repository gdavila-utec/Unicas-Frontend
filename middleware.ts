import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  logSecurityEvent,
  createSecurityLog,
  logAdminApiRequest,
  logAdminApiSuccess,
  logAdminApiError,
} from '@/utils/security-logger';

// Helper function to handle CORS
function corsResponse(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Allow both development and production origins
  const origin =
    process.env.NODE_ENV === 'production'
      ? 'https://unicas-frontend-production.up.railway.app'
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

// Helper function to create error response
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

// Helper function to decode and validate JWT
function decodeToken(token: string) {
  try {
    const [, payload] = token.split('.');
    const decodedPayload = JSON.parse(atob(payload));

    // Check token expiration
    const now = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp && decodedPayload.exp < now) {
      throw new Error('Token expired');
    }

    return decodedPayload;
  } catch (error) {
    return null;
  }
}

// Helper to check if route requires admin access
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

  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  if (
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname === '/' ||
    pathname.startsWith('/auth/') ||
    pathname.includes('/auth/')
  ) {
    return corsResponse(NextResponse.next());
  }

  // Check if user is authenticated
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

  // Decode and validate token
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

  // Check admin access for protected routes
  if (isAdminRoute(pathname)) {
    const isApiRequest = pathname.startsWith('/api/');

    // Log admin route access attempt
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

    if (decodedToken.role !== 'ADMIN') {
      // Log denied admin access
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

  // Handle specific role-based access for other routes
  if (pathname.startsWith('/juntas/')) {
    const allowedRoles = ['ADMIN', 'FACILITADOR'];
    if (!allowedRoles.includes(decodedToken.role)) {
      // Log denied access to juntas
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

  return corsResponse(NextResponse.next());
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

type SecurityEvent = {
  timestamp: string;
  type:
    | 'ACCESS_ATTEMPT'
    | 'ACCESS_DENIED'
    | 'TOKEN_INVALID'
    | 'UNAUTHORIZED'
    | 'ADMIN_ACCESS'
    | 'ADMIN_API_REQUEST'
    | 'ADMIN_API_SUCCESS'
    | 'ADMIN_API_ERROR';
  pathname: string;
  method: string;
  ip?: string;
  userId?: string;
  role?: string;
  reason?: string;
  requestData?: {
    endpoint: string;
    action?: string;
    params?: Record<string, unknown>;
    statusCode?: number;
  };
};

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0];
  }

  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

export function logSecurityEvent(event: SecurityEvent) {
  // Add request timestamp if not provided
  const eventWithTimestamp = {
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  };

  // In development, log to console with formatted output
  if (process.env.NODE_ENV === 'development') {
    const formattedEvent = {
      ...eventWithTimestamp,
      timestamp: new Date(eventWithTimestamp.timestamp).toLocaleString(),
    };

    console.log('\n[Security Event]', {
      ...formattedEvent,
      type: `[${formattedEvent.type}]`.padEnd(20),
      method: formattedEvent.method.padEnd(7),
    });
    return;
  }

  // In production, send to logging service
  try {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/security-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any required API key or authentication
      },
      body: JSON.stringify(eventWithTimestamp),
    }).catch((error) => {
      console.error('[Security Logger Error]', error);
    });
  } catch (error) {
    // Fail silently in production, but keep error in console
    console.error('[Security Logger Error]', error);
  }
}

export function createSecurityLog(
  request: Request,
  type: SecurityEvent['type'],
  details: {
    userId?: string;
    role?: string;
    reason?: string;
    requestData?: SecurityEvent['requestData'];
  } = {}
): SecurityEvent {
  const url = new URL(request.url);

  return {
    timestamp: new Date().toISOString(),
    type,
    pathname: url.pathname,
    method: request.method,
    ip: getClientIP(request),
    ...details,
  };
}

// Helper to extract request details for API logging
export function extractRequestDetails(request: Request) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);

  return {
    endpoint: url.pathname,
    action: pathParts[pathParts.length - 1],
    params: Object.fromEntries(url.searchParams),
  };
}

// Specific logging functions for API requests
export function logAdminApiRequest(
  request: Request,
  userId: string,
  role: string
) {
  const requestData = extractRequestDetails(request);

  logSecurityEvent(
    createSecurityLog(request, 'ADMIN_API_REQUEST', {
      userId,
      role,
      requestData,
    })
  );
}

export function logAdminApiSuccess(
  request: Request,
  userId: string,
  role: string,
  statusCode: number
) {
  const requestData = {
    ...extractRequestDetails(request),
    statusCode,
  };

  logSecurityEvent(
    createSecurityLog(request, 'ADMIN_API_SUCCESS', {
      userId,
      role,
      requestData,
    })
  );
}

export function logAdminApiError(
  request: Request,
  userId: string,
  role: string,
  statusCode: number,
  reason: string
) {
  const requestData = {
    ...extractRequestDetails(request),
    statusCode,
  };

  logSecurityEvent(
    createSecurityLog(request, 'ADMIN_API_ERROR', {
      userId,
      role,
      reason,
      requestData,
    })
  );
}

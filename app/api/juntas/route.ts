import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { getToken, userId } = getAuth(request)
    
    // Get session token
    const token = await getToken()
    
    // Debug token information
    const tokenInfo = token ? {
      hasToken: true,
      hasUserId: !!userId,
      tokenLength: token.length,
      // Parse token parts (it's safe as it's just for debugging)
      parts: token.split('.').map((part, i) => {
        try {
          return i !== 2 ? JSON.parse(atob(part)) : 'signature';
        } catch (e) {
          return `Error parsing part ${i}`;
        }
      })
    } : { hasToken: false };

    console.log('Token debug info:', tokenInfo);

    if (!token || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/juntas/`;
    console.log('apiUrl: ', apiUrl);
    
    // Add debug headers
    const requestHeaders = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Debug-Token-Length': token.length.toString(),
      'X-Debug-User-ID': userId,
    };

    console.log('Making request to:', apiUrl);
    console.log('With headers:', requestHeaders);

    const response = await fetch(apiUrl, {
      headers: requestHeaders,
      cache: 'no-store'
    });

    // Log detailed response information
    console.log('Response debug:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: "API request failed",
          status: response.status,
          details: responseText,
          debug: {
            userId,
            tokenLength: token.length,
            requestUrl: apiUrl
          }
        },
        { status: response.status }
      );
    }

    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      return NextResponse.json(
        { error: "Invalid JSON response from server" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        debug: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : undefined
      },
      { status: 500 }
    );
  }
}
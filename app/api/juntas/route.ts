import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { getToken, userId } = getAuth(request)
    
    // Get the session token without specifying a template
    const token = await getToken()
    
    console.log('Auth info:', {
      hasToken: !!token,
      hasUserId: !!userId,
      tokenLength: token?.length
    });

    if (!token || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/juntas/`;
    console.log('Fetching from:', apiUrl);

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    console.log('Request headers:', headers);

    const response = await fetch(apiUrl, {
      headers,
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });

      return NextResponse.json(
        { 
          error: "API request failed",
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getToken, userId } = getAuth(request)
    const token = await getToken()
    const body = await request.json()

    if (!token || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/juntas/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('POST error:', {
        status: response.status,
        body: errorText
      });
      
      return NextResponse.json(
        { error: "Failed to create junta", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
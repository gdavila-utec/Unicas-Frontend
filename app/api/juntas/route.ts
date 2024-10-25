import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { getToken, userId } = getAuth(request);
    const token = await getToken();

    if (!token || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiUrl = 'http://localhost:3000/api/juntas/';

    const requestHeaders = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    const response = await fetch(apiUrl, {
      headers: requestHeaders,
      cache: 'no-store',
    });

    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'API request failed',
          status: response.status,
          details: responseText,
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
        { error: 'Invalid JSON response from server' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getToken, userId } = getAuth(request);
    const token = await getToken();

    if (!token || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const apiUrl = 'http://localhost:3000/api/juntas/';

    const requestHeaders = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(body),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'API request failed',
          status: response.status,
          details: responseText,
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
        { error: 'Invalid JSON response from server' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

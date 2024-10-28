import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Mark route as dynamic since it uses headers
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Add error handling for the API URL
    if (!process.env.NEXT_PUBLIC_API_URL) {
      throw new Error('API URL is not configured');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API error:', {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      });
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

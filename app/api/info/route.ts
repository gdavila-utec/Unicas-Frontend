import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Mark route as dynamic since it uses headers
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch info');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching info:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

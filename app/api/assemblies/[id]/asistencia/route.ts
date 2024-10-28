import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/assemblies/${params.id}/asistencia`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch assembly attendance');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching assembly attendance:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/assemblies/${params.id}/asistencia`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to record assembly attendance');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error recording assembly attendance:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

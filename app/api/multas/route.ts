import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];
    const { searchParams } = new URL(request.url);
    const juntaId = searchParams.get('juntaId');

    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/multas/junta/${juntaId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch multas');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching multas:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/multas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: body.amount,
        description: body.description,
        juntaId: body.juntaId,
        memberId: body.memberId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create multa');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating multa:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

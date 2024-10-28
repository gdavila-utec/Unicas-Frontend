import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/capital/social`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: body.amount,
          juntaId: body.juntaId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create capital social');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating capital social:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

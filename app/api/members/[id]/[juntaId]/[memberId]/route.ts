import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { juntaId: string; memberId: string } }
) {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/members/${params.juntaId}/add/${params.memberId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to add member to junta');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding member to junta:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { juntaId: string; memberId: string } }
) {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/members/${params.juntaId}/${params.memberId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to remove member from junta');
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error removing member from junta:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

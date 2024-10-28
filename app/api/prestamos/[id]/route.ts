import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/prestamos/junta/${params.id}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const users = await response.json();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error handling GET request:', error);
    return NextResponse.json(
      { error: 'Failed to handle GET request' },
      { status: 500 }
    );
  }
}

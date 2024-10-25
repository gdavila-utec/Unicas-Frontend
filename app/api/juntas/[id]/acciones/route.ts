// app/api/acciones/route.ts
import { NextRequest, NextResponse } from 'next/server';
// Import getAuth for authentication
import { getAuth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { getToken } = getAuth(request);
  const token = await getToken();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/acciones/junta/${params.id}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const acciones = await response.json(); // Get acciones from the response
  return NextResponse.json(acciones);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { getToken } = getAuth(request);
    const token = await getToken();
    const data = await request.json();
    const jsonBody = {
      member: data.member,
      date: data.date,
      quantity: data.quantity,
      value: data.value,
      junta: params.id,
    };
    console.log(jsonBody);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/acciones/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jsonBody),
      }
    );
    const message = await response.json();
    console.log(message);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return NextResponse.json(jsonBody, { status: 201 });
  } catch (error) {
    console.error('Error posting accion:', error);
    return NextResponse.json(
      { error: 'Failed to post accion' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { getToken } = getAuth(request);
    const token = await getToken();
    const data = await request.json();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/acciones/${data.id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return NextResponse.json(
      { message: 'Accion deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting accion:', error);
    return NextResponse.json(
      { error: 'Failed to delete accion' },
      { status: 500 }
    );
  }
}

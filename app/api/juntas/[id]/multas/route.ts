// app/api/multas/route.js
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
    `${process.env.NEXT_PUBLIC_API_URL}/api/multas/junta/${params.id}`,
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
  const multas = await response.json(); // Get multas from the response
  return NextResponse.json(multas);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { getToken } = getAuth(request);
    const token = await getToken();
    const data = await request.json();
    const body = { ...data, junta: params.id };
    const jsonBody = JSON.stringify(body);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/multas/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: jsonBody,
    });

    const message = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error posting multa:', error);
    return NextResponse.json(
      { error: 'Failed to post multa' },
      { status: 500 }
    );
  }
}

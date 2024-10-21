// app/api/multas/route.js
import { NextRequest, NextResponse } from 'next/server';
// Import getAuth for authentication
import { getAuth } from '@clerk/nextjs/server';

// DELETE method
export async function DELETE(request: NextRequest, { params }: { params: { id: string, slug: string } }) {
  try {
    const { getToken } = getAuth(request);
    const token = await getToken();
    console.log('Junta id:', params.id);
    console.log('Multa slug:', params.slug);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/multas/${params.slug}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return NextResponse.json({ message: 'Multa deleted successfully' });
  } catch (error) {
    console.error('Error deleting multa:', error);
    return NextResponse.json({ error: 'Failed to delete multa' }, { status: 500 });
  }
}

// PUT method
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { getToken } = getAuth(request);
    const token = await getToken();
    const data = await request.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/multas/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const updatedMulta = await response.json();
    return NextResponse.json(updatedMulta);
  } catch (error) {
    console.error('Error updating multa:', error);
    return NextResponse.json({ error: 'Failed to update multa' }, { status: 500 });
  }
}

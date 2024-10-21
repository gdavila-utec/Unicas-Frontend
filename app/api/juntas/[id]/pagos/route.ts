import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { getToken } = getAuth(request);
    const token = await getToken();
    const data = await request.json();

    console.log('data')

    console.log(data)
    // Format the date as YYYY-MM-DD
    const formattedDate = new Date(data.date).toISOString().split('T')[0];
    const jsonBody = {
      'member': data.member,
      'fecha_pago': formattedDate,
      'prestamo': data.loan,
      'custom_amount': data.custom_amount, // New field
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pagosprestamos/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(jsonBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return NextResponse.json(await response.json(), { status: 201 });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

  export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { getToken } = getAuth(request);
    const token = await getToken();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pagosprestamos/junta/${params.id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const paymentData = await response.json();
    console.log(paymentData)
    return NextResponse.json(paymentData);
  } catch (error) {
    console.error('Error fetching payment data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
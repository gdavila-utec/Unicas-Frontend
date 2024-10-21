// app/api/loan-payments/route.ts
import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Fetch loan payments from an external API instead of using the local array
  const { getToken } = getAuth(request)
  const token = await getToken()

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prestamos/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  // if (!response.ok) {
  //   throw new Error(`HTTP error! status: ${response.status}`);
  // }
  // const loanPayments = await response.json(); // Get loan payments from the response
  // return NextResponse.json(loanPayments);
  return NextResponse.json({});
}

export async function POST(request: NextRequest) {
  // try {
    const { getToken } = getAuth(request)
    const token = await getToken()
    const data = await request.json();
    const jsonBody = JSON.stringify(data)
    console.log(jsonBody)
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prestamos/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: jsonBody,
      }
    )

    const responseData = await response.json()
    console.log(responseData)
    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`)
    // }
    // return NextResponse.json(data, { status: 201 });
    
    // return NextResponse.json(responseData, { status: 201 });
    return NextResponse.json({})
  // } catch (error) {
  //   console.error('Error posting loan payment:', error);
  //   return NextResponse.json({ error: 'Failed to post loan payment' }, { status: 500 });
  // }
}

export async function DELETE(request: NextRequest) {
  try {
    const { getToken } = getAuth(request)
    const token = await getToken()
    const { id } = await request.json(); // Expecting an ID in the request body

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prestamos/${id}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return NextResponse.json({ message: 'Loan payment deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting loan payment:', error);
    return NextResponse.json({ error: 'Failed to delete loan payment' }, { status: 500 });
  }
}

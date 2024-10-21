import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { getToken } = getAuth(request);
    const token = await getToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/capital/gasto/`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id: params.id })
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const capitalSocial = await response.json(); // Get multas from the response
    return NextResponse.json(capitalSocial);
}

export async function POST(request: NextRequest) {
    const { getToken } = getAuth(request);
    const token = await getToken();
    const body = await request.json();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/capital/gasto/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            type: body.type,
            amount: body.amount,
            capital_social: body.capital_social,
            description: body.description
        })
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const capitalSocial = await response.json(); // Get multas from the response
    return NextResponse.json(capitalSocial);
}


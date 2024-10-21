import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { getToken } = getAuth(request);
    const token = await getToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/capital/ingreso/`, {
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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    // try {
        const { getToken } = getAuth(request);
        const token = await getToken();
        const body = await request.json(); 
        console.log(body);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/capital/ingreso/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                type : body.type,
                amount: body.amount,
                capital_social: body.capital_social
                // junta: params.id
            })
        });
        const data = await response.json();
        console.log(data);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // const capitalSocial = await response.json(); // Get multas from the response
        return NextResponse.json(body);
    // } catch (error) {
    //     return NextResponse.json({ error: 'Failed to add capital' }, { status: 500 });
    // }

}
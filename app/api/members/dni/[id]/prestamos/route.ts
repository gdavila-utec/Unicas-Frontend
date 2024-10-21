import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server'
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { getToken } = getAuth(request)
        const token = await getToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/members/dni/${params.id}/prestamos/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        })
        const users = await response.json();
        return NextResponse.json(users)
    } catch (error) {
        console.error('Error handling GET request:', error);
        return NextResponse.json({ error: 'Failed to handle GET request' }, { status: 500 });
    }
}
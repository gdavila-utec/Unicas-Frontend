import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server'
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { getToken } = getAuth(request)
        const token = await getToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/junta-users/${params.id}/`, {
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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { getToken } = getAuth(request);
        const token = await getToken();
        const requestBody = await request.json();

        // Create the user
        const userData = {
            is_superuser: requestBody.is_superuser,
            document_type: requestBody.document_type,
            full_name: `${requestBody.first_name} ${requestBody.last_name}`,
            first_name: requestBody.first_name,
            last_name: requestBody.last_name,
            document_number: requestBody.document_number,
            birth_date: requestBody.birth_date,
            province: requestBody.province,
            district: requestBody.district,
            address: requestBody.address,
            username: requestBody.document_number,
        };

        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!userResponse.ok) {
            const errorData = await userResponse.json();
            return NextResponse.json(errorData.detail, { status: userResponse.status });
        }

        const newUser = await userResponse.json();

        // Add the user to the junta
        const juntaResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/juntas/add`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                junta_id: params.id,
                user_id: newUser.id,
            }),
        });

        if (!juntaResponse.ok) {
            return NextResponse.json({ error: 'Failed to add user to junta' }, { status: juntaResponse.status });
        }

        return NextResponse.json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const { getToken } = getAuth(request)
    const token = await getToken()
    const requestBody = await request.json()
    console.log(requestBody)
    if (requestBody.id) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${requestBody.id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to delete user' }, { status: response.status });
        }
        return NextResponse.json("deleted")
    }
}




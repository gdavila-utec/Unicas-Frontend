import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { getToken } = getAuth(request);
    const token = await getToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({ error: 'Missing junta ID' }, { status: 400 });
    }
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}}/api/junta-users/${data.id}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: response.status }
      );
    }

    const users = await response.json();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getToken } = getAuth(request);
    const token = await getToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestBody = await request.json();

    // Create the user with explicit typing
    const userData = {
      is_superuser: Boolean(requestBody.is_superuser),
      document_type: String(requestBody.document_type),
      full_name: `${requestBody.first_name} ${requestBody.last_name}`,
      first_name: String(requestBody.first_name),
      last_name: String(requestBody.last_name),
      document_number: String(requestBody.document_number),
      birth_date: requestBody.birth_date
        ? new Date(requestBody.birth_date).toISOString().split('T')[0]
        : null,
      province: String(requestBody.province || ''),
      district: String(requestBody.district || ''),
      address: String(requestBody.address || ''),
      username: String(requestBody.document_number),
      email: `${requestBody.document_number}@example.com`, // Add default email if required
    };

    console.log('Creating user with data:', userData);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to create user' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { getToken } = getAuth(request);
    const token = await getToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestBody = await request.json();
    if (!requestBody.id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/${requestBody.id}/`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

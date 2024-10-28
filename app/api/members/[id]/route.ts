import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`/api/junta-users/${params.id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch member' },
        { status: response.status }
      );
    }

    const users = await response.json();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error handling GET request:', error);
    return NextResponse.json(
      { error: 'Failed to handle GET request' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];

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

    // First API call to create user
    const userResponse = await fetch(`/api/users/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to create user' },
        { status: userResponse.status }
      );
    }

    const newUser = await userResponse.json();

    // Ensure newUser has an id before proceeding
    if (!newUser.id) {
      return NextResponse.json(
        { error: 'Invalid user response - missing ID' },
        { status: 500 }
      );
    }

    // Second API call to add user to junta
    const juntaResponse = await fetch(`/api/juntas/add`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        junta_id: Number(params.id),
        user_id: Number(newUser.id),
      }),
    });

    if (!juntaResponse.ok) {
      // Try to get error details from response
      let errorMessage;
      try {
        const errorData = await juntaResponse.json();
        errorMessage = errorData.detail || 'Failed to add user to junta';
      } catch {
        errorMessage = 'Failed to add user to junta';
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: juntaResponse.status }
      );
    }

    // Ensure we're returning a serializable object
    const responseData = {
      id: newUser.id,
      username: newUser.username,
      full_name: newUser.full_name,
      document_type: newUser.document_type,
      document_number: newUser.document_number,
      birth_date: newUser.birth_date,
      province: newUser.province,
      district: newUser.district,
      address: newUser.address,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestBody = await request.json();
    if (!requestBody.id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    const response = await fetch(`/api/users/${requestBody.id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

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

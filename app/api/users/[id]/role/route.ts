import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { useAuth } from '@/hooks/useAuth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { isAuthenticated, isAdmin, role } = useAuth();
  try {
    // const headersList = headers();
    // const token = headersList.get('authorization')?.split('Bearer ')[1];

    if (!isAuthenticated) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if the user is an admin
    if (!isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // const { role } = await request.json();

    // Validate role
    const validRoles = ['admin', 'user', 'member'];
    if (role === null || !validRoles.includes(role)) {
      return new NextResponse('Invalid role', { status: 400 });
    }

    return new NextResponse('Role updated successfully', { status: 200 });
  } catch (error) {
    console.error('Error updating user role:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

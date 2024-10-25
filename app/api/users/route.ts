import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { getAuth } from '@clerk/nextjs/server';

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the current user to check if they're an admin
    const currentUser = await clerkClient.users.getUser(userId);
    if (currentUser.publicMetadata.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Fetch all users
    const users = await clerkClient.users.getUserList();

    // Format the user data
    const formattedUsers = users.data.map((user: any) => ({
      id: user.id,
      user: `${user.firstName} ${user.lastName}`,
      phone: user.phoneNumbers[0]?.phoneNumber || 'N/A',
      username: user.username || user.id,
      email: user.emailAddresses[0]?.emailAddress || 'N/A',
      createdAt: user.createdAt,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

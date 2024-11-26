'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export const useLogout = () => {
  const router = useRouter();

  const handleLogout = useCallback(() => {
    // Clear all auth-related items from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    // Redirect to login page
    router.push('/sign-in');
    router.refresh();
  }, [router]);

  return handleLogout;
};

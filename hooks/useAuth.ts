'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../store/useAuthStore';

export function useAuth(requiredRole?: string) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, role, token, isAdmin, user } = useAuthStore();

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth-storage');

      if (!stored) {
        console.log('No stored auth found, redirecting to login');
        router.push('/sign-in');
        setIsLoading(false);
        return;
      }

      try {
        const { state } = JSON.parse(stored);

        if (!state.isAuthenticated) {
          console.log('Not authenticated, redirecting to sign-in');
          router.push('/sign-in');
        } else if (requiredRole && state.role !== requiredRole) {
          console.log('Invalid role, redirecting to home');
          router.push('/');
        }
      } catch (error) {
        console.error('Error parsing stored auth:', error);
        router.push('/sign-in');
      }
      setIsLoading(false);
    }
  }, [router, requiredRole]);

  return { isLoading, isAuthenticated, role, token, isAdmin, user };
}

'use client';
import { useEffect } from 'react';
import { useApiQuery } from '@/hooks/useApi';
import useAuthStore from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function TestPage() {
  const { isAuthenticated, token } = useAuthStore();
  const router = useRouter();

  // Test with both formats to verify normalization
  const {
    data: juntasData,
    error: juntasError,
    isLoading: juntasLoading,
  } = useApiQuery('/juntas', ['juntas'], {
    requireAuth: true,
    enabled: isAuthenticated, // Only run query when authenticated
  });

  const {
    data: usersData,
    error: usersError,
    isLoading: usersLoading,
  } = useApiQuery('/api/users', ['users'], {
    requireAuth: true,
    enabled: isAuthenticated, // Only run query when authenticated
  });

  useEffect(() => {
    // Log authentication state
    console.log('Auth State:', {
      isAuthenticated,
      hasToken: !!token,
    });

    // Log the actual requests being made
    console.log('API Requests:', {
      juntas: {
        loading: juntasLoading,
        data: juntasData,
        error: juntasError,
      },
      users: {
        loading: usersLoading,
        data: usersData,
        error: usersError,
      },
    });
  }, [
    isAuthenticated,
    token,
    juntasData,
    juntasError,
    usersData,
    usersError,
    juntasLoading,
    usersLoading,
  ]);

  if (!isAuthenticated) {
    return (
      <div className='p-4'>
        <h1 className='text-xl font-bold mb-4'>API Test Page</h1>
        <div className='bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4'>
          <p className='font-bold'>Not Authenticated</p>
          <p>Please sign in to test the API endpoints.</p>
        </div>
        <Button onClick={() => router.push('/sign-in')}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className='p-4'>
      <h1 className='text-xl font-bold mb-4'>API Test Page</h1>

      <div className='mb-4'>
        <h2 className='font-bold'>Authentication Status:</h2>
        <pre className='bg-gray-100 p-2 rounded'>
          {JSON.stringify({ isAuthenticated, hasToken: !!token }, null, 2)}
        </pre>
      </div>

      <div className='mb-4'>
        <h2 className='font-bold'>Juntas Request:</h2>
        {juntasLoading ? (
          <p>Loading...</p>
        ) : juntasError ? (
          <pre className='text-red-500 bg-red-50 p-2 rounded'>
            {JSON.stringify(juntasError, null, 2)}
          </pre>
        ) : (
          <pre className='bg-gray-100 p-2 rounded'>
            {JSON.stringify(juntasData, null, 2)}
          </pre>
        )}
      </div>

      <div className='mb-4'>
        <h2 className='font-bold'>Users Request:</h2>
        {usersLoading ? (
          <p>Loading...</p>
        ) : usersError ? (
          <pre className='text-red-500 bg-red-50 p-2 rounded'>
            {JSON.stringify(usersError, null, 2)}
          </pre>
        ) : (
          <pre className='bg-gray-100 p-2 rounded'>
            {JSON.stringify(usersData, null, 2)}
          </pre>
        )}
      </div>

      <Button
        variant='destructive'
        onClick={() => {
          useAuthStore.getState().clearAuth();
          router.refresh();
        }}
      >
        Sign Out
      </Button>
    </div>
  );
}

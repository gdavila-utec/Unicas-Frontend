'use client';

import { useEffect, useState } from 'react';
import useAuthStore from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

export function AuthHydration({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { isAuthenticated } = useAuthStore();

  // Wait for hydration
  useEffect(() => {
    const hydrateStore = async () => {
      // Initialize the store
      await useAuthStore.persist.rehydrate();
      setIsHydrated(true);
    };

    hydrateStore();
  }, []);

  // Show loading state while hydrating
  if (!isHydrated) {
    return (
      <div className='h-screen w-full flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  return children;
}

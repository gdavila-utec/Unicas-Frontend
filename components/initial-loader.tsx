'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { LoadingSection } from '../components/LoadingFallback';

export function InitialLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate minimum loading time to prevent flash
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds minimum loading time

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className='fixed inset-0 w-screen h-screen flex items-center justify-center z-50 bg-blue-800'>
      <div className='relative  animate-pulse z-50'>
        <LoadingSection
          title='Cargando juntas'
          message='Por favor espere mientras cargamos las juntas'
        />
        {/* <Image
          src='/Unica 1.jpg' //
          alt='Loading...'
          fill
          style={{ objectFit: 'contain' }}
          priority
        /> */}
      </div>
    </div>
  );
}

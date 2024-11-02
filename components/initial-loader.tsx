'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

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
    <div className='fixed inset-0 bg-white flex items-center justify-center z-50'>
      <div className='relative w-screen h-screen animate-pulse'>
        <Image
          src='/Unica 1.jpg' // Using the existing image from app/images
          alt='Loading...'
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
    </div>
  );
}

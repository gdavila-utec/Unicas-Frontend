'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface LoadingFallbackProps {
  fullPage?: boolean;
  message?: string;
  className?: string;
  ariaDescription?: string;
}

export function LoadingFallback({
  fullPage = true,
  message = 'Cargando...',
  className,
  ariaDescription,
}: LoadingFallbackProps) {
  return (
    <div
      role='progressbar'
      aria-busy='true'
      aria-label={message}
      aria-describedby={
        ariaDescription ? 'fallback-loading-description' : undefined
      }
      className={cn(
        'flex flex-col items-center justify-center gap-6',
        fullPage ? 'min-h-screen' : 'p-8',
        className
      )}
    >
      <div className='relative'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
        <div className='absolute inset-0 h-12 w-12 animate-ping opacity-25'>
          <Loader2 className='h-12 w-12 text-primary' />
        </div>
      </div>
      <div className='flex flex-col items-center gap-2 text-center'>
        <p className='text-lg font-medium text-foreground'>{message}</p>
        {ariaDescription && (
          <p
            id='fallback-loading-description'
            className='text-sm text-muted-foreground'
          >
            {ariaDescription}
          </p>
        )}
      </div>
    </div>
  );
}

interface LoadingPageProps extends LoadingFallbackProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function LoadingPage({
  message,
  ariaDescription,
  className,
  header,
  footer,
}: LoadingPageProps) {
  return (
    <div className='min-h-screen flex flex-col'>
      {header}
      <main className='flex-1'>
        <LoadingFallback
          message={message}
          ariaDescription={ariaDescription}
          className={className}
        />
      </main>
      {footer}
    </div>
  );
}

interface LoadingSectionProps extends LoadingFallbackProps {
  title?: string;
}

export function LoadingSection({
  title,
  message,
  ariaDescription,
  className,
}: LoadingSectionProps) {
  return (
    <section
      className={cn(
        'rounded-lg border bg-card p-6',
        'flex flex-col items-center justify-center gap-4',
        className
      )}
    >
      {title && (
        <h2 className='text-xl font-semibold text-card-foreground'>{title}</h2>
      )}
      <LoadingFallback
        fullPage={false}
        message={message}
        ariaDescription={ariaDescription}
      />
    </section>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export function LoadingSkeleton({
  className,
  count = 3,
}: LoadingSkeletonProps) {
  return (
    <div
      role='progressbar'
      aria-busy='true'
      aria-label='Cargando contenido'
      className={cn('space-y-4', className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className='flex items-center space-x-4'
        >
          <div className='h-12 w-12 rounded-full bg-muted animate-pulse' />
          <div className='space-y-2 flex-1'>
            <div className='h-4 w-[60%] bg-muted animate-pulse rounded' />
            <div className='h-4 w-[80%] bg-muted animate-pulse rounded' />
          </div>
        </div>
      ))}
    </div>
  );
}

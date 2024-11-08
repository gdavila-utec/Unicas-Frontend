import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { cn } from '../lib/utils';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  className?: string;
  onRetry?: () => void;
  onReload?: () => void;
  fullPage?: boolean;
}

export function ErrorDisplay({
  title = 'Error',
  message,
  className,
  onRetry,
  onReload = () => window.location.reload(),
  fullPage,
}: ErrorDisplayProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        fullPage && 'min-h-screen p-4',
        className
      )}
    >
      <Alert
        variant='destructive'
        className='max-w-lg w-full'
      >
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className='mt-2 flex flex-col gap-4'>
          <p className='text-sm text-destructive-foreground'>{message}</p>
          <div className='flex justify-end gap-2'>
            {onRetry && (
              <Button
                variant='outline'
                size='sm'
                onClick={onRetry}
                className='gap-2'
              >
                <RefreshCcw className='h-4 w-4' />
                Intentar de nuevo
              </Button>
            )}
            <Button
              variant='destructive'
              size='sm'
              onClick={onReload}
            >
              Recargar página
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

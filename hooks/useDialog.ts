import { useState, useCallback } from 'react';

export function useDialog<T = void>() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | undefined>();
  const [loading, setLoading] = useState(false);
  const [onSuccess, setOnSuccess] = useState<(() => void) | undefined>();

  const open = useCallback(
    (initialData?: T, onSuccessCallback?: () => void) => {
      setData(initialData);
      setOnSuccess(() => onSuccessCallback);
      setIsOpen(true);
    },
    []
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setData(undefined);
    setOnSuccess(undefined);
    setLoading(false);
  }, []);

  return {
    isOpen,
    data,
    loading,
    onSuccess,
    open,
    close,
    onOpenChange: setIsOpen,
    setLoading,
  };
}

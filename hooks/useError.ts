import { useState, useCallback } from 'react';

const parseErrorMessage = (error: unknown): string => {
  // Case 1: Handle nested Error objects
  if (error instanceof Error) {
    // Access the nested error message if it exists
    const nestedMessage = (error as any).cause?.message || error.message;

    // Clean up the message by removing "Error: " prefix if it exists
    return nestedMessage.replace(/^Error:\s*/, '');
  }

  // Case 2: Error with response data object (Axios error)
  if ((error as any).response?.data) {
    const { message, error: errorMsg } = (error as any).response.data;
    return message || errorMsg || 'An error occurred';
  }

  // Case 3: Error is a string
  if (typeof error === 'string') {
    return error;
  }

  // Default case
  return 'An unexpected error occurred';
};

interface UseErrorReturn {
  perro: string | null;
  setError: (error: unknown) => void;
  clearError: () => void;
  isError: boolean;
}

export const useError = (): UseErrorReturn => {
  const [perro, setErrorState] = useState<string | null>(null);

  const setError = useCallback((error: unknown) => {
    setErrorState(parseErrorMessage(error));
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  return {
    perro,
    setError,
    clearError,
    isError: perro !== null,
  };
};

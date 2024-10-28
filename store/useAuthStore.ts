import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface AuthState {
  token: string | null;
  role: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (auth: { token: string; role: string; user: User }) => void;
  clearAuth: () => void;
}

const initialState: Omit<AuthState, 'setAuth' | 'clearAuth'> = {
  token: null,
  role: null,
  user: null,
  isAuthenticated: false,
  isAdmin: false,
};

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      setAuth: (auth) => {
        set({
          token: auth.token,
          role: auth.role,
          user: auth.user,
          isAuthenticated: true,
          isAdmin: auth.role.toLowerCase() === 'admin',
        });
      },
      clearAuth: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // Only use localStorage on client side
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => null,
          removeItem: () => null,
        };
      }),
      skipHydration: true, // Important for SSR
    }
  )
);

// Hydration helper
export const hydrateAuth = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        useAuthStore.setState(state);
      } catch (error) {
        console.error('Error hydrating auth store:', error);
        // Clear potentially corrupted storage
        localStorage.removeItem('auth-storage');
      }
    }
  }
};

export default useAuthStore;

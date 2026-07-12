import React, { createContext, useContext, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import api from '@shared/api/client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const { setUser, setLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    api.get('/auth/me')
      .then(({ data }) => setUser(data.data))
      .catch(() => useAuthStore.getState().logout())
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return <AuthContext.Provider value={useAuthStore()}>{children}</AuthContext.Provider>;
}

export default function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              background: '#FFFFFF',
              color: '#292524',
              border: '1px solid #E7E5E4',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)',
              borderRadius: '6px',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#2D5016', secondary: '#FFFFFF' } },
            error: { iconTheme: { primary: '#B91C1C', secondary: '#FFFFFF' } },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

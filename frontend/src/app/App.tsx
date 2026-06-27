import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRouter } from './router';
import { useAuth } from './auth/useAuth';
import { setUnauthorizedHandler } from '@/shared/api/authBridge';

/**
 * Root application component (rendered inside AppProviders).
 * Wires the axios 401 handler to clear auth + redirect to /login.
 */
export function App() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      navigate('/login', { replace: true });
    });
    return () => setUnauthorizedHandler(null);
  }, [logout, navigate]);

  return <AppRouter />;
}

export default App;

import { createContext, useContext, useEffect, useState } from 'react';
import { authApi, getToken, setToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // If a token is saved, we are "loading" until the backend confirms who the user is
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return;
    authApi
      .me()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const startSession = (data) => {
    setToken(data.token);
    setUser(data.user);
  };

  const value = {
    user,
    loading,
    login: async (email, password) => startSession(await authApi.login({ email, password })),
    register: async (name, email, password) =>
      startSession(await authApi.register({ name, email, password })),
    logout: () => {
      setToken(null);
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

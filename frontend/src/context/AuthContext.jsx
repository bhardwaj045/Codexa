import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('codexa_user') || localStorage.getItem('codehub_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('codexa_token') || localStorage.getItem('codehub_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await authApi.getCurrentUser();
          setUser(res.data);
          localStorage.setItem('codexa_user', JSON.stringify(res.data));
          localStorage.setItem('codehub_user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Token verification failed", err);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token: jwt, id, name, email: userEmail, userRole } = res.data;
    const userData = { id, name, email: userEmail, userRole };

    setToken(jwt);
    setUser(userData);
    localStorage.setItem('codexa_token', jwt);
    localStorage.setItem('codexa_user', JSON.stringify(userData));
    localStorage.setItem('codehub_token', jwt);
    localStorage.setItem('codehub_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (name, email, password, userRole = 'STUDENT') => {
    const res = await authApi.register({ name, email, password, userRole });
    const { token: jwt, id, name: resName, email: userEmail, userRole: resRole } = res.data;
    const userData = { id, name: resName, email: userEmail, userRole: resRole };

    setToken(jwt);
    setUser(userData);
    localStorage.setItem('codexa_token', jwt);
    localStorage.setItem('codexa_user', JSON.stringify(userData));
    localStorage.setItem('codehub_token', jwt);
    localStorage.setItem('codehub_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('codexa_token');
    localStorage.removeItem('codexa_user');
    localStorage.removeItem('codehub_token');
    localStorage.removeItem('codehub_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.userRole === 'ADMIN' || user?.role === 'ADMIN' || user?.email === 'admin@codexa.com' || user?.email === 'anishbhardwaj377@gmail.com',
        isStudent: (user?.userRole === 'STUDENT' || user?.role === 'STUDENT') && user?.email !== 'admin@codexa.com' && user?.email !== 'anishbhardwaj377@gmail.com',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

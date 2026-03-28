'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // FETCH CURRENT USER
  const fetchUser = async () => {
    try {
      const response = await api.get('/users/me/');
      setUser(response.data);
      return response.data;
    } catch (err) {
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common.Authorization;
      return null;
    } finally {
      setLoading(false);
    }
  };

  // INIT AUTH ON APP START
  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // LOGIN
  const login = async (credentials: any): Promise<boolean> => {
    try {
      // JWT TOKEN
      const response = await api.post('/token/', credentials);
      const { access, refresh } = response.data;

      if (!access) return false;

      // SAVE TOKENS
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // HEADER FOR AXIOS INSTANCE
      api.defaults.headers.common.Authorization = `Bearer ${access}`;

      // FETCH USER DATA
      const userData = await fetchUser();

      // TEMPORARY FOR DEBUGGING
      if (!userData) {
        throw new Error('Logowanie udane, ale wystąpił problem z pobraniem profilu użytkownika.');
      }

      return true;
    } catch (error: any) {
      // LOGIN FORM HANDLING
      if (error instanceof Error && !error.message.includes('status code')) {
        throw { response: { data: { detail: error.message } } };
      }
      throw error;
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    delete api.defaults.headers.common.Authorization;

    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
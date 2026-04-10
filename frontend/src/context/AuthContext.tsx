'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

interface User {
  id: number;
  email: string;
  is_staff: boolean;
  is_active?: boolean;
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
      // Cookie is sent automatically thanks to withCredentials: true
      const response = await api.get('/users/me');
      setUser(response.data);
      return response.data;
    } catch (err) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // INIT AUTH ON APP START
  useEffect(() => {
    // We just try to get the user if they have a valid cookie, it will work.
    fetchUser();
  }, []);

  // LOGIN
  const login = async (credentials: any): Promise<boolean> => {
    try {
      // 1. We send the login data. Backend sets httpOnly cookies.
      await api.post('/token', credentials);

      // 2. Since the cookie is already in the browser, we get the user data
      const userData = await fetchUser();

      //DEBUGGING
      if (!userData) {
        throw new Error('Login successful, but there was a problem fetching the profile.');
      }

      return true;
    } catch (error: any) {
      if (error instanceof Error && !error.message.includes('status code')) {
        throw { response: { data: { detail: error.message } } };
      }
      throw error;
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      // We call the new endpoint so the backend deletes the cookies
      await api.post('/logout');
    } catch (error) {
      console.error("Error during logout", error);
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
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
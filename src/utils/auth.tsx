import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';

interface User {
  id: string;
  email: string;
  name: string;
  capital?: number;
  riskProfile?: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    capital?: number;
    riskProfile?: string;
    inviteToken: string;
  }) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage
    const savedToken = localStorage.getItem('catiqz-token');
    const savedUser = localStorage.getItem('catiqz-user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      api.setToken(savedToken);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await api.login(email, password);
      setToken(result.token);
      setUser(result.user);
      localStorage.setItem('catiqz-token', result.token);
      localStorage.setItem('catiqz-user', JSON.stringify(result.user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (data: {
    name: string;
    email: string;
    password: string;
    capital?: number;
    riskProfile?: string;
    inviteToken: string;
  }) => {
    try {
      const result = await api.signup(data);
      setToken(result.token);
      setUser(result.user);
      localStorage.setItem('catiqz-token', result.token);
      localStorage.setItem('catiqz-user', JSON.stringify(result.user));
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    api.clearToken();
    localStorage.removeItem('catiqz-token');
    localStorage.removeItem('catiqz-user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        signup,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

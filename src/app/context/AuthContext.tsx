'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi } from '../auth/api';



interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { username: string; email: string; password: string; role?: string; adminSecret?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(
    typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null
  );

  const login = async (credentials: { email: string; password: string }) => {
    const data = await loginApi(credentials);
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
  };

  const register = async (data: { username: string; email: string; password: string; role?: string; adminSecret?: string }) => {
    const response = await registerApi(data);
    setUser(response);
    localStorage.setItem('user', JSON.stringify(response));
  };

  const logout = () => {
    setUser(null);
    logoutApi();
  };

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login as loginApi, register as registerApi, logout as logoutApi } from '../auth/api';
import { Role, normalizeRole, ROLES } from '../auth/roles';

interface User {
  _id: string;
  username: string;
  email: string;
  role: Role;
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: { username: string; email: string; password: string }) => Promise<User>;
  // expired: the session ran out (keep ?next= so login returns there). Otherwise the user chose to log out.
  logout: (options?: { expired?: boolean }) => void;
  // True after a deliberate logout, so page guards send people to plain "/" instead of "/?next=<page>".
  loggedOutByUser: boolean;
  updateUser: (changes: Partial<Pick<User, 'username'>>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Coerce the role to 1/2 and drop sessions whose token is missing or expired.
const toSessionUser = (data: any): User | null => {
  if (!data?.token) return null;
  try {
    const { exp } = jwtDecode<{ exp?: number }>(data.token);
    if (exp && exp * 1000 < Date.now()) return null;
  } catch {
    return null;
  }
  return { ...data, role: normalizeRole(data.role) };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggedOutByUser, setLoggedOutByUser] = useState(false);

  const saveUser = (data: any) => {
    const sessionUser = toSessionUser(data);
    if (!sessionUser) throw new Error('Invalid login response');
    setUser(sessionUser);
    setLoggedOutByUser(false);
    localStorage.setItem('user', JSON.stringify(sessionUser));
    return sessionUser;
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      const sessionUser = stored ? toSessionUser(JSON.parse(stored)) : null;
      if (sessionUser) {
        setUser(sessionUser);
        localStorage.setItem('user', JSON.stringify(sessionUser));
      } else {
        localStorage.removeItem('user');
      }
    } catch (err) {
      console.error('Failed to parse stored user', err);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: { email: string; password: string }) =>
    saveUser(await loginApi(credentials));

  const register = async (data: { username: string; email: string; password: string }) =>
    saveUser(await registerApi(data));

  const logout = (options?: { expired?: boolean }) => {
    setLoggedOutByUser(!options?.expired);
    setUser(null);
    logoutApi();
  };

  // Keep context and the stored session in sync after profile edits.
  const updateUser = (changes: Partial<Pick<User, 'username'>>) => {
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...changes };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  };

  const isAdmin = user?.role === ROLES.ADMIN;

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, register, logout, loggedOutByUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

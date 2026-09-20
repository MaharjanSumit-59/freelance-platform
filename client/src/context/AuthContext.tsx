import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import type { User, UserRole } from '../types';
import * as authApi from '../api/auth';
import { getToken } from '../api/client';

interface AuthContextType {
  currentUser: User | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  // True while we're checking a stored token against the server on first load —
  // lets protected routes avoid a flash-redirect to /login before we know.
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setInitializing(false);
      return;
    }
    authApi
      .fetchMe()
      .then(setCurrentUser)
      .catch(() => authApi.logout())
      .finally(() => setInitializing(false));
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const user = await authApi.login(email, password);
      setCurrentUser(user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Something went wrong.' };
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      const user = await authApi.register(name, email, password, role);
      setCurrentUser(user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Something went wrong.' };
    }
  };

  const logout = () => {
    authApi.logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, initializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

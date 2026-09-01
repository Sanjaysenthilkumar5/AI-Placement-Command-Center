import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: string | null;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('placement_jwt_token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('placement_user_role') || 'admin');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const u = await api.getMe();
      setUser(u);
      setRole(u.role);
    } catch (e) {
      console.error('Session expired or invalid', e);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const handleAuthSuccess = (data: AuthResponse) => {
    localStorage.setItem('placement_jwt_token', data.access_token);
    localStorage.setItem('placement_user_role', data.role);
    setToken(data.access_token);
    setRole(data.role);
    setUser({
      id: data.user_id,
      email: data.email,
      full_name: data.full_name,
      role: data.role as any,
      is_active: true,
      created_at: new Date().toISOString()
    });
  };

  const login = async (email: string, pass: string) => {
    const data = await api.login(email, pass);
    handleAuthSuccess(data);
  };

  const demoLogin = async (targetRole: string) => {
    const data = await api.demoLogin(targetRole);
    handleAuthSuccess(data);
  };

  const logout = () => {
    localStorage.removeItem('placement_jwt_token');
    localStorage.removeItem('placement_user_role');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, role, login, demoLogin, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

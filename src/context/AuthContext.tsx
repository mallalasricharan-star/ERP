import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { AuthSession, UserRole } from '../types';

interface AuthContextType {
  session: AuthSession | null;
  user: AuthSession['user'] | null;
  role: UserRole | null;
  isLoading: boolean;
  loginAdminWithPin: (pin: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const loadSession = () => {
    const s = authService.getCurrentSession();
    setSession(s);
    setIsLoading(false);
  };

  useEffect(() => {
    loadSession();
  }, []);

  const loginAdminWithPin = async (pin: string) => {
    setIsLoading(true);
    try {
      const s = await authService.loginAdminWithPin(pin);
      setSession(s);
      navigate('/admin/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const s = await authService.loginWithEmail(email, pass, role);
      setSession(s);
      if (role === 'head_master') navigate('/headmaster/dashboard');
      else if (role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/admin/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setSession(null);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        role: session?.user?.role || null,
        isLoading,
        loginAdminWithPin,
        loginWithEmail,
        logout,
        refreshSession: loadSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

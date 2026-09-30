import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client.js';
import { User, UserRole } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  loginWithGoogle: (data: { credential?: string; idToken?: string; code?: string; role?: UserRole; redirectUri?: string }) => Promise<void>;
  getGoogleOAuthUrl: (role?: UserRole, redirectUri?: string) => Promise<string>;
  register: (data: { email: string; password: string; name: string; phone?: string; role: UserRole }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const response: any = await api.get('/auth/me');
      setUser(response.data);
    } catch (err) {
      console.error('Failed to load profile:', err);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res: any = await api.post('/auth/login', credentials);
    const { user: userData, accessToken, refreshToken } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(userData);
  };

  const loginWithGoogle = async (data: { credential?: string; idToken?: string; code?: string; role?: UserRole; redirectUri?: string }) => {
    const res: any = await api.post('/auth/google', data);
    const { user: userData, accessToken, refreshToken } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(userData);
  };

  const getGoogleOAuthUrl = async (role: UserRole = 'CUSTOMER', redirectUri?: string): Promise<string> => {
    const res: any = await api.get('/auth/google/url', { params: { role, redirectUri } });
    return res.data.url;
  };

  const register = async (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: UserRole;
  }) => {
    const res: any = await api.post('/auth/register', data);
    const { user: userData, accessToken, refreshToken } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch (e) {
      // Ignore
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    await fetchUserProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        getGoogleOAuthUrl,
        register,
        logout,
        refreshProfile,
      }}
    >
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

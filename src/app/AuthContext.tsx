import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setSignOutCallback } from '../services/api/apiClient';
import { AuthService } from '../services/api/authService';
import { SecureStorage } from '../services/secureStorage';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  token: string | null;
  signIn: (user: any, accessToken: string, refreshToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  signOutAllDevices: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setSignOutCallback(() => {
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    });
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const savedToken = await SecureStorage.getAccessToken();
      const savedUser = await AsyncStorage.getItem('auth_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error('Initial auth check failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (user: any, accessToken: string, refreshToken: string) => {
    await SecureStorage.setAccessToken(accessToken);
    await SecureStorage.setRefreshToken(refreshToken);
    await AsyncStorage.setItem('auth_user', JSON.stringify(user));

    setToken(accessToken);
    setUser(user);
    setIsAuthenticated(true);
  };

  const clearLocalState = async () => {
    await SecureStorage.clearAll();
    await AsyncStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const signOut = async () => {
    try {
      await AuthService.logout();
    } catch {
      // ignore — we still clear local state
    }
    await clearLocalState();
  };

  const signOutAllDevices = async () => {
    try {
      await AuthService.logoutAll();
    } catch {
      // ignore — we still clear local state
    }
    await clearLocalState();
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, token, signIn, signOut, signOutAllDevices }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = { username: string } | null;
type AuthContextType = {
  user: User;
  login: (creds: {username: string, password: string}) => Promise<void>;
  register: (creds: {username: string, password: string}) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const STORAGE_KEY = '@tornillofeliz_user';

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch (e) {
        console.log('Auth load error', e);
      }
    })();
  }, []);

  const login = async ({ username, password }: {username: string, password: string}) => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error('Usuario no encontrado. Regístrate');
    const stored = JSON.parse(raw);
    if (stored.username === username && stored.password === password) {
      setUser({ username });
    } else {
      throw new Error('Credenciales inválidas');
    }
  };

  const register = async ({ username, password }: {username: string, password: string}) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ username, password }));
    setUser({ username });
  };

  const logout = () => setUser(null);

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type User = {
  username: string;
  password: string;
  role: 'admin' | 'user';
};

type AuthContextType = {
  user: Omit<User, 'password'> | null;
  login: (creds: { username: string; password: string }) => Promise<void>;
  register: (creds: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  updateRole: (username: string, newRole: 'admin' | 'user') => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const USERS_KEY = '@tornillofeliz_users';
const USER_KEY = '@tornillofeliz_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);

  // 🔄 Cargar sesión guardada
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(USER_KEY);
      if (raw) setUser(JSON.parse(raw));
    })();
  }, []);

  // 📝 Registro (el primer usuario será admin)
  const register = async ({ username, password }: { username: string; password: string }) => {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = raw ? JSON.parse(raw) : [];

    if (users.find(u => u.username === username)) {
      throw new Error('Este usuario ya existe');
    }

    // 👉 Si no hay usuarios, el primero es admin
    const newRole: 'admin' | 'user' = users.length === 0 ? 'admin' : 'user';

    const newUser: User = { username, password, role: newRole };
    users.push(newUser);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Guardar sesión actual
    await AsyncStorage.setItem(USER_KEY, JSON.stringify({ username, role: newRole }));
    setUser({ username, role: newRole });
  };

  // 🔐 Login
  const login = async ({ username, password }: { username: string; password: string }) => {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = raw ? JSON.parse(raw) : [];
    const found = users.find(u => u.username === username && u.password === password);
    if (!found) throw new Error('Usuario o contraseña incorrectos');
    await AsyncStorage.setItem(USER_KEY, JSON.stringify({ username: found.username, role: found.role }));
    setUser({ username: found.username, role: found.role });
  };

  // 🚪 Logout
  const logout = async () => {
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  };

  // 👑 Obtener todos los usuarios (solo para panel admin)
  const getAllUsers = async () => {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  };

  // ✏️ Cambiar rol
  const updateRole = async (username: string, newRole: 'admin' | 'user') => {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = raw ? JSON.parse(raw) : [];
    const updated = users.map(u => (u.username === username ? { ...u, role: newRole } : u));
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));

    // Si actualizaste al usuario logueado → refresca sesión
    if (user?.username === username) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify({ username, role: newRole }));
      setUser({ username, role: newRole });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, getAllUsers, updateRole }}>
      {children}
    </AuthContext.Provider>
  );
};

// src/contexts/AuthContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { tokenStorage } from "../utils/storage";
import { loginApi, AuthUser, registerApi } from "../services/auth.api";

type AuthStatus = "idle" | "checking" | "authenticated" | "unauthenticated";
type RegisterInput = { fullName: string; email: string; password: string };

type AuthContextType = {
  user: AuthUser | null;
  status: AuthStatus;
  login: (i: { email: string; password: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  register: (i: RegisterInput) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (!token) {
          setStatus("unauthenticated");
          return;
        }
        // Si quieres, aquí podrías llamar /auth/me para cargar el usuario.
        setStatus("authenticated");
      } catch {
        await SecureStore.deleteItemAsync("token");
        setUser(null);
        setStatus("unauthenticated");
      }
    })();
  }, []);

  const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
    const { token, user } = await loginApi({ email, password });
    await tokenStorage.set(token);            // guarda token
    setUser(user);
    setStatus("authenticated");
    return user; // útil para navegar por rol
  }, []);

  const logout = useCallback(async () => {
    // limpia TODO lo relacionado a sesión
    try { await tokenStorage.set(""); } catch {}
    try { await SecureStore.deleteItemAsync("token"); } catch {}
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const register = useCallback(async ({ fullName, email, password }: RegisterInput) => {
    await registerApi({ fullName, email, password });
    const { token, user } = await loginApi({ email, password });
    await tokenStorage.set(token);
    setUser(user);
    setStatus("authenticated");
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

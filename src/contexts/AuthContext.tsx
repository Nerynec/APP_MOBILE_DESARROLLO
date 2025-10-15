// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { tokenStorage } from "../utils/storage";
import { loginApi, AuthUser, registerApi } from "../services/auth.api";

type AuthStatus = "idle" | "checking" | "authenticated" | "unauthenticated";

type LoginInput = { email: string; password: string };
type RegisterInput = { fullName: string; email: string; password: string };

type AuthContextType = {
  user: AuthUser | null;
  status: AuthStatus;
  login: (i: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  register: (i: RegisterInput) => Promise<void>; // 👈 nuevo
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("checking");

  // Cargar sesión al inicio
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (!token) {
          setStatus("unauthenticated");
          return;
        }

        setStatus("authenticated");
      } catch {
        await SecureStore.deleteItemAsync("token");
        setUser(null);
        setStatus("unauthenticated");
      }
    })();
  }, []);

  const login = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const { token, user } = await loginApi({ email, password });
      await tokenStorage.set(token);
      setUser(user);
      setStatus("authenticated");
    },
    []
  );

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync("token");
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const register = useCallback(
    async ({ fullName, email, password }: RegisterInput) => {
      try {
        // 1) crear usuario
        await registerApi({ fullName, email, password });

        // 2) auto-login
        const { token, user } = await loginApi({ email, password });
        await tokenStorage.set(token);
        setUser(user);
        setStatus("authenticated");
      } catch (e: any) {
        const status = e?.response?.status;
        const serverMsg =
          e?.response?.data?.message || e?.response?.data?.error;

        let msg = "No se pudo registrar.";
        if (!e?.response) msg = "No se pudo conectar con la API.";
        else if (status === 400) msg = serverMsg || "Datos inválidos.";
        else msg = serverMsg || `Error del servidor (${status}).`;

        throw new Error(msg);
      }
    },
    []
  );

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

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { tokenStorage } from "../utils/storage";
import { loginApi, AuthUser, registerApi, meApi } from "../services/auth.api";

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("checking");

  // Cargar sesión al inicio
  useEffect(() => {
    (async () => {
      setStatus("checking");
      try {
        const token = await tokenStorage.get();
        if (!token) {
          setStatus("unauthenticated");
          setUser(null);
          return;
        }
        // Opcional: llamar /auth/me para obtener datos del usuario real
        const currentUser = await meApi(token).catch(() => null);
        if (currentUser) {
          setUser(currentUser);
          setStatus("authenticated");
        } else {
          await tokenStorage.delete();
          setUser(null);
          setStatus("unauthenticated");
        }
      } catch {
        await tokenStorage.delete();
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
      return user;
    },
    []
  );

  const logout = useCallback(async () => {
    await tokenStorage.delete();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const register = useCallback(
    async ({ fullName, email, password }: RegisterInput) => {
      await registerApi({ fullName, email, password });
      const { token, user } = await loginApi({ email, password });
      await tokenStorage.set(token);
      setUser(user);
      setStatus("authenticated");
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

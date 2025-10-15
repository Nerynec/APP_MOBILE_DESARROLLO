// src/services/auth.api.ts
import { http } from './http';

const LOGIN_PATH = '/auth/login';

export type AuthUser = {
  userId: number;
  fullName: string;
  email: string;
  roles: string[];
};

type LoginResponse = {
  accessToken: string;   // 👈 tu API usa accessToken
  user: AuthUser;
};

export type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
};

export type RegisteredUser = {
  userId: number;
  fullName: string;
  email: string;
  roles: string[];
  isActive?: boolean;
};

export async function loginApi({ email, password }: { email: string; password: string }) {
  const res = await http.post<LoginResponse>(LOGIN_PATH, { email, password }, {
    headers: { 'Content-Type': 'application/json' },
  });

  const raw = res.data;
  const token = raw.accessToken;               // 👈 toma accessToken
  const user  = raw.user;

  if (!token) {
    throw new Error('La respuesta no trajo token. Respuesta: ' + JSON.stringify(raw));
  }
  return { token, user };


}

export async function registerApi(data: RegisterInput): Promise<RegisteredUser> {
  // Tu backend: POST /auth/register con { fullName, email, password }
  const res = await http.post<RegisteredUser>('/auth/register', data, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

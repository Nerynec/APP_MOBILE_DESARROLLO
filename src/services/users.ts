import { http } from './http';

export type UserDto = {
  user_id: number;         // <-- importante
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  roles: string[];
};


export type CreateUserInput = {
fullName: string;
email: string;
password: string;
isActive?: boolean;
roles: string[];
};


export type UpdateUserInput = {
fullName?: string;
email?: string;
password?: string;
isActive?: boolean;
roles?: string[];
};


export async function listUsers(): Promise<UserDto[]> {
const { data } = await http.get('/users');
return data;
}


export async function createUser(payload: CreateUserInput): Promise<UserDto> {
const { data } = await http.post('/users', payload);
return data;
}


export async function updateUser(id: number, payload: UpdateUserInput): Promise<UserDto> {
const dto: any = {};
if (payload.fullName !== undefined) dto.fullName = payload.fullName;
if (payload.email !== undefined) dto.email = payload.email;
if (payload.password) dto.password = payload.password;
if (payload.isActive !== undefined) dto.isActive = payload.isActive;
if (payload.roles !== undefined) dto.roles = payload.roles;
const { data } = await http.put(`/users/${id}`, dto);
return data;
}


export async function deleteUser(id: number): Promise<{ ok: boolean }> {
const { data } = await http.delete(`/users/${id}`);
return data;
}


export async function listRoles(): Promise<string[]> {
try {
const { data } = await http.get('/roles');
if (Array.isArray(data)) {
const names = data.map((r: any) => r.name || r);
return [...new Set(names)].filter(Boolean);
}
return ['ADMIN', 'CLIENT'];
} catch {
return ['ADMIN', 'CLIENT'];
}
}
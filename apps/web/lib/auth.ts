// apps/web/lib/auth.ts
import API from './api';
import {jwtDecode} from 'jwt-decode';

type JwtPayload = { sub?: number; email?: string; role?: string; exp?: number };

export async function signup(name: string, email: string, password: string, role: 'PARTICIPANT' | 'ORGANIZER') {
  const res = await API.post('/auth/signup', { name, email, password, role });

  const token = res.data.token ?? res.data.access_token ?? res.data;
  if (typeof token === 'string') localStorage.setItem('token', token);
  return token;
}

export async function login(email: string, password: string) {
  const res = await API.post('/auth/login', { email, password });
  const token = res.data.token ?? res.data.access_token ?? res.data;
  if (typeof token === 'string') localStorage.setItem('token', token);
  return token;
}

export function logout() {
  localStorage.removeItem('token');
}

export function getUser() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = jwtDecode<JwtPayload>(token);
    return { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

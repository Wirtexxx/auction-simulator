const AUTH_TOKEN_KEY = 'authToken';
const USER_KEY = 'user';

export interface StoredUser {
  _id: number;
  username: string;
  first_name: string;
  last_name?: string;
  photo_url?: string;
  language_code?: string;
  is_premium?: boolean;
  role: string;
}

export function saveAuth(token: string, user: StoredUser): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getUser(): StoredUser | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null && getUser() !== null;
}


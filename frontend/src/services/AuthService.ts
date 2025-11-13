export type LoginResult = { token: string };

const API_BASE = import.meta.env?.VITE_API_BASE ?? "/api";
const STORAGE_TOKEN = "jwt";

export const AuthService = {
  get token() {
    return localStorage.getItem(STORAGE_TOKEN) ?? "";
  },
  set token(v: string) {
    v
      ? localStorage.setItem(STORAGE_TOKEN, v)
      : localStorage.removeItem(STORAGE_TOKEN);
  },
  isAuthed() {
    return !!localStorage.getItem(STORAGE_TOKEN);
  },
  logout() {
    localStorage.removeItem(STORAGE_TOKEN);
  },

  async login(email: string, password: string): Promise<LoginResult> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const text = await res.text();
    let data: any = undefined;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      /* ignore */
    }

    if (!res.ok)
      throw new Error(`Login failed: ${res.status} ${text || res.statusText}`);

    //  `accessToken`
    const token = data?.accessToken as string | undefined;
    if (!token)
      throw new Error(
        "No token returned from /auth/login (expected `accessToken`)"
      );

    this.token = token;
    return { token };
  },

  decode<T = any>(): T | null {
    try {
      const [, payload] = this.token.split(".");
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  },
};

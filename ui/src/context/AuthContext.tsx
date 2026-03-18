import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchMe, login as apiLogin, logout as apiLogout } from "@/api/client";

interface AuthContextValue {
  authenticated: boolean;
  authEnabled: boolean;
  loading: boolean;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [authEnabled, setAuthEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe()
      .then((status) => {
        if (status === null) {
          // 404 — auth is disabled
          setAuthEnabled(false);
          setAuthenticated(true);
        } else {
          setAuthEnabled(status.auth_enabled);
          setAuthenticated(status.authenticated);
        }
      })
      .catch(() => {
        setAuthenticated(false);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(password: string) {
    await apiLogin(password);
    setAuthenticated(true);
  }

  async function logout() {
    await apiLogout();
    setAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ authenticated, authEnabled, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

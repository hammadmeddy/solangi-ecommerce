"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthRole, AuthUser } from "@/lib/auth";
import { AUTH_STORAGE_KEY } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api-client";

type PendingVerify = {
  phone: string;
  email: string;
  name: string;
  role: AuthRole;
  mode: "login" | "register" | "admin";
  emailMasked?: string;
  demoHint?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  pending: PendingVerify | null;
  ready: boolean;
  backend: boolean;
  startLogin: (input: { phone: string; email: string }) => Promise<void>;
  startRegister: (input: {
    name: string;
    phone: string;
    email: string;
    role: AuthRole;
  }) => Promise<void>;
  startAdminLogin: (input: {
    name: string;
    phone: string;
    email: string;
  }) => Promise<void>;
  completeVerify: (otp: string) => Promise<{ ok: boolean; error?: string }>;
  updateUser: (patch: Partial<AuthUser>) => void;
  signOut: () => Promise<void>;
  clearPending: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pending, setPending] = useState<PendingVerify | null>(null);
  const [ready, setReady] = useState(false);
  const [backend, setBackend] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const health = await apiGet<{ ok: boolean }>("/api/health");
        if (!cancelled) setBackend(Boolean(health.ok));
        const me = await apiGet<{ user: AuthUser | null }>("/api/auth/me");
        if (!cancelled && me.user) {
          setUser(me.user);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(me.user));
          setReady(true);
          return;
        }
      } catch {
        if (!cancelled) setBackend(false);
      }

      try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (raw && !cancelled) setUser(JSON.parse(raw) as AuthUser);
      } catch {
        /* ignore */
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistLocal = useCallback((next: AuthUser | null) => {
    setUser(next);
    try {
      if (next) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const requestOtp = useCallback(async (input: PendingVerify) => {
    setPending(input);
    try {
      const res = await apiPost<{
        emailMasked?: string;
        hint?: string;
        delivery?: string;
      }>("/api/auth/request-otp", {
        phone: input.phone,
        email: input.email,
        name: input.name,
        role: input.role,
        purpose: input.mode,
      });
      setBackend(true);
      setPending({
        ...input,
        emailMasked: res.emailMasked,
        demoHint: res.hint,
      });
    } catch (err) {
      setBackend(false);
      throw err;
    }
  }, []);

  const startLogin = useCallback(
    async (input: { phone: string; email: string }) => {
      await requestOtp({
        phone: input.phone.trim(),
        email: input.email.trim().toLowerCase(),
        name: "Solangi Member",
        role: "customer",
        mode: "login",
      });
    },
    [requestOtp],
  );

  const startRegister = useCallback(
    async (input: {
      name: string;
      phone: string;
      email: string;
      role: AuthRole;
    }) => {
      await requestOtp({
        phone: input.phone.trim(),
        email: input.email.trim().toLowerCase(),
        name: input.name.trim() || "Solangi Member",
        role: input.role === "admin" ? "customer" : input.role,
        mode: "register",
      });
    },
    [requestOtp],
  );

  const startAdminLogin = useCallback(
    async (input: { name: string; phone: string; email: string }) => {
      await requestOtp({
        phone: input.phone.trim(),
        email: input.email.trim().toLowerCase(),
        name: input.name.trim() || "Solangi Admin",
        role: "admin",
        mode: "admin",
      });
    },
    [requestOtp],
  );

  const completeVerify = useCallback(
    async (otp: string) => {
      if (!pending) return { ok: false, error: "missing" };
      const code = otp.replace(/\s/g, "");
      if (!/^\d{6}$/.test(code)) return { ok: false, error: "format" };

      try {
        const res = await apiPost<{ user: AuthUser }>("/api/auth/verify-otp", {
          phone: pending.phone,
          code,
        });
        persistLocal(res.user);
        setPending(null);
        setBackend(true);
        return { ok: true };
      } catch {
        return { ok: false, error: "invalid" };
      }
    },
    [pending, persistLocal],
  );

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiPost("/api/auth/logout", {});
    } catch {
      /* ignore */
    }
    persistLocal(null);
    setPending(null);
  }, [persistLocal]);

  const clearPending = useCallback(() => setPending(null), []);

  const value = useMemo(
    () => ({
      user,
      pending,
      ready,
      backend,
      startLogin,
      startRegister,
      startAdminLogin,
      completeVerify,
      updateUser,
      signOut,
      clearPending,
    }),
    [
      user,
      pending,
      ready,
      backend,
      startLogin,
      startRegister,
      startAdminLogin,
      completeVerify,
      updateUser,
      signOut,
      clearPending,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getSessionFn, sendPasswordResetFn, signInFn, signOutFn, signUpFn, resetPasswordFn, verifyEmailFn } from "@/server/fns";

export type AccountUser = { id: string; email: string; fullName: string; phone: string; isAdmin: boolean };

type AuthState = {
  configured: boolean;
  ready: boolean;
  user: AccountUser | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ status: "check-email"; devVerifyUrl?: string }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ message: string; devResetUrl?: string }>;
  updatePassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
};

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [configured, setConfigured] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    getSessionFn().then((session) => {
      if (!active) return;
      setConfigured(session.configured);
      setUser(session.user);
      setReady(true);
    }).catch(() => {
      if (!active) return;
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  const value = useMemo<AuthState>(() => ({
    configured,
    ready,
    user,
    isAdmin: Boolean(user?.isAdmin),
    async signIn(email, password) {
      const next = await signInFn({ data: { email, password } });
      setUser(next);
      setConfigured(true);
    },
    async signUp(email, password, fullName) {
      return signUpFn({ data: { email, password, fullName } });
    },
    async signOut() {
      await signOutFn();
      setUser(null);
    },
    async sendPasswordReset(email) {
      return sendPasswordResetFn({ data: { email } });
    },
    async updatePassword(token, password) {
      await resetPasswordFn({ data: { token, password } });
    },
    async verifyEmail(token) {
      await verifyEmailFn({ data: { token } });
    },
  }), [configured, ready, user]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}

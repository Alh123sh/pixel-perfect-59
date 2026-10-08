import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { userRoles, users, verificationTokens } from "@/db/schema";
import { hashPassword, hashToken, newToken, verifyPassword } from "./passwords";
import { createSession, destroySession, readSession } from "./session";

let dummyHash: string | null = null;

async function dummy() {
  dummyHash ??= await hashPassword("not-a-real-password");
  return dummyHash;
}

export async function signUp(input: { email: string; password: string; fullName: string }, origin: string) {
  const email = input.email.trim().toLowerCase();
  if (input.password.length < 8) throw new Error("Use at least 8 characters.");
  const db = getDb();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) throw new Error("An account with that email already exists.");
  const [user] = await db
    .insert(users)
    .values({ email, passwordHash: await hashPassword(input.password), fullName: input.fullName.trim() })
    .returning({ id: users.id });
  if (!user) throw new Error("The account could not be created.");
  await db.insert(userRoles).values({ userId: user.id, role: "customer" });
  const token = newToken();
  await db.insert(verificationTokens).values({
    userId: user.id,
    purpose: "verify",
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  const devVerifyUrl = process.env["NODE_ENV"] === "production" ? undefined : `${origin}/verify-email?token=${token}`;
  return devVerifyUrl ? { status: "check-email" as const, devVerifyUrl } : { status: "check-email" as const };
}

export async function signIn(email: string, password: string) {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
  const ok = await verifyPassword(password, user?.passwordHash ?? await dummy());
  if (!user || !ok) throw new Error("Email or password is incorrect.");
  const token = await createSession(user.id);
  const session = await readSession(token);
  if (!session) throw new Error("Email or password is incorrect.");
  return { session, token };
}

export async function signOut(token: string | undefined) {
  await destroySession(token);
}

export async function sendPasswordReset(email: string, origin: string) {
  const message = process.env["NODE_ENV"] === "production"
    ? "Email delivery is not configured, so a reset link cannot be sent."
    : "If an account exists for that email, use the local reset link. Email is not sent in development.";
  if (process.env["NODE_ENV"] === "production") return { message };
  const [user] = await getDb().select({ id: users.id }).from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
  if (!user) return { message };
  const token = newToken();
  await getDb().insert(verificationTokens).values({
    userId: user.id,
    purpose: "reset",
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
  return { message, devResetUrl: `${origin}/reset-password?token=${token}` };
}

export async function resetPassword(token: string, password: string) {
  if (password.length < 8) throw new Error("Use at least 8 characters.");
  const db = getDb();
  const [row] = await db
    .select()
    .from(verificationTokens)
    .where(and(eq(verificationTokens.tokenHash, hashToken(token)), eq(verificationTokens.purpose, "reset")))
    .limit(1);
  if (!row || row.expiresAt.getTime() <= Date.now()) throw new Error("That link is invalid or has expired.");
  await db.update(users).set({ passwordHash: await hashPassword(password), updatedAt: new Date() }).where(eq(users.id, row.userId));
  await db.delete(verificationTokens).where(eq(verificationTokens.id, row.id));
  await db.delete(verificationTokens).where(and(eq(verificationTokens.userId, row.userId), eq(verificationTokens.purpose, "reset")));
}

export async function verifyEmail(token: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(verificationTokens)
    .where(and(eq(verificationTokens.tokenHash, hashToken(token)), eq(verificationTokens.purpose, "verify")))
    .limit(1);
  if (!row || row.expiresAt.getTime() <= Date.now()) throw new Error("That link is invalid or has expired.");
  await db.update(users).set({ emailVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, row.userId));
  await db.delete(verificationTokens).where(eq(verificationTokens.id, row.id));
}

export async function currentSession(token: string | undefined) {
  return readSession(token);
}

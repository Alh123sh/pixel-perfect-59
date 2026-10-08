import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { sessions, userRoles, users } from "@/db/schema";
import { hashToken, newToken } from "./passwords";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  isAdmin: boolean;
};

export async function readSession(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const db = getDb();
  const [row] = await db
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      phone: users.phone,
      role: userRoles.role,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .leftJoin(userRoles, eq(userRoles.userId, users.id))
    .where(eq(sessions.tokenHash, hashToken(token)))
    .limit(1);
  if (!row) return null;
  if (row.expiresAt.getTime() <= Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, row.sessionId));
    return null;
  }
  return { id: row.id, email: row.email, fullName: row.fullName, phone: row.phone, isAdmin: row.role === "admin" };
}

export async function createSession(userId: string) {
  const token = newToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await getDb().insert(sessions).values({ userId, tokenHash: hashToken(token), expiresAt });
  return token;
}

export async function destroySession(token: string | undefined) {
  if (!token) return;
  await getDb().delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
}

export async function requireAdmin(token: string | undefined) {
  const user = await readSession(token);
  if (!user) throw new Error("Sign in with an admin account.");
  if (!user.isAdmin) throw new Error("This account does not have admin access.");
  return user;
}

export async function requireUser(token: string | undefined) {
  const user = await readSession(token);
  if (!user) throw new Error("Sign in to continue.");
  return user;
}

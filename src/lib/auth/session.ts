import "server-only";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  encryptSession,
  decryptSession,
  type SessionPayload,
} from "./session-core";

export { SESSION_COOKIE, type SessionPayload };

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await encryptSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function deleteSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function readSessionCookie(): Promise<SessionPayload | null> {
  const store = await cookies();
  return decryptSession(store.get(SESSION_COOKIE)?.value);
}

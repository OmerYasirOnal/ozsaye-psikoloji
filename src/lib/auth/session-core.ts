import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "ozsaye_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 gün

export type SessionPayload = {
  staffId: string;
  email: string;
  role: "therapist" | "admin";
};

const key = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}

export async function decryptSession(
  token?: string,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    const { staffId, email, role } = payload as Record<string, unknown>;
    if (typeof staffId === "string" && typeof email === "string" &&
        (role === "therapist" || role === "admin")) {
      return { staffId, email, role };
    }
    return null;
  } catch {
    return null;
  }
}

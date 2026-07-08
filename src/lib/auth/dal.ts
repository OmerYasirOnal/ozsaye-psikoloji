import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSessionCookie, type SessionPayload } from "./session";

export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await readSessionCookie();
  if (!session) redirect("/panel/giris");
  return session;
});

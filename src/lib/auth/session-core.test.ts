import { expect, test } from "vitest";
import {
  encryptSession,
  decryptSession,
  type SessionPayload,
} from "./session-core";

const payload: SessionPayload = {
  staffId: "11111111-1111-1111-1111-111111111111",
  email: "melek@example.com",
  role: "therapist",
};

test("encrypt→decrypt payload'ı korur", async () => {
  const token = await encryptSession(payload);
  const out = await decryptSession(token);
  expect(out).toMatchObject(payload);
});

test("bozuk token null döner", async () => {
  expect(await decryptSession("bozuk.jwt.token")).toBeNull();
});

test("undefined token null döner", async () => {
  expect(await decryptSession(undefined)).toBeNull();
});

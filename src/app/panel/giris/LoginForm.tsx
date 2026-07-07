"use client";

import { useActionState } from "react";
import { requestMagicLink, type LoginState } from "./actions";

const initial: LoginState = {};

export default function LoginForm() {
  const [state, action, pending] = useActionState(requestMagicLink, initial);

  if (state.ok) {
    return (
      <p className="text-forest-muted">
        E-postanı kontrol et — giriş bağlantısını gönderdik (15 dk geçerli).
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <label htmlFor="email" className="text-forest font-medium">
        E-posta
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        className="rounded-md border border-stone px-4 py-3"
      />
      {state.error && (
        <p className="font-semibold text-forest">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-forest px-4 py-3 text-warm-white disabled:opacity-60"
      >
        {pending ? "Gönderiliyor…" : "Giriş bağlantısı gönder"}
      </button>
    </form>
  );
}

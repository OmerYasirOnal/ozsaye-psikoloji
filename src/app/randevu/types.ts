/**
 * Randevu formu — paylaşılan tip + sabit.
 *
 * NOT: Bu dosyada "use server" YOKTUR (bilerek). Server Action dosyası
 * (`actions.ts`, "use server") yalnızca async fonksiyon export edebilir; tip ve
 * sabitler (ActionState, initialState) bu yüzden burada tutulur ve hem
 * action'dan hem de istemci formundan import edilir.
 */

/** useActionState ile uyumlu form durumu. */
export type ActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: Record<string, string>;
};

/** Form ilk render edildiğindeki başlangıç durumu. */
export const initialState: ActionState = { status: "idle" };

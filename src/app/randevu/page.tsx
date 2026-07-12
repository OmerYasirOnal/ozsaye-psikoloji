import { redirect } from "next/navigation";

/**
 * /randevu gerçek bir sayfa değil — randevu formu ana sayfa çapasında
 * (/#randevu). Ziyaretçilerin (ve asistanın "randevu formu" yönlendirmesinin)
 * elle yazdırdığı bu doğal adres 404 yerine doğrudan forma insin.
 */
export default function RandevuYonlendirme() {
  redirect("/#randevu");
}

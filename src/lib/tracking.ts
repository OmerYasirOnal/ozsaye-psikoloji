export type TrackingEvent =
  | "service_page_view"
  | "cta_click"
  | "appointment_start"
  | "appointment_submit"
  | "blog_read_75";

type TrackingPayload = Record<string, string | number | boolean | undefined>;

export function trackEvent(event: TrackingEvent, payload: TrackingPayload = {}) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("ozsaye:event", {
      detail: {
        event,
        ...payload,
      },
    }),
  );

  const dataLayer = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(dataLayer)) {
    dataLayer.push({ event, ...payload });
  }
}

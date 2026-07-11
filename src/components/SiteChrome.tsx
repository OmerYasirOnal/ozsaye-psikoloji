"use client";

import { usePathname } from "next/navigation";

/**
 * Genel pazarlama sitesi kabuğunu (Header/Footer/StickyCta) `/panel/**`
 * rotalarında gizler. Panel, kendi header'ını (bkz. panel layout) render
 * eder; kök layout'un sabit (fixed) Header'ı üstüne binip tıklamaları
 * engelliyordu. Header/Footer/StickyCta sunucu bileşeni olarak kalabilsin
 * diye burada import edilmez, RootLayout'tan hazır node olarak alınır.
 */
export default function SiteChrome({
  header,
  footer,
  stickyCta,
  chatWidget,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  stickyCta: React.ReactNode;
  chatWidget: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPanel = pathname?.startsWith("/panel") ?? false;

  if (isPanel) {
    return <>{children}</>;
  }

  return (
    <>
      {header}
      {children}
      {footer}
      {stickyCta}
      {chatWidget}
    </>
  );
}

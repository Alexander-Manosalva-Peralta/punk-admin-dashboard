import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Punk Control — Gestión de Licencias & BI",
  description:
    "Panel de administración central para Punk Cobros. Gestión de licencias de pago único, bloqueo de dispositivos y métricas comerciales.",
  icons: {
    icon: "/logo_p_solo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full bg-[#F5F5F7]">
      <body className="h-full bg-[#F5F5F7] text-[#1D1D1F] antialiased">
        {children}
      </body>
    </html>
  );
}

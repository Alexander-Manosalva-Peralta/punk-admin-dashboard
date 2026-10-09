import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Punk Admin | Centro de Control & BI de Licencias",
  description:
    "Panel de administración centralizada para el ecosistema de cobros Punk. Gestión de licencias, bloqueo de dispositivos, y análisis de Business Intelligence.",
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
    <html lang="es" className="dark">
      <body className="min-h-screen bg-[#0A0D12] text-gray-100 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Russo_One } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const russoOne = Russo_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-russo",
});

export const metadata: Metadata = {
  title: "Prode Curupa Mundial 2026",
  description: "Predicciones del Mundial de Fútbol 2026",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${russoOne.variable} font-sans min-h-screen bg-mundial-base text-slate-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

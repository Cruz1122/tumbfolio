import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tumbfolio",
  description: "Convert executed notebooks into curated presentation decks."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

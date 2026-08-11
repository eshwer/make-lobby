import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Make Local Lobby",
  description: "Branch, visually edit, review, and round-trip real code with Figma Make Local.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

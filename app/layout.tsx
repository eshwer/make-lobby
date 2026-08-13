import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Make on your codebase",
  description: "Branch, visually edit, review, and round-trip real code with Figma on your codebase.",
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

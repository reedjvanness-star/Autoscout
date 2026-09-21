import type { Metadata } from "next";
import "./globals.css";
import "./friendly.css";

export const metadata: Metadata = {
  title: "MotorScout — AI Deal Finder",
  description: "Find your next car with conversational search, transparent comparisons, and honest source coverage.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProjectSphere",
  description: "A student project showcase and portfolio platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

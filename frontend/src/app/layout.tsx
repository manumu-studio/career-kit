/** Root layout and static metadata for Career Kit. */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Career Kit",
  description: "Optimize your CV for job applications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}

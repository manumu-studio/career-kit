/** Root layout and static metadata for ATS Career Kit. */
import type { Metadata } from "next";
import "./globals.css";
import { OptimizationProvider } from "@/context/OptimizationContext";

export const metadata: Metadata = {
  title: "ATS Career Kit",
  description: "Optimize your CV for applicant tracking systems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <OptimizationProvider>{children}</OptimizationProvider>
      </body>
    </html>
  );
}

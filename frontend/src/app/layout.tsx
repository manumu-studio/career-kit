/** Root layout and static metadata for Career Kit. */
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

/** Inline script to prevent theme flash — runs before paint, matches ThemeProvider logic. */
const THEME_INIT_SCRIPT = `
(function(){
  var t=localStorage.getItem('career-kit-theme');
  var d=window.matchMedia('(prefers-color-scheme: dark)').matches;
  var dark=t==='dark'||(t==='system'&&d)||(!t&&d);
  document.documentElement.classList.toggle('dark',dark);
})();
`;

export const metadata: Metadata = {
  title: "Career Kit by ManuMu Studio",
  description: "Optimize your CV for job applications.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const locale = headersList.get("x-next-intl-locale") ?? "en";

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <ThemeProvider>
          <TooltipProvider>
            <ErrorBoundary>
              <ToastProvider>{children}</ToastProvider>
            </ErrorBoundary>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

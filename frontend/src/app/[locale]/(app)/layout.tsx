/** Protected layout — checks auth, wraps with SessionProvider + OptimizationProvider. */
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/features/auth/auth";
import { OptimizationProvider } from "@/context/OptimizationContext";
import { Navbar } from "@/components/ui/Navbar";
import { PageTransition } from "@/components/ui/PageTransition";
import type { ReactNode } from "react";

/** Force dynamic rendering so auth() runs per-request, not at build time. */
export const dynamic = "force-dynamic";

const E2E_BYPASS =
  process.env.NEXT_PUBLIC_E2E_BYPASS_AUTH === "true";

const MOCK_E2E_SESSION = {
  user: {
    externalId: "e2e-test-user",
    name: "E2E Test User",
    email: "e2e@test.local",
  },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = E2E_BYPASS ? MOCK_E2E_SESSION : await auth();

  if (!session?.user?.externalId) {
    redirect("/");
  }

  const user = session.user;

  return (
    <SessionProvider session={session}>
      <Navbar
        mode="app"
        userName={user.name ?? null}
        userEmail={user.email ?? null}
      />
      <main className="min-h-screen pt-14">
        <OptimizationProvider>
          <PageTransition>{children}</PageTransition>
        </OptimizationProvider>
      </main>
    </SessionProvider>
  );
}

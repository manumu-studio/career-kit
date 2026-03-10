/** Protected layout — checks auth, wraps with SessionProvider + OptimizationProvider. */
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/features/auth/auth";
import { OptimizationProvider } from "@/context/OptimizationContext";
import { Navbar } from "@/components/ui/Navbar";
import type { ReactNode } from "react";

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
        userName={user.name}
        userEmail={user.email}
      />
      <main className="min-h-screen pt-14">
        <OptimizationProvider>{children}</OptimizationProvider>
      </main>
    </SessionProvider>
  );
}

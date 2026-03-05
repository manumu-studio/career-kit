/** Protected layout — checks auth, wraps with SessionProvider + OptimizationProvider. */
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/features/auth/auth";
import { OptimizationProvider } from "@/context/OptimizationContext";
import { UserBar } from "@/components/ui/UserBar";
import type { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user?.externalId) {
    redirect("/");
  }

  return (
    <SessionProvider session={session}>
      <UserBar userName={session.user.name} userEmail={session.user.email} />
      <OptimizationProvider>{children}</OptimizationProvider>
    </SessionProvider>
  );
}

/** Public layout — no auth required. */
import type { ReactNode } from "react";
import { Navbar } from "@/components/ui/Navbar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar mode="public" />
      <main className="min-h-screen pt-14">
        {children}
      </main>
    </>
  );
}

/** Public layout — no auth required. */
import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/** Localized 404 — redirects unknown routes to home. */
import { redirect } from "next/navigation";

export default function NotFoundPage() {
  redirect("/");
}

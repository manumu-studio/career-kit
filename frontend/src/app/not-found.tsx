/** Root 404 — redirects unmatched routes to home. */
import { redirect } from "next/navigation";

export default function NotFound() {
  redirect("/");
}

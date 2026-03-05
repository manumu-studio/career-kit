/** Signup redirect — initiates OAuth flow with mode=signup for M2 Auth. */
import { signIn } from "@/features/auth/auth";

export async function GET() {
  return await signIn("manumustudio", { callbackUrl: "/home" }, { mode: "signup" });
}

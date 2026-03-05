/** Public landing page with sign-in CTA or dashboard link. */
import { auth, signIn } from "@/features/auth/auth";
import Link from "next/link";

interface LandingPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LandingPage({ searchParams }: LandingPageProps) {
  const session = await auth();
  const params = await searchParams;
  const error = params.error;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white">Career Kit</h1>
        <p className="mt-4 text-lg text-slate-300">
          AI-powered CV optimization for job applications.
        </p>

        <div className="mt-8">
          {session?.user ? (
            <Link
              href="/home"
              className="inline-block rounded-lg bg-sky-500 px-8 py-3 text-lg font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Go to App
            </Link>
          ) : (
            <>
              {error ? (
                <div className="mx-auto mb-6 max-w-md rounded-md border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
                  Authentication failed. Please try again.
                </div>
              ) : null}

              <form
                action={async () => {
                  "use server";
                  await signIn("manumustudio", { callbackUrl: "/home" });
                }}
                className="mx-auto max-w-md"
              >
                <button
                  type="submit"
                  className="w-full rounded-lg bg-sky-500 px-8 py-3 text-lg font-semibold text-slate-950 transition hover:bg-sky-400"
                >
                  Sign in with ManuMuStudio
                </button>
              </form>

              <p className="mt-4 text-sm text-slate-400">
                Don&apos;t have an account?{" "}
                <Link href="/api/auth/signup" className="text-sky-400 hover:underline">
                  Create one here
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

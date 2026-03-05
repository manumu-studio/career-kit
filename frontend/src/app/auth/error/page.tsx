/** Auth error page — displays authentication failure details. */
import Link from "next/link";

interface AuthErrorPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams;
  const error = params.error;

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "Access was denied. You may not have permission to sign in.",
    Verification: "The verification link may have expired or already been used.",
    OAuthSignin: "Could not start the sign-in process. Please try again.",
    OAuthCallback: "Authentication callback failed. Please try again.",
    OAuthCreateAccount: "Could not create your account. Please try again.",
    Callback: "Authentication callback error. Please try again.",
    Default: "An unexpected authentication error occurred.",
  };

  const message = error ? (errorMessages[error] ?? errorMessages["Default"]) : errorMessages["Default"];

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-white">Authentication Error</h1>
        <p className="mt-4 text-slate-300">{message}</p>
        {error ? (
          <p className="mt-2 text-sm text-slate-500">Error code: {error}</p>
        ) : null}
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-sky-500 px-6 py-2.5 font-semibold text-slate-950 transition hover:bg-sky-400"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}

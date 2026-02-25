"use client";

/** Upload page where users submit CV + job description for optimization. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/ui/FileUpload";
import { JobDescription } from "@/components/ui/JobDescription";
import { useOptimizationContext } from "@/context/OptimizationContext";
import { optimizeCV } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const { setResult } = useOptimizationContext();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const isReadyToSubmit = file !== null && jobDescription.trim().length > 0;

  const handleSubmit = async (): Promise<void> => {
    if (!file || !isReadyToSubmit) {
      return;
    }

    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      const result = await optimizeCV(file, jobDescription.trim());
      setResult(result);
      router.push("/results");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to optimize CV. Please try again.";
      setSubmissionError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight text-white">ATS Career Kit</h1>
        <p className="text-base text-slate-300">Optimize your CV for any job posting</p>
      </header>

      <FileUpload onFileChange={setFile} />
      <JobDescription onChange={setJobDescription} value={jobDescription} />

      {submissionError ? <p className="text-sm text-rose-300">{submissionError}</p> : null}

      <button
        className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-sky-500 px-5 py-2.5 font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
        disabled={!isReadyToSubmit || isSubmitting}
        onClick={() => {
          void handleSubmit();
        }}
        type="button"
      >
        {isSubmitting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
            Analyzing...
          </>
        ) : (
          "Optimize My CV"
        )}
      </button>
    </main>
  );
}

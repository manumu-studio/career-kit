"use client";

/** Controlled textarea for entering a target job description. */
import type { JobDescriptionProps } from "./JobDescription.types";

export function JobDescription({ value, onChange }: JobDescriptionProps) {
  return (
    <section className="w-full space-y-3">
      <h2 className="text-lg font-semibold text-white">Job Description</h2>

      <div className="relative">
        <textarea
          className="min-h-[200px] w-full resize-y rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
          onChange={(event) => {
            onChange(event.target.value);
          }}
          placeholder="Paste the job description here..."
          value={value}
        />

        <p className="pointer-events-none absolute bottom-3 right-3 text-xs text-slate-400">
          {value.length} characters
        </p>
      </div>
    </section>
  );
}

"use client";

/** Formatted cover letter display with greeting, paragraphs, sign-off, and selling points. */
import type { CoverLetterDisplayProps } from "./CoverLetterDisplay.types";

export function CoverLetterDisplay({ coverLetter }: CoverLetterDisplayProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Cover Letter</h2>
        <div className="space-y-4 text-slate-200">
          <p className="font-medium">{coverLetter.greeting}</p>
          <p className="leading-relaxed">{coverLetter.opening_paragraph}</p>
          {coverLetter.body_paragraphs.map((para, i) => (
            <p key={i} className="leading-relaxed">
              {para}
            </p>
          ))}
          <p className="leading-relaxed">{coverLetter.closing_paragraph}</p>
          <p className="font-medium">{coverLetter.sign_off}</p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <span className="rounded-full bg-slate-700 px-2 py-0.5">
            {coverLetter.word_count} words
          </span>
          <span className="rounded-full bg-slate-700 px-2 py-0.5 capitalize">
            {coverLetter.tone_used}
          </span>
        </div>
      </div>
      {coverLetter.key_selling_points.length > 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-300">
            Key selling points
          </h3>
          <ul className="flex flex-wrap gap-2">
            {coverLetter.key_selling_points.map((point, i) => (
              <li
                key={i}
                className="rounded-md bg-slate-800 px-3 py-1.5 text-sm text-slate-200"
              >
                {point}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

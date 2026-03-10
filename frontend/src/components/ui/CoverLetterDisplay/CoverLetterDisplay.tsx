"use client";

/** Formatted cover letter display in paper-style container with company header and tone badge. */
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { CoverLetterDisplayProps } from "./CoverLetterDisplay.types";

export function CoverLetterDisplay({
  coverLetter,
  companyName,
  roleName,
}: CoverLetterDisplayProps) {
  const t = useTranslations("coverLetter");

  return (
    <section className="space-y-6">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 text-slate-900 shadow-lg dark:bg-slate-50">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            {companyName ? (
              <p className="text-sm font-medium text-slate-600 dark:text-slate-500">
                {companyName}
                {roleName ? ` · ${roleName}` : ""}
              </p>
            ) : null}
          </div>
          <Badge variant="secondary" className="capitalize shrink-0">
            {coverLetter.tone_used}
          </Badge>
        </div>

        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-900">
          Cover Letter
        </h2>
        <div className="space-y-4 text-slate-700 dark:text-slate-800">
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
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="rounded-full bg-slate-200 px-2 py-0.5 dark:bg-slate-300">
            {coverLetter.word_count} words
          </span>
        </div>
      </div>

      {coverLetter.key_selling_points.length > 0 ? (
        <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            {t("sellingPoints")}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {coverLetter.key_selling_points.map((point, i) => (
              <li
                key={i}
                className="rounded-md bg-muted px-3 py-1.5 text-sm text-foreground"
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

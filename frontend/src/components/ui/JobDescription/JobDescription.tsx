"use client";

/** Controlled textarea for entering a target job description. */
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { JobDescriptionProps } from "./JobDescription.types";

const DEFAULT_MIN = 50;
const DEFAULT_MAX = 10000;

export function JobDescription({
  value,
  onChange,
  error,
  minLength = DEFAULT_MIN,
  maxLength = DEFAULT_MAX,
}: JobDescriptionProps) {
  const t = useTranslations("home");
  const tValidation = useTranslations("validation");
  const isOverMax = value.length > maxLength;

  return (
    <section className="w-full space-y-3">
      <h2 className="text-lg font-semibold text-white">{t("jobDescLabel")}</h2>

      <div className="relative">
        <textarea
          aria-invalid={!!error}
          aria-describedby={error ? "job-desc-error" : undefined}
          className={cn(
            "min-h-[200px] w-full resize-y rounded-xl border bg-slate-900/60 p-4 text-sm text-slate-100 outline-none transition focus:ring-2",
            error
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/30"
              : "border-slate-700 focus:border-sky-500 focus:ring-sky-500/30",
          )}
          maxLength={maxLength}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          placeholder={t("jobDescPlaceholder")}
          value={value}
        />

        <p
          className={cn(
            "pointer-events-none absolute bottom-3 right-3 text-xs",
            isOverMax ? "text-rose-400" : "text-slate-400",
          )}
        >
          {value.length} / {maxLength}
        </p>
      </div>

      {error ? (
        <p className="text-sm text-rose-300" id="job-desc-error" role="alert">
          {error}
        </p>
      ) : value.length > 0 && value.length < minLength ? (
        <p className="text-sm text-amber-400">
          {tValidation("addMoreChars", {
            remaining: minLength - value.length,
            min: minLength,
          })}
        </p>
      ) : null}
    </section>
  );
}

"use client";

/** Controlled textarea for entering a target job description. */
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
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
      <h2 className="text-lg font-semibold text-foreground">{t("jobDescLabel")}</h2>

      <div className="relative">
        <Textarea
          aria-invalid={!!error}
          aria-describedby={error ? "job-desc-error" : undefined}
          className={cn(
            "min-h-[200px] resize-y rounded-xl",
            error && "border-destructive focus-visible:ring-destructive/30",
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
            isOverMax ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {value.length} / {maxLength}
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive" id="job-desc-error" role="alert">
          {error}
        </p>
      ) : value.length > 0 && value.length < minLength ? (
        <p className="text-sm text-warning">
          {tValidation("addMoreChars", {
            remaining: minLength - value.length,
            min: minLength,
          })}
        </p>
      ) : null}
    </section>
  );
}

"use client";

/** Company name and optional hiring manager inputs for cover letter personalization. */
import type { CompanyInfoProps } from "./CompanyInfo.types";

export function CompanyInfo({
  companyName,
  hiringManager,
  onCompanyNameChange,
  onHiringManagerChange,
  disabled = false,
}: CompanyInfoProps) {
  return (
    <div className="space-y-4">
      <div>
        <label
          className="mb-1 block text-sm font-medium text-muted-foreground"
          htmlFor="company-name"
        >
          Company name <span className="text-destructive">*</span>
        </label>
        <input
          className="w-full rounded-md border border-border bg-muted px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
          disabled={disabled}
          id="company-name"
          onChange={(e) => onCompanyNameChange(e.target.value)}
          placeholder="Acme Inc"
          type="text"
          value={companyName}
        />
      </div>
      <div>
        <label
          className="mb-1 block text-sm font-medium text-muted-foreground"
          htmlFor="hiring-manager"
        >
          Hiring manager name <span className="text-muted-foreground/60">(optional)</span>
        </label>
        <input
          className="w-full rounded-md border border-border bg-muted px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
          disabled={disabled}
          id="hiring-manager"
          onChange={(e) =>
            onHiringManagerChange(e.target.value.trim() || null)
          }
          placeholder="Dear [Name] — leave blank for &quot;Dear Hiring Manager&quot;"
          type="text"
          value={hiringManager ?? ""}
        />
      </div>
    </div>
  );
}

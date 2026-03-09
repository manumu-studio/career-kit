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
          className="mb-1 block text-sm font-medium text-slate-300"
          htmlFor="company-name"
        >
          Company name <span className="text-rose-400">*</span>
        </label>
        <input
          className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
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
          className="mb-1 block text-sm font-medium text-slate-300"
          htmlFor="hiring-manager"
        >
          Hiring manager name <span className="text-slate-500">(optional)</span>
        </label>
        <input
          className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
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

/** Company intelligence types (research result inferred from API Zod schema). */

export type {
  CompanyProfile,
  CompanyReport,
  CompanyResearchResult,
  EmployeeSentiment,
  InterviewInsight,
  NewsItem,
} from "@/lib/schemas/company.schema";

export type Locale = "en" | "es";

export interface CompanyResearchRequest {
  company_name: string;
  company_url: string | null;
  job_title: string | null;
  force_refresh?: boolean;
  language?: Locale;
}

export type ResearchStep =
  | "idle"
  | "scraping"
  | "searching"
  | "analyzing"
  | "done"
  | "error";

/** Company intelligence types mirroring backend company research schemas. */
export interface NewsItem {
  headline: string;
  source: string;
  date: string | null;
  relevance: string;
}

export interface InterviewInsight {
  tip: string;
  source: string;
  role_specific: boolean;
}

export interface EmployeeSentiment {
  overall: "positive" | "mixed" | "negative";
  pros: string[];
  cons: string[];
  summary: string;
}

export interface CompanyProfile {
  name: string;
  website: string | null;
  industry: string;
  size_estimate: string;
  mission_statement: string | null;
  core_values: string[];
  culture_keywords: string[];
  tech_stack: string[];
  recent_news: NewsItem[];
  interview_insights: InterviewInsight[];
  employee_sentiment: EmployeeSentiment;
  benefits_highlights: string[];
  leadership_names: string[];
}

export interface CompanyReport {
  executive_summary: string;
  culture_and_values: string;
  what_they_look_for: string;
  interview_preparation: string;
  recent_developments: string;
  red_flags: string[];
  talking_points: string[];
  keywords_to_mirror: string[];
}

export interface CompanyResearchResult {
  profile: CompanyProfile;
  report: CompanyReport;
  sources_used: string[];
  research_quality: "high" | "medium" | "low";
  researched_at: string;
}

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

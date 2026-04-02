/** Zod schemas for company research API responses. */
import { z } from "zod";

const NewsItemSchema = z.object({
  headline: z.string(),
  source: z.string(),
  date: z.string().nullable(),
  relevance: z.string(),
});

const InterviewInsightSchema = z.object({
  tip: z.string(),
  source: z.string(),
  role_specific: z.boolean(),
});

const EmployeeSentimentSchema = z.object({
  overall: z.enum(["positive", "mixed", "negative"]),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  summary: z.string(),
});

const CompanyProfileSchema = z.object({
  name: z.string(),
  website: z.string().nullable(),
  industry: z.string(),
  size_estimate: z.string(),
  mission_statement: z.string().nullable(),
  core_values: z.array(z.string()),
  culture_keywords: z.array(z.string()),
  tech_stack: z.array(z.string()),
  recent_news: z.array(NewsItemSchema),
  interview_insights: z.array(InterviewInsightSchema),
  employee_sentiment: EmployeeSentimentSchema,
  benefits_highlights: z.array(z.string()),
  leadership_names: z.array(z.string()),
});

const CompanyReportSchema = z.object({
  executive_summary: z.string(),
  culture_and_values: z.string(),
  what_they_look_for: z.string(),
  interview_preparation: z.string(),
  recent_developments: z.string(),
  red_flags: z.array(z.string()),
  talking_points: z.array(z.string()),
  keywords_to_mirror: z.array(z.string()),
});

export const CompanyResearchResultSchema = z
  .object({
    profile: CompanyProfileSchema,
    report: CompanyReportSchema,
    sources_used: z.array(z.string()),
    research_quality: z.enum(["high", "medium", "low"]),
    researched_at: z.string(),
  })
  .passthrough();

export type NewsItem = z.infer<typeof NewsItemSchema>;
export type InterviewInsight = z.infer<typeof InterviewInsightSchema>;
export type EmployeeSentiment = z.infer<typeof EmployeeSentimentSchema>;
export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;
export type CompanyReport = z.infer<typeof CompanyReportSchema>;
export type CompanyResearchResult = z.infer<typeof CompanyResearchResultSchema>;

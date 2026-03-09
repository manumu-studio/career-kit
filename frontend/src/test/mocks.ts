/** Deterministic test factories for optimization domain data. */
import type { CvSection, Gap, OptimizationResult } from "@/types/optimization";
import type { CoverLetterResult } from "@/types/cover-letter";
import type { CompanyResearchResult } from "@/types/company";
import type { CachedMatchInfo, HistoryListItem } from "@/types/history";
import type { ComparisonResult, ProvidersResponse } from "@/types/provider";

export function mockCvSection(overrides?: Partial<CvSection>): CvSection {
  return {
    heading: "Experience",
    original: "Built APIs for internal tools.",
    optimized: "Built resilient APIs for internal tools with measurable outcomes.",
    changes_made: ["Added job-relevant keywords", "Added measurable impact"],
    ...overrides,
  };
}

export function mockGap(overrides?: Partial<Gap>): Gap {
  return {
    skill: "Kubernetes",
    importance: "preferred",
    suggestion: "Consider adding one production deployment bullet.",
    ...overrides,
  };
}

export function mockOptimizationResult(
  overrides?: Partial<OptimizationResult>,
): OptimizationResult {
  return {
    sections: [
      mockCvSection(),
      {
        heading: "Projects",
        original: "Created dashboards.",
        optimized: "Created dashboards with performance tracking and stakeholder insights.",
        changes_made: ["Improved specificity"],
      },
    ],
    gap_analysis: [
      {
        skill: "System Design",
        importance: "critical",
        suggestion: "Add architecture and scaling examples.",
      },
      mockGap(),
    ],
    keyword_matches: ["Python", "FastAPI", "React"],
    keyword_misses: ["AWS"],
    match_score: 75,
    summary: "Strong fit with a few infrastructure gaps.",
    ...overrides,
  };
}

export function mockCoverLetterResult(
  overrides?: Partial<CoverLetterResult>,
): CoverLetterResult {
  return {
    greeting: "Dear Hiring Manager,",
    opening_paragraph:
      "I am excited to apply for the Software Engineer position at your company.",
    body_paragraphs: [
      "With my experience in Python and FastAPI, I am confident I can contribute to your team.",
    ],
    closing_paragraph: "Thank you for considering my application.",
    sign_off: "Sincerely,",
    key_selling_points: ["5+ years Python experience", "FastAPI production deployments"],
    tone_used: "professional",
    word_count: 120,
    ...overrides,
  };
}

export function mockCompanyResearchResult(
  overrides?: Partial<CompanyResearchResult>,
): CompanyResearchResult {
  const base: CompanyResearchResult = {
    profile: {
      name: "Acme Corp",
      website: "https://acme.example.com",
      industry: "Technology",
      size_estimate: "100-500",
      mission_statement: "Build great products.",
      core_values: ["Innovation", "Quality"],
      culture_keywords: ["remote", "agile"],
      tech_stack: ["Python", "React"],
      recent_news: [],
      interview_insights: [],
      employee_sentiment: {
        overall: "positive",
        pros: ["Great culture"],
        cons: [],
        summary: "Positive reviews.",
      },
      benefits_highlights: [],
      leadership_names: [],
    },
    report: {
      executive_summary: "Tech company focused on innovation.",
      culture_and_values: "Collaborative and fast-paced.",
      what_they_look_for: "Strong engineering skills.",
      interview_preparation: "Review system design.",
      recent_developments: "Expanding engineering team.",
      red_flags: [],
      talking_points: [],
      keywords_to_mirror: [],
    },
    sources_used: [],
    research_quality: "high",
    researched_at: "2024-01-15T12:00:00Z",
  };
  if (!overrides) return base;
  return {
    ...base,
    ...overrides,
    profile: overrides.profile ? { ...base.profile, ...overrides.profile } : base.profile,
    report: overrides.report ? { ...base.report, ...overrides.report } : base.report,
  };
}

export function mockHistoryEntry(
  overrides?: Partial<HistoryListItem>,
): HistoryListItem {
  return {
    id: "hist-001",
    analysis_type: "optimize",
    company_name: "Acme Corp",
    job_title: "Software Engineer",
    job_description_preview: "Need Python and FastAPI...",
    cv_filename: "resume.pdf",
    created_at: "2024-01-15T12:00:00Z",
    expires_at: "2024-02-15T12:00:00Z",
    cache_hit: false,
    match_score: 75,
    ...overrides,
  };
}

export function mockProviderInfo() {
  return {
    name: "anthropic",
    displayName: "Claude",
    model: "claude-sonnet-4-20250514",
    speedTier: "medium" as const,
    costTier: "$$" as const,
  };
}

export function mockProvidersResponse(
  overrides?: Partial<ProvidersResponse>,
): ProvidersResponse {
  return {
    available: ["anthropic", "openai", "gemini"],
    default: "anthropic",
    ...overrides,
  };
}

export function mockCachedMatchInfo(
  overrides?: Partial<CachedMatchInfo>,
): CachedMatchInfo {
  return {
    analysis_id: "hist-001",
    company_name: "Acme Corp",
    job_title: "Software Engineer",
    created_at: "2024-01-15T12:00:00Z",
    ...overrides,
  };
}

export function mockComparisonResult(
  overrides?: Partial<ComparisonResult>,
): ComparisonResult {
  return {
    results: {
      anthropic: mockOptimizationResult({ match_score: 78 }),
      openai: mockOptimizationResult({ match_score: 72 }),
    },
    comparison: {
      score_delta: { anthropic: 0, openai: -6 },
      unique_keywords: { anthropic: ["Claude"], openai: ["GPT"] },
      processing_time_ms: { anthropic: 1200, openai: 800 },
    },
    ...overrides,
  };
}

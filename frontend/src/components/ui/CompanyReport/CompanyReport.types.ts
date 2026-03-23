/** Props for full company research report rendering component. */
import type { CompanyResearchResult } from "@/types/company";

export interface CompanyReportProps {
  research: CompanyResearchResult;
  className?: string;
  headingLevel?: "h1" | "h2" | "h3";
}

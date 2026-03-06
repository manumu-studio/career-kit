/** Props for company research form and orchestration component. */
import type { CompanyResearchResult } from "@/types/company";

export interface CompanySearchProps {
  onResearchComplete: (result: CompanyResearchResult) => void;
  onResearchError: (error: string) => void;
  onViewReport?: () => void;
  userId?: string;
  className?: string;
}

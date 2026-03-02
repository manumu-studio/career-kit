/** Props for compact company research summary card. */
import type { CompanyProfile } from "@/types/company";

export interface CompanyCardProps {
  profile: CompanyProfile;
  researchQuality: "high" | "medium" | "low";
  onViewFullReport: () => void;
  className?: string;
}

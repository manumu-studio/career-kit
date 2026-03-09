/** Types for CompanyInfo component. */

export interface CompanyInfoProps {
  companyName: string;
  hiringManager: string | null;
  onCompanyNameChange: (value: string) => void;
  onHiringManagerChange: (value: string | null) => void;
  disabled?: boolean;
}

/** Props for the JobDescription textarea component. */
export interface JobDescriptionProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  minLength?: number;
  maxLength?: number;
}

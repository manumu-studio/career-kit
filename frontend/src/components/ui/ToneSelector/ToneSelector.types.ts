/** Types for ToneSelector component. */

import type { CoverLetterTone } from "@/types/cover-letter";

export interface ToneSelectorProps {
  value: CoverLetterTone;
  onChange: (tone: CoverLetterTone) => void;
  disabled?: boolean;
}

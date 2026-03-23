"use client";

/** Radio selector for cover letter tone: professional, conversational, enthusiastic. */
import type { CoverLetterTone } from "@/types/cover-letter";
import type { ToneSelectorProps } from "./ToneSelector.types";

const TONES: { value: CoverLetterTone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "conversational", label: "Conversational" },
  { value: "enthusiastic", label: "Enthusiastic" },
];

export function ToneSelector({
  value,
  onChange,
  disabled = false,
}: ToneSelectorProps) {
  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-muted-foreground">Tone</span>
      <div className="flex flex-wrap gap-4">
        {TONES.map(({ value: toneValue, label }) => (
          <label
            key={toneValue}
            className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
          >
            <input
              checked={value === toneValue}
              disabled={disabled}
              name="tone"
              onChange={() => onChange(toneValue)}
              type="radio"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}

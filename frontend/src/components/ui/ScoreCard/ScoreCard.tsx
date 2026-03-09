/** Renders job match score as a circular progress card. */
import type { ScoreCardProps } from "@/components/ui/ScoreCard/ScoreCard.types";
import { useScoreCard } from "@/components/ui/ScoreCard/useScoreCard";

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreCard({ score }: Readonly<ScoreCardProps>) {
  const { score: clampedScore, label, accentClass, trailClass, offset } = useScoreCard(score);

  return (
    <article className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:mx-auto md:max-w-xs md:p-6 lg:mx-0 lg:max-w-none">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-300">Job Match</h2>
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-32 w-32">
          <svg className="-rotate-90" viewBox="0 0 120 120">
            <circle
              className={trailClass}
              cx="60"
              cy="60"
              fill="none"
              r={RADIUS}
              stroke="currentColor"
              strokeWidth="10"
            />
            <circle
              className={`${accentClass} transition-all duration-500`}
              cx="60"
              cy="60"
              fill="none"
              r={RADIUS}
              stroke="currentColor"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              strokeLinecap="round"
              strokeWidth="10"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className={`text-3xl font-semibold ${accentClass}`}>{clampedScore}</p>
          </div>
        </div>
        <p className={`text-sm font-medium ${accentClass}`}>{label}</p>
      </div>
    </article>
  );
}

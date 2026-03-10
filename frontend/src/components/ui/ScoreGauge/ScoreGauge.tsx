/** Full circular score gauge — 4 segments (red/orange/yellow/green), needle, center score. */
"use client";

import type { ScoreGaugeProps } from "./ScoreGauge.types";

const SEGMENT_COLORS = [
  { color: "#ef4444" },
  { color: "#f97316" },
  { color: "#eab308" },
  { color: "#22c55e" },
] as const;

function clampScore(score: number): number {
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function ScoreGauge({ score, size = 140, label = "Job Match" }: ScoreGaugeProps) {
  const clampedScore = clampScore(score);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const circumference = 2 * Math.PI * radius;
  const segmentLength = circumference / 4;

  const needleAngle = ((90 - (clampedScore / 100) * 360) * Math.PI) / 180;
  const needleLength = radius - strokeWidth / 2;
  const needleX = cx + needleLength * Math.cos(needleAngle);
  const needleY = cy - needleLength * Math.sin(needleAngle);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        {/* Track background */}
        <circle
          r={radius}
          cx={cx}
          cy={cy}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Colored segments */}
        {SEGMENT_COLORS.map((seg, i) => (
          <circle
            key={seg.color}
            r={radius}
            cx={cx}
            cy={cy}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
            strokeDashoffset={-i * segmentLength}
            strokeLinecap="butt"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ))}
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className="text-foreground opacity-30"
        />
        <circle
          r={4}
          cx={cx}
          cy={cy}
          fill="currentColor"
          className="text-foreground opacity-30"
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        aria-hidden
      >
        <span className="text-2xl font-bold tabular-nums text-foreground">
          {clampedScore}
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

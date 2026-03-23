/** Full circular score gauge — 3 segments (red 25% / orange 50% / green 25%), needle, center score. */
"use client";

import { useEffect, useState } from "react";
import type { ScoreGaugeProps } from "./ScoreGauge.types";

const SEGMENTS = [
  { color: "var(--destructive)", share: 0.25 },
  { color: "var(--warning)", share: 0.5 },
  { color: "var(--success)", share: 0.25 },
] as const;

function clampScore(score: number): number {
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function ScoreGauge({ score, size = 140, label = "Job Match", animateFrom }: ScoreGaugeProps) {
  const clampedScore = clampScore(score);
  const [displayedScore, setDisplayedScore] = useState(animateFrom ?? clampedScore);

  useEffect(() => {
    if (animateFrom === undefined) {
      setDisplayedScore(clampedScore);
      return;
    }
    const start = animateFrom;
    const end = clampedScore;
    const duration = 1000;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedScore(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [animateFrom, clampedScore]);

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const circumference = 2 * Math.PI * radius;

  const needleAngle = ((90 - (displayedScore / 100) * 360) * Math.PI) / 180;
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
        {/* Colored segments: red 25%, orange 50%, green 25% */}
        {SEGMENTS.map((seg, i) => {
          const segmentLength = seg.share * circumference;
          const offset = SEGMENTS.slice(0, i).reduce((sum, s) => sum + s.share, 0) * -circumference;
          return (
            <circle
              key={seg.color}
              r={radius}
              cx={cx}
              cy={cy}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
        })}
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
          {displayedScore}
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

/** Open-arc score gauge — 240° arc with true path gradient, needle, score below. */
"use client";

import { useEffect, useState } from "react";
import type { ScoreGaugeProps } from "./ScoreGauge.types";

function clampScore(score: number): number {
  return Math.min(100, Math.max(0, Math.round(score)));
}

/** Interpolate between two [r,g,b,a] colors at t ∈ [0,1]. */
function lerpColor(
  a: [number, number, number, number],
  b: [number, number, number, number],
  t: number,
): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  const alpha = +(a[3] + (b[3] - a[3]) * t).toFixed(2);
  return `rgba(${r},${g},${bl},${alpha})`;
}

/**
 * Color stops — blue gradient from faint to deep.
 * Low match = lightest blue, high match = darkest navy.
 */
const COLOR_STOPS: Array<{ at: number; rgba: [number, number, number, number] }> = [
  { at: 0,    rgba: [229, 77, 77, 1] },      // pinkish-red (matches missing chips)
  { at: 0.25, rgba: [160, 150, 210, 0.8] },  // transitional lavender
  { at: 0.5,  rgba: [70, 130, 220, 0.85] },  // medium blue
  { at: 0.75, rgba: [40, 90, 200, 1] },      // strong blue
  { at: 1,    rgba: [15, 45, 130, 1] },       // deep navy
];

/** Sample a color from the gradient at position t ∈ [0,1]. */
function sampleColor(t: number): string {
  const first = COLOR_STOPS[0] as (typeof COLOR_STOPS)[number];
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const curr = COLOR_STOPS[i] as (typeof COLOR_STOPS)[number];
    const next = COLOR_STOPS[i + 1] as (typeof COLOR_STOPS)[number];
    if (t >= curr.at && t <= next.at) {
      const local = (t - curr.at) / (next.at - curr.at);
      return lerpColor(curr.rgba, next.rgba, local);
    }
  }
  return lerpColor(first.rgba, first.rgba, 0);
}

/** Number of small arc segments to approximate the gradient. */
const SEGMENT_COUNT = 40;

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
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedScore(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [animateFrom, clampedScore]);

  /* Arc geometry — 240° visible, 120° gap at bottom */
  const strokeWidth = Math.round(size * 0.05);
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  /* Arc angular range in radians (SVG coords: 0°=right, clockwise) */
  const startDeg = 150;
  const sweepDeg = 240;

  /* Build arc segments with interpolated colors */
  const segAngle = sweepDeg / SEGMENT_COUNT;
  const segments: Array<{ d: string; color: string }> = [];

  for (let i = 0; i < SEGMENT_COUNT; i++) {
    const t = i / SEGMENT_COUNT;
    const a1 = startDeg + i * segAngle;
    const a2 = startDeg + (i + 1) * segAngle;
    const r1 = (a1 * Math.PI) / 180;
    const r2 = (a2 * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(r1);
    const y1 = cy + radius * Math.sin(r1);
    const x2 = cx + radius * Math.cos(r2);
    const y2 = cy + radius * Math.sin(r2);

    segments.push({
      d: `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`,
      color: sampleColor(t),
    });
  }

  /* Needle */
  const needleDeg = startDeg + (displayedScore / 100) * sweepDeg;
  const needleRad = (needleDeg * Math.PI) / 180;
  const needleLen = radius - strokeWidth * 2;
  const needleX = cx + needleLen * Math.cos(needleRad);
  const needleY = cy + needleLen * Math.sin(needleRad);

  /* Text sizing */
  const scoreFontSize = Math.round(size * 0.28);
  const labelFontSize = Math.round(size * 0.11);
  const scoreOffset = Math.round(size * 0.55);

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          {/* Gradient arc segments */}
          {segments.map((seg, i) => (
            <path
              key={i}
              d={seg.d}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeLinecap={i === 0 || i === segments.length - 1 ? "round" : "butt"}
            />
          ))}

          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            className="text-foreground/70"
          />
          <circle
            r={3}
            cx={cx}
            cy={cy}
            fill="currentColor"
            className="text-foreground/60"
          />
        </svg>

        {/* Score + label inside the arc gap */}
        <div
          className="absolute inset-x-0 flex flex-col items-center"
          style={{ top: scoreOffset }}
        >
          <span
            className="font-bold tabular-nums text-foreground"
            style={{ fontSize: scoreFontSize, lineHeight: 1 }}
          >
            {displayedScore}
          </span>
          <span
            className="mt-0.5 text-muted-foreground"
            style={{ fontSize: labelFontSize }}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

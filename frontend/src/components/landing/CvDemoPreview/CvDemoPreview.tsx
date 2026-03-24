"use client";
/** Miniaturized CV demo component for landing hero animation. */

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { CvDemoPreviewProps } from "./CvDemoPreview.types";

const CV_NAME = "Manuel Murillo";
const CV_SUBTITLE = "Full-Stack Engineer · Cloud & Auth Specialist";
const CV_CONTACT = "London, UK · manuel@email.com · linkedin.com/in/manumurillo";

const CV_SUMMARY =
  "Full-stack engineer with 3+ years building scalable web applications. Expertise in React, Node.js, and cloud-native architectures with a focus on authentication systems and developer experience.";

const CV_SKILLS: Array<{ text: string; isKeyword: boolean }> = [
  { text: "React", isKeyword: true },
  { text: "Node.js", isKeyword: true },
  { text: "TypeScript", isKeyword: true },
  { text: "Next.js", isKeyword: true },
  { text: "OAuth 2.0", isKeyword: true },
  { text: "OIDC", isKeyword: true },
  { text: "AWS", isKeyword: true },
  { text: "PostgreSQL", isKeyword: true },
  { text: "Docker", isKeyword: false },
  { text: "CI/CD", isKeyword: false },
  { text: "REST APIs", isKeyword: true },
  { text: "Python", isKeyword: true },
];

const CV_BULLETS = [
  "Built OAuth 2.0 + OIDC authentication system handling 50k+ monthly sessions with PKCE flow",
  "Designed multi-provider LLM abstraction serving 3 AI providers with unified API interface",
  "Implemented real-time company intelligence pipeline with web scraping and NLP analysis",
];

function TypewriterText({ text }: { text: string }) {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (displayCount >= text.length) return;
    const timer = setTimeout(() => {
      setDisplayCount((c) => c + 1);
    }, 20);
    return () => clearTimeout(timer);
  }, [displayCount, text.length]);

  return (
    <span style={{ color: "#444444" }}>
      {text.slice(0, displayCount)}
      {displayCount < text.length && (
        <span className="animate-typewriter-cursor">|</span>
      )}
    </span>
  );
}

export function CvDemoPreview({
  highlightedKeywords,
  animationPhase,
  rewrittenBullet,
  className,
}: CvDemoPreviewProps) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const effectivePhase = hydrated ? animationPhase : "complete";

  const isHighlighted = (keyword: string): boolean => {
    if (effectivePhase === "idle" || effectivePhase === "scanning")
      return false;
    if (effectivePhase === "complete")
      return highlightedKeywords.includes(keyword);
    return highlightedKeywords.includes(keyword);
  };

  const renderBullet = (bullet: string, index: number): React.ReactNode => {
    if (index !== CV_BULLETS.length - 1) return <span>{bullet}</span>;

    if (effectivePhase === "rewriting") {
      return (
        <span className="relative">
          <span className="opacity-0">{rewrittenBullet.original}</span>
          <span className="absolute inset-0">
            <TypewriterText text={rewrittenBullet.optimized} />
          </span>
        </span>
      );
    }
    if (effectivePhase === "complete") {
      return (
        <span className="rounded px-0.5" style={{ backgroundColor: "rgba(40, 90, 200, 0.1)" }}>
          {rewrittenBullet.optimized}
        </span>
      );
    }
    return <span>{bullet}</span>;
  };

  return (
    <div
      className={cn(
        "relative w-full max-w-md rounded-lg bg-white p-6",
        "border border-white/20 cv-demo-shadow",
        className,
      )}
    >
      {/* Name */}
      <h3 className="text-lg font-bold" style={{ color: "#1A3A5C" }}>
        {CV_NAME}
      </h3>
      {/* Subtitle */}
      <p className="mt-0.5 text-sm font-medium" style={{ color: "#2E75B6" }}>
        {CV_SUBTITLE}
      </p>
      {/* Contact */}
      <p className="mt-1 text-xs" style={{ color: "#666666" }}>
        {CV_CONTACT}
      </p>

      {/* Accent divider */}
      <div
        className="my-3 h-0.5 w-full"
        style={{ backgroundColor: "#2E75B6" }}
      />

      {/* Professional Summary */}
      <p
        className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color: "#1A3A5C" }}
      >
        Professional Summary
      </p>
      <p className="mt-1 text-xs leading-relaxed" style={{ color: "#444444" }}>
        {CV_SUMMARY}
      </p>

      {/* Technical Skills */}
      <p
        className="mt-3 text-[10px] font-bold uppercase tracking-wider"
        style={{ color: "#1A3A5C" }}
      >
        Technical Skills
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {CV_SKILLS.map((skill) => (
          <span
            key={skill.text}
            data-keyword={skill.text}
            className={cn(
              "inline-block rounded px-1.5 py-0.5 text-xs transition-colors duration-300",
              isHighlighted(skill.text)
                ? "animate-keyword-pulse"
                : "",
            )}
            style={
              isHighlighted(skill.text)
                ? { color: "rgb(40, 90, 200)", backgroundColor: "rgba(40, 90, 200, 0.15)" }
                : { color: "#444444" }
            }
          >
            {skill.text}
          </span>
        ))}
      </div>

      {/* Experience bullets — hidden on mobile */}
      <div className="hidden sm:block">
        <p
          className="mt-3 text-[10px] font-bold uppercase tracking-wider"
          style={{ color: "#1A3A5C" }}
        >
          Experience
        </p>
        <ul className="mt-1.5 space-y-1.5">
          {CV_BULLETS.map((bullet, i) => (
            <li
              key={i}
              className="flex gap-1.5 text-xs"
              style={{ color: "#444444" }}
            >
              <span className="mt-1 shrink-0" style={{ color: "#2E75B6" }}>
                •
              </span>
              {renderBullet(bullet, i)}
            </li>
          ))}
        </ul>
      </div>

      {/* Scanline overlay */}
      {effectivePhase === "scanning" && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 animate-scanline"
          style={{
            background: `linear-gradient(90deg, transparent, var(--landing-gradient-mid), transparent)`,
            boxShadow: `0 0 12px 2px var(--landing-glow)`,
          }}
          aria-hidden
        />
      )}
    </div>
  );
}

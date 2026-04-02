"use client";

/** Full-page company research report with card-based intelligence sections. */
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Building2,
  Target,
  MessageSquare,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KeywordChips } from "@/components/ui/KeywordChips";
import { cn } from "@/lib/utils";
import type { CompanyReportProps } from "./CompanyReport.types";
import type { CompanyResearchResult } from "@/types/company";

const DESKTOP_BREAKPOINT = 768;
const STAGGER_DELAY = 0.15;

type SectionId = "culture" | "role" | "interview" | "risk" | "strategy";

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const handler = () => setIsDesktop(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

function ConfidenceBadge({
  quality,
  t,
}: {
  quality: CompanyResearchResult["research_quality"];
  t: (key: string) => string;
}) {
  const label =
    quality === "high"
      ? t("confidenceHigh")
      : quality === "medium"
        ? t("confidenceMedium")
        : quality === "low"
          ? t("confidenceLow")
          : t("confidenceUnknown");

  const variantClass =
    quality === "high"
      ? "bg-success/20 text-success border-success/30"
      : quality === "medium"
        ? "bg-warning/20 text-warning border-warning/30"
        : quality === "low"
          ? "bg-muted text-muted-foreground border-border"
          : "bg-muted text-muted-foreground";

  return (
    <Badge variant="outline" className={cn("border text-xs", variantClass)}>
      {label}
    </Badge>
  );
}

export function CompanyReport({
  research,
  className,
  headingLevel = "h1",
}: CompanyReportProps) {
  const t = useTranslations("report");
  const { profile, report, research_quality: quality, sources_used: sources } = research;
  const reducedMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const CompanyNameHeading = headingLevel;

  const [expandedSection, setExpandedSection] = useState<SectionId | null>("culture");

  const isExpanded = (id: SectionId) =>
    isDesktop ? true : expandedSection === id;

  const toggleSection = (id: SectionId) => {
    if (!isDesktop)
      setExpandedSection((prev) => (prev === id ? null : id));
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reducedMotion ? 0 : STAGGER_DELAY,
      },
    },
  };

  const cardVariants = {
    hidden: reducedMotion ? {} : { opacity: 0, y: 12 },
    visible: reducedMotion ? {} : { opacity: 1, y: 0 },
  };

  const sections: Array<{
    id: SectionId;
    titleKey: string;
    icon: React.ElementType;
    iconClass: string;
    content: React.ReactNode;
    hasSources: boolean;
  }> = [
    {
      id: "culture",
      titleKey: "cultureReality",
      icon: Building2,
      iconClass: "text-sky-400",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{report.culture_and_values}</p>
          <div className="flex flex-wrap gap-2">
            {profile.core_values.map((value) => (
              <span
                key={value}
                className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      ),
      hasSources: false,
    },
    {
      id: "role",
      titleKey: "roleExpectations",
      icon: Target,
      iconClass: "text-emerald-400",
      content: (
        <p className="text-sm text-muted-foreground">{report.what_they_look_for}</p>
      ),
      hasSources: false,
    },
    {
      id: "interview",
      titleKey: "interviewSignals",
      icon: MessageSquare,
      iconClass: "text-amber-400",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{report.interview_preparation}</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {profile.interview_insights.map((insight) => (
              <li key={`${insight.source}-${insight.tip}`}>
                {insight.tip} ({insight.source})
              </li>
            ))}
          </ul>
        </div>
      ),
      hasSources: false,
    },
    {
      id: "risk",
      titleKey: "riskFlags",
      icon: AlertTriangle,
      iconClass: "text-rose-400",
      content: (
        <ul className="list-disc space-y-1 pl-5 text-sm text-destructive">
          {report.red_flags.map((redFlag) => (
            <li key={redFlag}>{redFlag}</li>
          ))}
        </ul>
      ),
      hasSources: false,
    },
    {
      id: "strategy",
      titleKey: "candidateStrategy",
      icon: Lightbulb,
      iconClass: "text-violet-400",
      content: (
        <div className="space-y-4">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            {report.talking_points.map((talkingPoint) => (
              <li key={talkingPoint}>{talkingPoint}</li>
            ))}
          </ol>
          <KeywordChips keywords={report.keywords_to_mirror} />
        </div>
      ),
      hasSources: sources.length > 0,
    },
  ];

  return (
    <article className={cn("space-y-6", className)}>
      <header className="space-y-2">
        <CompanyNameHeading className="text-3xl font-semibold text-foreground">
          {profile.name}
        </CompanyNameHeading>
        <p className="text-sm text-muted-foreground">
          {profile.industry} • {profile.size_estimate}
        </p>
        <p className="text-sm text-muted-foreground">{report.executive_summary}</p>
      </header>

      <motion.div
        className="flex flex-col gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {sections.map((section) => {
          const Icon = section.icon;
          const expanded = isExpanded(section.id);

          return (
            <motion.div key={section.id} variants={cardVariants}>
              <Card
                className={cn(
                  "overflow-hidden border-l-2 border-l-primary transition-colors",
                  !isDesktop && "cursor-pointer hover:bg-muted/30",
                )}
              >
                <CardHeader
                  className="flex flex-row items-center justify-between gap-2 py-4"
                  onClick={() => !isDesktop && toggleSection(section.id)}
                  role={!isDesktop ? "button" : undefined}
                  aria-expanded={expanded}
                  tabIndex={!isDesktop ? 0 : undefined}
                  onKeyDown={
                    !isDesktop
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleSection(section.id);
                          }
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn("size-5 shrink-0", section.iconClass)} aria-hidden />
                    <CardTitle className="text-base font-semibold">
                      {t(section.titleKey)}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <ConfidenceBadge quality={quality} t={t} />
                    {!isDesktop &&
                      (expanded ? (
                        <ChevronUp className="size-4 text-muted-foreground" aria-hidden />
                      ) : (
                        <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
                      ))}
                  </div>
                </CardHeader>

                <AnimatePresence initial={false}>
                  {expanded ? (
                    <motion.div
                      initial={
                        reducedMotion ? false : { height: 0, opacity: 0 }
                      }
                      animate={
                        reducedMotion ? {} : { height: "auto", opacity: 1 }
                      }
                      exit={reducedMotion ? {} : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <CardContent className="pt-0 pb-4">{section.content}</CardContent>
                      {section.hasSources ? (
                        <CardFooter className="flex flex-col items-start gap-2 border-t border-border py-3">
                          <span className="text-xs font-medium text-muted-foreground">
                            {t("sources")}
                          </span>
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            {sources.map((source) => (
                              <li key={source}>
                                <a
                                  className="underline hover:text-foreground"
                                  href={source}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                >
                                  {source}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </CardFooter>
                      ) : null}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </article>
  );
}

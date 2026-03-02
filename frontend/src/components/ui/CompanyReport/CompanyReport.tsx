"use client";

/** Full-page company research report presentation component. */
import { KeywordChips } from "@/components/ui/KeywordChips";
import { cn } from "@/lib/utils";
import type { CompanyReportProps } from "./CompanyReport.types";

export function CompanyReport({ research, className }: CompanyReportProps) {
  const { profile, report, research_quality: quality, sources_used: sources } = research;

  return (
    <article className={cn("space-y-8", className)}>
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">{profile.name}</h1>
        <p className="text-sm text-slate-300">
          {profile.industry} • {profile.size_estimate}
        </p>
        <span className="inline-flex rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
          Research quality: {quality}
        </span>
      </header>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-100">Executive Summary</h2>
        <p className="text-slate-300">{report.executive_summary}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-100">Culture & Values</h2>
        <p className="text-slate-300">{report.culture_and_values}</p>
        <div className="flex flex-wrap gap-2">
          {profile.core_values.map((value) => (
            <span
              key={value}
              className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-200"
            >
              {value}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-100">What They Look For</h2>
        <p className="text-slate-300">{report.what_they_look_for}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-100">Interview Preparation</h2>
        <p className="text-slate-300">{report.interview_preparation}</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
          {profile.interview_insights.map((insight) => (
            <li key={`${insight.source}-${insight.tip}`}>
              {insight.tip} ({insight.source})
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-100">Recent News</h2>
        <ul className="space-y-2 text-sm text-slate-300">
          {profile.recent_news.map((item) => (
            <li key={`${item.source}-${item.headline}`} className="rounded border border-slate-800 p-3">
              <p className="font-medium text-slate-100">{item.headline}</p>
              <p>
                {item.source}
                {item.date ? ` • ${item.date}` : ""}
              </p>
              <p>{item.relevance}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-100">Talking Points</h2>
        <ol className="list-decimal space-y-1 pl-5 text-slate-300">
          {report.talking_points.map((talkingPoint) => (
            <li key={talkingPoint}>{talkingPoint}</li>
          ))}
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-100">Red Flags</h2>
        <ul className="list-disc space-y-1 pl-5 text-amber-300">
          {report.red_flags.map((redFlag) => (
            <li key={redFlag}>{redFlag}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-100">Employee Sentiment</h2>
        <p className="text-slate-300">{profile.employee_sentiment.summary}</p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded border border-emerald-900/60 bg-emerald-950/20 p-3">
            <h3 className="mb-1 text-sm font-semibold text-emerald-300">Pros</h3>
            <ul className="list-disc space-y-1 pl-4 text-sm text-slate-300">
              {profile.employee_sentiment.pros.map((pro) => (
                <li key={pro}>{pro}</li>
              ))}
            </ul>
          </div>
          <div className="rounded border border-rose-900/60 bg-rose-950/20 p-3">
            <h3 className="mb-1 text-sm font-semibold text-rose-300">Cons</h3>
            <ul className="list-disc space-y-1 pl-4 text-sm text-slate-300">
              {profile.employee_sentiment.cons.map((con) => (
                <li key={con}>{con}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <KeywordChips keywords={report.keywords_to_mirror} />

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-100">Sources</h2>
        <ul className="space-y-1 text-sm text-sky-300">
          {sources.map((source) => (
            <li key={source}>
              <a className="underline hover:text-sky-200" href={source} rel="noreferrer" target="_blank">
                {source}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

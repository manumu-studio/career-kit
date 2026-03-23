/** Skeleton layout matching results page sections (ScoreCard, CvComparison, GapAnalysis, KeywordMatch). */
import { LoadingSkeleton } from "./LoadingSkeleton";

export function ResultsSectionSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="space-y-8">
        <article className="rounded-2xl border border-border bg-muted/60 p-6">
          <LoadingSkeleton variant="text" className="mb-4 w-24" />
          <div className="flex flex-col items-center gap-3">
            <LoadingSkeleton variant="circle" className="h-32 w-32" />
            <LoadingSkeleton variant="text" className="w-20" />
          </div>
        </article>

        <section className="space-y-4">
          <LoadingSkeleton variant="text" className="w-40" />
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-success/30 bg-success/10 p-4">
              <LoadingSkeleton variant="text" className="mb-3 w-36" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <LoadingSkeleton key={i} variant="block" className="h-7 w-16" />
                ))}
              </div>
            </article>
            <article className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
              <LoadingSkeleton variant="text" className="mb-3 w-36" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <LoadingSkeleton key={i} variant="block" className="h-7 w-20" />
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="space-y-4">
          <LoadingSkeleton variant="text" className="w-32" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <article
                key={i}
                className="rounded-xl border border-border bg-muted/60 p-4"
              >
                <div className="flex gap-2">
                  <LoadingSkeleton variant="text" className="h-5 w-24" />
                  <LoadingSkeleton variant="block" className="h-5 w-16 rounded-full" />
                </div>
                <LoadingSkeleton variant="text" className="mt-3 h-4 w-full" />
                <LoadingSkeleton variant="text" className="mt-2 h-4 w-3/4" />
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-4">
        <LoadingSkeleton variant="text" className="w-36" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <article
              key={i}
              className="rounded-2xl border border-border bg-muted/60 p-5"
            >
              <LoadingSkeleton variant="text" className="mb-4 h-6 w-32" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 rounded-lg border border-border bg-background/60 p-4">
                  <LoadingSkeleton variant="text" className="h-3 w-20" />
                  <LoadingSkeleton variant="text" className="h-4 w-full" />
                  <LoadingSkeleton variant="text" className="h-4 w-5/6" />
                </div>
                <div className="space-y-2 rounded-lg border border-border bg-background/60 p-4">
                  <LoadingSkeleton variant="text" className="h-3 w-20" />
                  <LoadingSkeleton variant="text" className="h-4 w-full" />
                  <LoadingSkeleton variant="text" className="h-4 w-5/6" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <LoadingSkeleton variant="text" className="h-3 w-24" />
                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    <LoadingSkeleton variant="text" className="h-4 w-48" />
                  </li>
                  <li>
                    <LoadingSkeleton variant="text" className="h-4 w-40" />
                  </li>
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

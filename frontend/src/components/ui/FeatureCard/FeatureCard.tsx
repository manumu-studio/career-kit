/** Feature card with icon, title, description, and decorative visual. */
"use client";

import { cn } from "@/lib/utils";
import type { FeatureCardProps } from "./FeatureCard.types";

export function FeatureCard({
  icon: Icon,
  title,
  description,
  visual,
  reverse = false,
  variant = "default",
}: FeatureCardProps) {
  return (
    <article
      className={cn(
        "grid gap-8 md:grid-cols-2 md:items-center md:gap-12",
        reverse && "md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1"
      )}
    >
      <div className="flex flex-col gap-4">
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-lg",
            variant === "glass"
              ? "bg-white/10 text-[var(--landing-text)]"
              : "bg-primary/10 text-primary",
          )}
          aria-hidden
        >
          <Icon className="size-6" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div
        className={cn(
          "min-h-[200px] rounded-xl p-6 transition-colors duration-300",
          variant === "glass"
            ? "border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10"
            : "border border-border bg-muted/30",
        )}
      >
        {visual}
      </div>
    </article>
  );
}

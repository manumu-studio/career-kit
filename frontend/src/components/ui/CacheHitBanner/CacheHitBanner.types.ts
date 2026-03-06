/** Props for cache hit banner component. */
import type { CachedMatchInfo } from "@/types/history";

export type CacheHitBannerVariant = "research" | "optimization";

export interface CacheHitBannerProps {
  variant: CacheHitBannerVariant;
  match: CachedMatchInfo;
  onUseCached: () => void;
  onRunAgain: () => void;
  className?: string;
}

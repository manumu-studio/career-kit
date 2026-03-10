/** Provides helper labels for CV comparison rendering. */
type TranslationFn = (key: string) => string;

export function useCvComparison(t: TranslationFn) {
  return {
    originalLabel: t("original"),
    optimizedLabel: t("optimized"),
    changesLabel: t("changesMade"),
  };
}

/** Props for the multi-provider comparison controls on the home upload flow. */

export interface CompareProvidersPanelProps {
  availableProviders: string[];
  selectedProviders: ReadonlySet<string>;
  onToggle: (providerName: string) => void;
  onCompare: () => void | Promise<void>;
  isComparing: boolean;
  isReadyToSubmit: boolean;
  /** Primary selected model (reserved for future UX; optional). */
  selectedProvider?: string | null;
}

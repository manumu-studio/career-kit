/** Props and types for history list component. */
import type { HistoryListItem } from "@/types/history";

export type HistoryTypeFilter = "all" | "research" | "optimize";

export interface HistoryListProps {
  items: HistoryListItem[];
  total: number;
  page: number;
  limit: number;
  companySearch: string;
  typeFilter: HistoryTypeFilter;
  onCompanySearchChange: (value: string) => void;
  onTypeFilterChange: (value: HistoryTypeFilter) => void;
  onPageChange: (page: number) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
  isLoading: boolean;
  error: string | null;
}

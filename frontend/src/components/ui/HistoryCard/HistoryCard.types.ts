/** Props for compact history analysis card. */
import type { HistoryListItem } from "@/types/history";

export interface HistoryCardProps {
  item: HistoryListItem;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

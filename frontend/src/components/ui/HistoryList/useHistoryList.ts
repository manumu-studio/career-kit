"use client";

/** Hook for fetching and managing history list with filters and pagination. */
import { useCallback, useEffect, useState } from "react";
import {
  deleteHistoryEntry,
  fetchHistoryList,
  handleApiError,
} from "@/lib/api";
import type { HistoryListItem } from "@/types/history";
import type { HistoryListParams } from "@/types/history";
import type { HistoryTypeFilter } from "./HistoryList.types";

export interface UseHistoryListOptions {
  userId?: string;
  initialTypeFilter?: HistoryTypeFilter;
}

export interface UseHistoryListResult {
  items: HistoryListItem[];
  total: number;
  page: number;
  limit: number;
  companySearch: string;
  typeFilter: HistoryTypeFilter;
  setCompanySearch: (value: string) => void;
  setTypeFilter: (value: HistoryTypeFilter) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  deletingId: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useHistoryList(
  options: UseHistoryListOptions = {},
): UseHistoryListResult {
  const { userId, initialTypeFilter = "all" } = options;
  const [items, setItems] = useState<HistoryListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPageState] = useState(1);
  const [limit] = useState(20);
  const [companySearch, setCompanySearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<HistoryTypeFilter>(initialTypeFilter);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: HistoryListParams = { page, limit };
      const company = companySearch.trim();
      if (company) {
        params.company = company;
      }
      if (typeFilter !== "all") {
        params.type = typeFilter;
      }
      const data = await fetchHistoryList(params, userId);
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(handleApiError(err));
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [userId, page, limit, companySearch, typeFilter]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const setPage = useCallback((p: number) => {
    setPageState(Math.max(1, p));
  }, []);

  const setCompanySearchWithReset = useCallback((value: string) => {
    setCompanySearch(value);
    setPageState(1);
  }, []);

  const setTypeFilterWithReset = useCallback((value: HistoryTypeFilter) => {
    setTypeFilter(value);
    setPageState(1);
  }, []);

  const refresh = useCallback(async () => {
    await fetchList();
  }, [fetchList]);

  const deleteItem = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        await deleteHistoryEntry(id, userId);
        await fetchList();
      } catch {
        setError("Failed to delete analysis");
      } finally {
        setDeletingId(null);
      }
    },
    [userId, fetchList],
  );

  return {
    items,
    total,
    page,
    limit,
    companySearch,
    typeFilter,
    setCompanySearch: setCompanySearchWithReset,
    setTypeFilter: setTypeFilterWithReset,
    setPage,
    refresh,
    deleteItem,
    deletingId,
    isLoading,
    error,
  };
}

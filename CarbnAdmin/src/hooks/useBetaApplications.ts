import { useCallback, useEffect, useState } from "react";
import { getBetaApplications } from "../api/betaApplicationsApi";
import { getApiErrorMessage } from "../utils/apiError";
import type { ApplicationFilters, BetaApplication } from "../types/application";

export const useBetaApplications = (filters: ApplicationFilters) => {
  const [applications, setApplications] = useState<BetaApplication[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getBetaApplications({
        ...filters,
        page,
        limit,
      });

      setApplications(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.total_pages);
    } catch (error) {
      setError(getApiErrorMessage(error, "Could not load applications."));
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    page,
    limit,
    total,
    totalPages,
    isLoading,
    error,
    setPage,
    setLimit,
    refetch: fetchApplications,
  };
};

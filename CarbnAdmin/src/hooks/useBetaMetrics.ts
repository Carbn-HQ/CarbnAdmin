import { useCallback, useEffect, useState } from "react";
import { getBetaDashboardMetrics } from "../api/betaApplicationsApi";
import { getApiErrorMessage } from "../utils/apiError";
import type { BetaMetrics } from "../types/application";

export const useBetaMetrics = () => {
  const [metrics, setMetrics] = useState<BetaMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getBetaDashboardMetrics();
      setMetrics(response.data ?? null);
    } catch (error) {
      setError(getApiErrorMessage(error, "Could not load dashboard metrics."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refetch: fetchMetrics,
  };
};

import { useCallback, useEffect, useState } from "react";
import { getBetaApplicationById } from "../api/betaApplicationsApi";
import { getApiErrorMessage } from "../utils/apiError";
import type { BetaApplication } from "../types/application";

export const useBetaApplication = (applicationId?: string) => {
  const [application, setApplication] = useState<BetaApplication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = useCallback(async () => {
    if (!applicationId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getBetaApplicationById(applicationId);
      setApplication(response.data ?? null);
    } catch (error) {
      setError(getApiErrorMessage(error, "Could not load the application."));
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void fetchApplication();
  }, [fetchApplication]);

  return {
    application,
    isLoading,
    error,
    refetch: fetchApplication,
  };
};

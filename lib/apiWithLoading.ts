import { useLoading } from "../contexts/loadingContext";

// Hook to get loading utilities
export const useApiWithLoading = () => {
  const { withLoading, startLoading, stopLoading } = useLoading();

  // Wrapper for API calls that automatically manages loading state
  const apiCall = async <T>(
    apiPromise: Promise<T>,
    options?: {
      showLoading?: boolean;
      loadingText?: string;
    }
  ): Promise<T> => {
    const { showLoading = true, loadingText } = options || {};

    if (showLoading) {
      return withLoading(apiPromise);
    }

    return apiPromise;
  };

  // Manual loading control
  const withManualLoading = async <T>(
    promise: Promise<T>,
    onStart?: () => void,
    onComplete?: () => void
  ): Promise<T> => {
    startLoading();
    onStart?.();

    try {
      const result = await promise;
      return result;
    } finally {
      stopLoading();
      onComplete?.();
    }
  };

  return {
    apiCall,
    withManualLoading,
    startLoading,
    stopLoading,
  };
};

// Utility function for components that don't use hooks
export const createApiWithLoading = (
  loadingContext: ReturnType<typeof useLoading>
) => {
  return {
    apiCall: async <T>(
      apiPromise: Promise<T>,
      options?: {
        showLoading?: boolean;
        loadingText?: string;
      }
    ): Promise<T> => {
      const { showLoading = true } = options || {};

      if (showLoading) {
        return loadingContext.withLoading(apiPromise);
      }

      return apiPromise;
    },
  };
};

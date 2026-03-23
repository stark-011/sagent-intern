const RETRYABLE_STATUS_CODES = new Set([400, 404, 405, 415, 422]);

const isRetriableError = (error) => {
  const statusCode = error?.response?.status;
  return RETRYABLE_STATUS_CODES.has(statusCode);
};

export const requestWithPayloadFallback = async (requestExecutor, payloads) => {
  let lastError;

  for (const payload of payloads) {
    try {
      return await requestExecutor(payload);
    } catch (error) {
      lastError = error;

      if (!isRetriableError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
};

export const requestWithEndpointFallback = async (requestExecutors) => {
  let lastError;

  for (const executeRequest of requestExecutors) {
    try {
      return await executeRequest();
    } catch (error) {
      lastError = error;

      if (!isRetriableError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
};

export const isAuthEndpointUnavailable = (error) => {
  const statusCode = error?.response?.status;
  const isNetworkLikeError =
    !error?.response &&
    (error?.code === "ERR_NETWORK" || /network error/i.test(error?.message || ""));

  return statusCode === 404 || statusCode === 405 || isNetworkLikeError;
};

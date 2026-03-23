export const getErrorMessage = (error, fallback = "Something went wrong.") => {
  if (!error) {
    return fallback;
  }

  const requestUrl = error?.config?.url || "";
  const responseUrl = error?.request?.responseURL || "";
  const combinedUrl = `${responseUrl || ""} ${requestUrl || ""}`;
  const statusCode = error?.response?.status;
  const isDevProxyLikePath =
    statusCode === 404 &&
    /localhost:3000/.test(combinedUrl) &&
    /\/api\//.test(combinedUrl);

  if (isDevProxyLikePath) {
    return "API path returned 404 from localhost:3000. React dev proxy is likely not active. Restart `npm start` after stopping the old process on port 3000.";
  }

  if (typeof error === "string") {
    return error;
  }

  const responseData = error.response?.data;

  if (typeof responseData === "string" && responseData.trim().length > 0) {
    return responseData;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.error) {
    return responseData.error;
  }

  if (error.message) {
    return error.message;
  }

  return fallback;
};

import { Alert } from "@mui/material";

const ErrorBanner = ({ message, sx }) => {
  if (!message) {
    return null;
  }

  return (
    <Alert severity="error" sx={sx}>
      {message}
    </Alert>
  );
};

export default ErrorBanner;

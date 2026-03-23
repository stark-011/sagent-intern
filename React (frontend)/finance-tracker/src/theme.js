import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0f766e",
      light: "#14b8a6",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#f97316",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f3f8f8",
      paper: "#ffffff",
    },
    error: {
      main: "#dc2626",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", "Tahoma", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: -0.5,
    },
    h5: {
      fontWeight: 700,
      letterSpacing: -0.4,
    },
    h6: {
      fontWeight: 700,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 10,
        },
      },
    },
  },
});

export default theme;

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./styles/global.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0f766e",
      light: "#2dd4bf",
      dark: "#115e59",
      contrastText: "#ffffff"
    },
    secondary: {
      main: "#0284c7",
      light: "#38bdf8",
      dark: "#0369a1",
      contrastText: "#ffffff"
    },
    background: {
      default: "#f4f7fb",
      paper: "#ffffff"
    }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: "'Manrope', 'Nunito Sans', 'Segoe UI', sans-serif",
    h4: {
      fontWeight: 800,
      letterSpacing: -0.4
    },
    h5: {
      fontWeight: 800
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(15, 23, 42, 0.06)",
          boxShadow: "0 12px 24px rgba(15, 23, 42, 0.06)"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700,
          borderRadius: 10
        }
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);

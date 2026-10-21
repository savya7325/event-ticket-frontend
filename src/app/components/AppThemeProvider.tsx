"use client";

import { ReactNode } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Makes every MUI component use the app font (MUI defaults to Roboto, which isn't loaded).
const theme = createTheme({
  typography: {
    fontFamily: "var(--font-sans), system-ui, -apple-system, 'Segoe UI', sans-serif",
    button: { fontWeight: 600 },
  },
  // Keep MUI's default 4px radius unit: every `borderRadius: n` in sx is n × 4px.
});

export default function AppThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

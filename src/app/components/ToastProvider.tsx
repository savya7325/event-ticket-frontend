"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { Box, IconButton, Slide, Snackbar, Typography } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

type Severity = "success" | "error" | "info";
interface ToastItem {
  id: number;
  severity: Severity;
  title: string;
  message?: string;
}

interface ToastApi {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const STYLES: Record<Severity, { color: string; glow: string; Icon: typeof InfoRoundedIcon }> = {
  success: { color: "#34d399", glow: "rgba(52,211,153,0.18)", Icon: CheckCircleRoundedIcon },
  error: { color: "#f87171", glow: "rgba(248,113,113,0.18)", Icon: ErrorRoundedIcon },
  info: { color: "#a78bfa", glow: "rgba(167,139,250,0.18)", Icon: InfoRoundedIcon },
};

// App-wide toasts: const toast = useToast(); toast.success("Event added", "It's now live.")
export function ToastProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<ToastItem[]>([]);
  const [open, setOpen] = useState(true);
  const current = queue[0];

  const push = useCallback((severity: Severity, title: string, message?: string) => {
    setQueue(q => [...q, { id: Date.now() + Math.random(), severity, title, message }]);
    setOpen(true);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (t, m) => push("success", t, m),
      error: (t, m) => push("error", t, m),
      info: (t, m) => push("info", t, m),
    }),
    [push]
  );

  const close = (_?: unknown, reason?: string) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const style = current ? STYLES[current.severity] : STYLES.info;

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Snackbar
        key={current?.id}
        open={!!current && open}
        autoHideDuration={current?.severity === "error" ? 6000 : 3500}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        slots={{ transition: Slide }}
        slotProps={{
          transition: {
            direction: "left",
            onExited: () => {
              setQueue(q => q.slice(1));
              setOpen(true);
            },
          },
        }}
      >
        {current ? (
          <Box
            role={current.severity === "error" ? "alert" : "status"}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1.5,
              minWidth: { xs: "calc(100vw - 32px)", sm: 340 },
              maxWidth: 420,
              p: 1.75,
              pl: 2,
              borderRadius: 3,
              color: "#f5f3ff",
              bgcolor: "#17121f",
              border: "1px solid rgba(255,255,255,0.08)",
              borderLeft: `3px solid ${style.color}`,
              boxShadow: `0 18px 50px rgba(0,0,0,0.5), 0 0 0 1px ${style.glow}`,
            }}
          >
            <style.Icon sx={{ color: style.color, fontSize: 22, mt: 0.15 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.92rem" }}>{current.title}</Typography>
              {current.message && (
                <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.62)", mt: 0.25 }}>
                  {current.message}
                </Typography>
              )}
            </Box>
            <IconButton aria-label="Dismiss" size="small" onClick={() => close()} sx={{ color: "rgba(255,255,255,0.45)", mt: -0.5, mr: -0.5 }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : undefined}
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

"use client";

import { ReactNode } from "react";
import { Box, Button, Skeleton, Typography } from "@mui/material";
import { cardSx, eyebrowSx, ghostButtonSx, ui } from "./theme";

export function PageHeader({ eyebrow, title, subtitle, action }: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 2, mb: 4 }}>
      <Box>
        {eyebrow && <Typography sx={eyebrowSx}>{eyebrow}</Typography>}
        <Typography component="h1" sx={{ fontSize: { xs: "1.75rem", md: "2.25rem" }, fontWeight: 800, mt: 0.5, lineHeight: 1.15 }}>
          {title}
        </Typography>
        {subtitle && <Typography sx={{ color: ui.muted, mt: 1 }}>{subtitle}</Typography>}
      </Box>
      {action}
    </Box>
  );
}

export function StatCard({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: string; icon: ReactNode }) {
  return (
    <Box sx={{ ...cardSx, p: 2.5, display: "flex", gap: 2, alignItems: "center" }}>
      <Box
        sx={{
          width: 46,
          height: 46,
          flexShrink: 0,
          borderRadius: 3,
          display: "grid",
          placeItems: "center",
          color: ui.accentSoft,
          bgcolor: "rgba(139,92,246,0.14)",
          border: "1px solid rgba(139,92,246,0.25)",
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.78rem", color: ui.faint, fontWeight: 500 }}>{label}</Typography>
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, lineHeight: 1.2 }}>{value}</Typography>
        {hint && <Typography sx={{ fontSize: "0.72rem", color: ui.faint }}>{hint}</Typography>}
      </Box>
    </Box>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <Box sx={{ ...cardSx, py: 7, px: 3, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          mb: 2,
          color: ui.accentSoft,
          bgcolor: "rgba(139,92,246,0.12)",
          "& svg": { fontSize: 30 },
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>{title}</Typography>
      <Typography sx={{ color: ui.muted, mt: 0.75, maxWidth: 380, fontSize: "0.9rem" }}>{text}</Typography>
      {action && <Box sx={{ mt: 3 }}>{action}</Box>}
    </Box>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Box sx={{ ...cardSx, p: 3, borderColor: "rgba(248,113,113,0.3)", display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", justifyContent: "space-between" }}>
      <Typography sx={{ color: ui.danger, fontSize: "0.9rem" }}>{message}</Typography>
      <Button onClick={onRetry} sx={ghostButtonSx}>
        Try again
      </Button>
    </Box>
  );
}

export function CardSkeleton({ height = 120 }: { height?: number }) {
  return <Skeleton variant="rounded" height={height} sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: 4 }} />;
}

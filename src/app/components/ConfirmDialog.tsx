"use client";

import { ReactNode, useState } from "react";
import { Box, Button, CircularProgress, Dialog, Typography } from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { ghostButtonSx, ui } from "./theme";

interface Props {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "neutral";
  icon?: "warning" | "logout";
  details?: [string, ReactNode][]; // optional summary rows (e.g. what's being deleted)
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

// "Are you sure?" dialog. If onConfirm returns a promise, the button spins until it settles.
export default function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel = "Cancel", tone = "danger", icon = "warning", details, onConfirm, onClose }: Props) {
  const [busy, setBusy] = useState(false);
  const color = tone === "danger" ? ui.danger : ui.accentSoft;

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !busy && onClose()}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: { bgcolor: "#17121f", color: ui.text, borderRadius: 4, border: `1px solid ${ui.border}`, backgroundImage: "none", boxShadow: "0 30px 80px rgba(0,0,0,0.6)", m: 2 },
        },
        backdrop: { sx: { bgcolor: "rgba(5,3,10,0.6)", backdropFilter: "blur(4px)" } },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: "50%", display: "grid", placeItems: "center", mb: 2, color, bgcolor: tone === "danger" ? "rgba(248,113,113,0.12)" : "rgba(139,92,246,0.14)" }}>
          {icon === "logout" ? <LogoutRoundedIcon /> : <WarningAmberRoundedIcon />}
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: "1.2rem" }}>{title}</Typography>
        <Typography component="div" sx={{ color: ui.muted, fontSize: "0.9rem", mt: 0.75 }}>
          {message}
        </Typography>

        {details && details.length > 0 && (
          <Box sx={{ mt: 2.5, p: 2, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: `1px dashed ${ui.border}`, display: "grid", gap: 1, fontSize: "0.85rem" }}>
            {details.map(([k, v]) => (
              <Box key={k} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Box component="span" sx={{ color: ui.faint }}>{k}</Box>
                <Box component="span" sx={{ fontWeight: 600, textAlign: "right", minWidth: 0, overflowWrap: "anywhere" }}>{v}</Box>
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 1.25, justifyContent: "flex-end", flexWrap: "wrap", mt: 3 }}>
          <Button onClick={onClose} disabled={busy} sx={ghostButtonSx}>
            {cancelLabel}
          </Button>
          <Button
            onClick={confirm}
            disabled={busy}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2.5,
              px: 2.5,
              minWidth: 130,
              color: "#fff",
              ...(tone === "danger"
                ? { bgcolor: "#dc2626", "&:hover": { bgcolor: "#b91c1c" } }
                : { background: ui.gradient, "&:hover": { background: "linear-gradient(135deg, #a78bfa, #7c3aed)" } }),
              "&.Mui-disabled": { color: "rgba(255,255,255,0.7)", opacity: 0.7 },
            }}
          >
            {busy ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : confirmLabel}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

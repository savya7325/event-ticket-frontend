import Link from "next/link";
import { Box, Typography } from "@mui/material";
import { ui } from "./theme";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/", label: "Log in" },
];

// Full-width footer for public pages (login, About, Contact).
export default function SiteFooter() {
  return (
    <Box component="footer" sx={{ borderTop: `1px solid ${ui.border}`, bgcolor: "rgba(8,6,13,0.85)" }}>
      <Box
        sx={{
          maxWidth: 1180,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 4, md: 5 },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "center", md: "flex-start" },
          justifyContent: "space-between",
          textAlign: { xs: "center", md: "left" },
          gap: 3,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: "1.3rem", letterSpacing: 2 }}>EVENZA</Typography>
          <Typography sx={{ color: ui.faint, fontSize: "0.85rem", mt: 0.5, maxWidth: 300 }}>
            Discover events, pick your seats and book in seconds.
          </Typography>
        </Box>
        <Box component="nav" aria-label="Footer" sx={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
          {LINKS.map(l => (
            <Box key={l.label} component={Link} href={l.href} sx={{ color: ui.muted, fontSize: "0.9rem", fontWeight: 600, "&:hover": { color: "#fff" } }}>
              {l.label}
            </Box>
          ))}
        </Box>
      </Box>
      <Box sx={{ borderTop: `1px solid ${ui.border}`, py: 2, textAlign: "center", color: ui.faint, fontSize: "0.8rem" }}>
        © {new Date().getFullYear()} EVENZA. All rights reserved.
      </Box>
    </Box>
  );
}

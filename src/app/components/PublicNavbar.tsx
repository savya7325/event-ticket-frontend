"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { homePathFor } from "../auth/roles";
import { ui } from "./theme";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// Glass navbar for public pages (About, Contact). Signed-in visitors get a link back to their home.
export default function PublicNavbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const linkSx = (active: boolean) => ({
    color: active ? "#fff" : "#e9d5ff",
    borderBottom: `2px solid ${active ? ui.accent : "transparent"}`,
    pb: 0.25,
    transition: "color .15s ease",
    "&:hover": { color: "#fff" },
  });

  return (
    <Box
      component="nav"
      sx={{
        position: "sticky",
        top: { xs: 10, md: 16 },
        zIndex: 10,
        mx: "clamp(12px, 3vw, 20px)",
        mt: "clamp(12px, 3vw, 20px)",
        px: "clamp(16px, 4vw, 36px)",
        py: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        borderRadius: 4,
        bgcolor: "rgba(20,12,34,0.6)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${ui.border}`,
      }}
    >
      <Link href={user ? homePathFor(user) : "/"} style={{ fontSize: "clamp(1.25rem, 4.5vw, 1.75rem)", fontWeight: 800, letterSpacing: 2, whiteSpace: "nowrap" }}>
        EVENZA
      </Link>
      <Box sx={{ display: "flex", alignItems: "center", gap: "clamp(14px, 3vw, 28px)", fontSize: "clamp(0.85rem, 2.6vw, 1rem)", fontWeight: 600, whiteSpace: "nowrap" }}>
        {LINKS.map(l => (
          <Box key={l.href} component={Link} href={l.href} aria-current={pathname === l.href ? "page" : undefined} sx={linkSx(pathname === l.href)}>
            {l.label}
          </Box>
        ))}
        {/* No "Log in" link on the login page itself */}
        {(user || pathname !== "/") && (
          <Box component={Link} href={user ? homePathFor(user) : "/"} sx={linkSx(false)}>
            {user ? "My home" : "Log in"}
          </Box>
        )}
      </Box>
    </Box>
  );
}

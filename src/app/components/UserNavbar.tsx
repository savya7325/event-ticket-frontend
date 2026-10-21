"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, Box, ButtonBase, Divider, ListItemIcon, Menu, MenuItem, Typography } from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useAuth } from "../context/AuthContext";
import { ui } from "./theme";
import ConfirmDialog from "./ConfirmDialog";

const USER_LINKS = [
  { href: "/home", label: "Home", icon: HomeRoundedIcon },
  { href: "/events", label: "Events", icon: EventRoundedIcon },
  { href: "/mybookings", label: "My Bookings", icon: ConfirmationNumberRoundedIcon },
];

const ADMIN_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: DashboardRoundedIcon },
  { href: "/events", label: "Events", icon: EventRoundedIcon },
  { href: "/admin/bookings", label: "Bookings", icon: ConfirmationNumberRoundedIcon },
];

export const initialsOf = (name = "") =>
  name
    .split(/[\s_]+/)
    .filter(Boolean)
    .map(p => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

export default function UserNavbar() {
  const { user, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const links = isAdmin ? ADMIN_LINKS : USER_LINKS;

  const handleLogout = () => {
    setConfirmLogout(false);
    logout();
    router.replace("/");
  };

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        backdropFilter: "blur(14px)",
        bgcolor: "rgba(13,10,20,0.72)",
        borderBottom: `1px solid ${ui.border}`,
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          height: 68,
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, md: 4 },
        }}
      >
        <Link href={isAdmin ? "/admin/dashboard" : "/home"} style={{ textDecoration: "none" }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "1.35rem",
              letterSpacing: 0.5,
              background: "linear-gradient(90deg, #fff, #c4b5fd)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Evenza
          </Typography>
        </Link>

        <Box component="nav" sx={{ display: "flex", gap: 0.5, flex: 1, justifyContent: { xs: "flex-end", md: "flex-start" } }}>
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <ButtonBase
                key={href}
                component={Link}
                href={href}
                aria-label={label}
                sx={{
                  gap: 1,
                  px: { xs: 1.25, sm: 1.75 },
                  py: 1,
                  borderRadius: 2.5,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: active ? "#fff" : ui.muted,
                  bgcolor: active ? "rgba(139,92,246,0.18)" : "transparent",
                  transition: "all .15s ease",
                  "&:hover": { color: "#fff", bgcolor: ui.surfaceHover },
                }}
              >
                <Icon sx={{ fontSize: 19, color: active ? ui.accentSoft : "inherit" }} />
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  {label}
                </Box>
              </ButtonBase>
            );
          })}
        </Box>

        <ButtonBase
          onClick={e => setMenuAnchor(e.currentTarget)}
          aria-label="Account menu"
          sx={{
            gap: 1.25,
            pl: 0.5,
            pr: { xs: 0.5, md: 1.5 },
            py: 0.5,
            borderRadius: 99,
            border: `1px solid ${ui.border}`,
            "&:hover": { bgcolor: ui.surfaceHover },
          }}
        >
          <Avatar sx={{ width: 34, height: 34, fontSize: "0.85rem", fontWeight: 700, background: ui.gradient }}>
            {initialsOf(user?.username)}
          </Avatar>
          <Box sx={{ display: { xs: "none", md: "block" }, textAlign: "left" }}>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: ui.text, lineHeight: 1.2 }}>
              {user?.username}
            </Typography>
            <Typography sx={{ fontSize: "0.7rem", color: ui.faint }}>{isAdmin ? "Admin" : "Member"}</Typography>
          </Box>
        </ButtonBase>

        <Menu
          anchorEl={menuAnchor}
          open={!!menuAnchor}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 220,
                bgcolor: "#17121f",
                color: ui.text,
                border: `1px solid ${ui.border}`,
                borderRadius: 3,
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.25 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>{user?.username}</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: ui.faint }}>{user?.email}</Typography>
          </Box>
          <Divider sx={{ borderColor: ui.border }} />
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              router.push("/profile");
            }}
            sx={{ py: 1.25, fontSize: "0.9rem" }}
          >
            <ListItemIcon sx={{ color: ui.accentSoft }}>
              <PersonRoundedIcon fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              setConfirmLogout(true);
            }}
            sx={{ py: 1.25, fontSize: "0.9rem", color: ui.danger }}
          >
            <ListItemIcon sx={{ color: ui.danger }}>
              <LogoutRoundedIcon fontSize="small" />
            </ListItemIcon>
            Log out
          </MenuItem>
        </Menu>
      </Box>

      <ConfirmDialog
        open={confirmLogout}
        tone="neutral"
        icon="logout"
        title="Log out of Evenza?"
        message="You'll need to sign in again to book tickets or see your bookings."
        confirmLabel="Log out"
        cancelLabel="Stay signed in"
        onConfirm={handleLogout}
        onClose={() => setConfirmLogout(false)}
      />
    </Box>
  );
}

"use client";

import { ReactNode, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import UserNavbar from "./UserNavbar";
import { ui } from "./theme";

const loginPath = (from: string) => `/?next=${encodeURIComponent(from)}`;

export function FullPageLoader() {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", background: ui.pageBg }}>
      <CircularProgress sx={{ color: ui.accent }} />
    </Box>
  );
}

// Ends the session and sends the user to login, returning here afterwards.
export function useExpireSession() {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  return useCallback(() => {
    logout({ expired: true });
    router.replace(loginPath(pathname));
  }, [logout, router, pathname]);
}

interface Props {
  children: ReactNode;
  // Admins are bounced to their dashboard unless the page is shared (e.g. profile).
  allowAdmin?: boolean;
}

// Layout + guard for every signed-in user page.
export default function UserShell({ children, allowAdmin = false }: Props) {
  const { user, loading, isAdmin, loggedOutByUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const blocked = !user || (isAdmin && !allowAdmin);

  useEffect(() => {
    if (loading) return;
    // A deliberate logout goes to plain "/" so the next login lands on home, not back on this page.
    if (!user) router.replace(loggedOutByUser ? "/" : loginPath(pathname));
    else if (isAdmin && !allowAdmin) router.replace("/admin/dashboard");
  }, [loading, user, isAdmin, allowAdmin, loggedOutByUser, router, pathname]);

  if (loading || blocked) return <FullPageLoader />;

  return (
    <Box sx={{ minHeight: "100vh", background: ui.pageBg, color: ui.text }}>
      <UserNavbar />
      <Box component="main" className="stagger" sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 5 }, minWidth: 0 }}>
        {children}
      </Box>
    </Box>
  );
}

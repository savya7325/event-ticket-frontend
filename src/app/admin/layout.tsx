"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

// Guards every /admin/* page: guests go to login, users (role 2) go to /events.
// The backend's adminOnly middleware is still the real enforcement for data.
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (!isAdmin) router.replace("/events");
  }, [loading, user, isAdmin, router]);

  if (loading || !isAdmin) return <p style={{ padding: 20 }}>Checking access...</p>;

  return <>{children}</>;
}

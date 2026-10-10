"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export default function AdminNavbar() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user || user.role !== "admin") return null; // Only admin sees navbar

  return (
    <nav style={{ display: "flex", gap: "20px", padding: "10px", background: "#f0f0f0" }}>
      <Link href="/admin/dashboard">Dashboard</Link>
      <Link href="/admin/events">Manage Events</Link>
      <Link href="/admin/bookings">Bookings</Link>
    </nav>
  );
}
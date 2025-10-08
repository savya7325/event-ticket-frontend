"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth");
      return;
    }
    const user = JSON.parse(userStr);
    if (!user.token) {
      router.push("/auth");
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Admin! Here you can manage events and view bookings.</p>
      <ul>
        <li>
          <a href="/admin/events">Manage Events</a>
        </li>
        <li>
          <a href="/AdminBookings">View Bookings</a>
        </li>
      </ul>
    </div>
  );
}

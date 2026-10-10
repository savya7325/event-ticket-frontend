"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Button } from "@mui/material";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

interface Booking {
  _id: string;
  event: { title: string };
  user: { name: string; email: string };
  date: string;
  seats: string[];
  totalPrice: number;
}

export default function AdminBookings() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (authLoading) return; // wait until auth state is known

    if (!user) {
      router.push("/");
      return;
    }
    if (user.role !== "admin") {
      alert("Unauthorized access");
      router.push("/");
      return;
    }

    const fetchBookings = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${API_URL}/api/bookings`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!res.ok) {
          console.error(await res.text());
          throw new Error("Failed to fetch bookings");
        }

        const data: Booking[] = await res.json();
        setBookings(data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch bookings");
        router.push("/");
      } finally {
        setFetching(false);
      }
    };

    fetchBookings();
  }, [authLoading, user, router]);

  if (authLoading || fetching) return <Typography>Loading bookings...</Typography>;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #2b0f35 0%, #31212f 50%, #0d0d0d 100%)", color: "white" }}>
      <nav
        style={{
          background: "linear-gradient(90deg, #2c003e, #3d0075)",
          color: "white",
          padding: "15px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
          Evenza
        </h2>
        <ul style={{ display: "flex", listStyle: "none", gap: "20px", margin: 0 }}>
          <li style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
            Home
          </li>
          <Link href="/events" style={{ color: "white", textDecoration: "none" }}>
            events
          </Link>
        </ul>
      </nav>

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, color: "#6a11cb", fontWeight: "bold" }}>
          All Bookings
        </Typography>

        {bookings.length === 0 ? (
          <Typography>No bookings yet.</Typography>
        ) : (
          <Paper sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>User Email</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Seats</TableCell>
                  <TableCell>Total Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b._id}>
                    <TableCell>{b._id}</TableCell>
                    <TableCell>{b.user?.email || "User Deleted"}</TableCell>
                    <TableCell>{b.event?.title || "Event Deleted"}</TableCell>
                    <TableCell>{new Date(b.date).toLocaleDateString()}</TableCell>
                    <TableCell>{b.seats.join(", ")}</TableCell>
                    <TableCell>₹{b.totalPrice}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>

      <footer
        style={{
          background: "linear-gradient(90deg, #2c003e, #3d0075)",
          color: "white",
          padding: "20px",
          textAlign: "center",
          marginTop: "100px",
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} Evenza. All rights reserved.
        </Typography>
      </footer>
    </div>
  );
}
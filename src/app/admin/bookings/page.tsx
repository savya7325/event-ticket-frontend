// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper , Button } from "@mui/material";
// import {jwtDecode} from "jwt-decode";

// interface Booking {
//   _id: string;
//   event: { title: string };
//   user: { name: string; email: string };
//   date: string;
//   seats: string[];
//   totalPrice: number;
// }

// interface DecodedToken {
//   id: string;
//   role: string;
//   exp: number;
// }

// export default function AdminBookings() {
//   const router = useRouter();
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchBookings = async () => {
//       const userStr = localStorage.getItem("user");
//       if (!userStr) {
//         router.push("/");
//         return;
//       }

//       try {
//         const user = JSON.parse(userStr);
//         if (!user.token) throw new Error("No token found");

//         const decoded = jwtDecode<DecodedToken>(user.token);
//         if (decoded.role !== "admin") throw new Error("Unauthorized");

//         const res = await fetch("http://localhost:5000/api/bookings", {
//           headers: {
//             Authorization: `Bearer ${user.token}`,
//           },
//         });

//         if (!res.ok) {
//           console.error(await res.text()); // backend error log
//           throw new Error("Failed to fetch bookings");
//         }

//         const data: Booking[] = await res.json();
//         setBookings(data);
//       } catch (err) {
//         console.error(err);
//         alert("Failed to fetch bookings or unauthorized access");
//         router.push("/");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookings();
//   }, [router]);

//   if (loading) return <Typography>Loading bookings...</Typography>;

//   return (
//     <Box sx={{ p: 4 }}>
//       <Typography variant="h4" sx={{ mb: 4, color: "#6a11cb", fontWeight: "bold" }}>
//         All Bookings
//       </Typography>

//       {bookings.length === 0 ? (
//         <Typography>No bookings yet.</Typography>
//       ) : (
//         <Paper sx={{ overflowX: "auto" }}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Booking ID</TableCell>
//                 {/* <TableCell>User Name</TableCell> */}
//                 <TableCell>User Email</TableCell>
//                 <TableCell>Event</TableCell>
//                 <TableCell>Date</TableCell>
//                 <TableCell>Seats</TableCell>
//                 <TableCell>Total Price</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {bookings.map((b) => (
//                 <TableRow key={b._id}>
//                   <TableCell>{b._id}</TableCell>
//                   {/* <TableCell>{b.user.name}</TableCell> */}
//                   <TableCell>{b.user.email}</TableCell>
//                   <TableCell>{b.event.title}</TableCell>
//                   <TableCell>{b.event?.title || "Event Deleted"}</TableCell>
//                   <TableCell>{new Date(b.date).toLocaleDateString()}</TableCell>
//                   <TableCell>{b.seats.join(", ")}</TableCell>
//                   <TableCell>₹{b.totalPrice}</TableCell>
//                   <TableCell>
//   {/* <Button 
//     size="small" 
//     color="error" 
//     onClick={async () => {
//       if (!confirm("Delete this booking?")) return;
//       try {
//         const token = JSON.parse(localStorage.getItem("user") || "{}").token;
//         const res = await fetch(`http://localhost:5000/api/bookings/${b._id}`, {
//           method: "DELETE",
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         if (!res.ok) throw new Error("Failed to delete");
//         // Refresh bookings
//         window.location.reload();
//       } catch (err) {
//         alert("Failed to delete booking");
//       }
//     }}
//   >
//     Delete
//   </Button> */}
// </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </Paper>
//       )}
//     </Box>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Button } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";

interface Booking {
  _id: string;
  event: { title: string };
  user: { name: string; email: string };
  date: string;
  seats: string[];
  totalPrice: number;
}

interface DecodedToken {
  id: string;
  role: "user" | "admin"; // Fixed to match state type
  exp: number;
}

export default function AdminBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"user" | "admin">("user");

  // Fetch user role
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const decoded = jwtDecode<DecodedToken>(JSON.parse(userStr).token);
        setRole(decoded.role); 
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        router.push("/");
        return;
      }

      try {
        const user = JSON.parse(userStr);
        if (!user.token) throw new Error("No token found");

        const decoded = jwtDecode<DecodedToken>(user.token);
        if (decoded.role !== "admin") throw new Error("Unauthorized");

        const res = await fetch("http://localhost:5000/api/bookings", {
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
        alert("Failed to fetch bookings or unauthorized access");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [router]);

  if (loading) return <Typography>Loading bookings...</Typography>;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #2b0f35 0%, #31212f 50%, #0d0d0d 100%)", color: "white" }}>
      {/* Navbar */}
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
        <ul
          style={{
            display: "flex",
            listStyle: "none",
            gap: "20px",
            margin: 0,
          }}
        >
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
                    <TableCell>{b.user.email}</TableCell>
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
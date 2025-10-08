// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Box, Typography, Paper, Divider, Button } from "@mui/material";

// interface Booking {
//   _id: string;
//   event: {
//     title: string;
//     date: string;
//     price: number;
//   };
//   seats: number[];
//   totalPrice: number;
// }

// export default function MyBookingsPage() {
//   const router = useRouter();
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState(true);

// useEffect(() => {
//   const userStr = localStorage.getItem("user");
//   if (!userStr) {
//     router.push("/"); // redirect if not logged in
//     return;
//   }

//   // safer parsing of token
//   let token;
//   try {
//     token = JSON.parse(userStr).token;
//   } catch (err) {
//     console.error("Invalid user data in localStorage");
//     router.push("/");
//     return;
//   }

//   // fetch bookings using the token
//   fetch("http://localhost:5000/api/bookings/mybookings", {
//     headers: { Authorization: `Bearer ${token}` },
//   })
//     .then(async (res) => {
//       if (!res.ok) {
//         const text = await res.text(); // log HTML if returned
//         console.error("Server returned non-JSON response:", text);
//         throw new Error("Failed to fetch bookings");
//       }
//       return res.json();
//     })
//     .then((data) => {
//       setBookings(data);
//       setLoading(false);
//     })
//     .catch((err) => {
//       console.error("Error fetching bookings:", err);
//       router.push("/");
//     });
// }, [router]);


//   if (loading) return <p style={{ color: "#fff" }}>Loading your bookings...</p>;

//   if (bookings.length === 0)
//     return <p style={{ color: "#fff", textAlign: "center", marginTop: "50px" }}>No bookings found.</p>;

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         background: "linear-gradient(135deg, #0b3d0b 0%, #1a5d1a 50%, #003300 100%)",
//         padding: 4,
//         color: "#fff",
//       }}
//     >
//       <Typography variant="h4" sx={{ mb: 3, color: "#ff4d4d", textAlign: "center" }}>
//         My Bookings
//       </Typography>

//       <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 3 }}>
//         {bookings.map(booking => (
//           <Paper
//             key={booking._id}
//             sx={{
//               padding: 3,
//               borderRadius: 3,
//               background: "linear-gradient(135deg, #004d00 0%, #007700 100%)",
//             }}
//           >
//             <Typography variant="h6" sx={{ mb: 1, color: "#ffcccc" }}>
//               Event: {booking.event.title}
//             </Typography>
//             <Typography>Date: {new Date(booking.event.date).toLocaleDateString()}</Typography>
//             <Typography>Seats: {booking.seats.join(", ")}</Typography>
//             <Typography>Total Price: ${booking.totalPrice}</Typography>
//             <Button
//               variant="contained"
//               sx={{
//                 mt: 2,
//                 bgcolor: "#ff4d4d",
//                 "&:hover": { bgcolor: "#e60000" },
//               }}
//               onClick={() => router.push("/events")}
//             >
//               Go Back
//             </Button>
//           </Paper>
//         ))}
//       </Box>
//     </Box>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Card, CardContent, Button, Chip, Divider } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import ChairIcon from "@mui/icons-material/Chair";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

interface Booking {
  _id: string;
  event: {
    _id: string;
    title: string;
  };
  date: string;
  seats: string[];
  totalPrice: number;
}

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/");
      return;
    }

    let token;
    try {
      token = JSON.parse(userStr).token;
    } catch (err) {
      console.error("Invalid user data in localStorage");
      router.push("/");
      return;
    }

    fetch("http://localhost:5000/api/bookings/mybookings", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error("Server returned non-JSON response:", text);
          throw new Error("Failed to fetch bookings");
        }
        return res.json();
      })
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #1a0000 0%, #330000 50%, #0d0d0d 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ color: "#fff", fontSize: "20px" }}>Loading your bookings...</Typography>
      </Box>
    );
  }

  if (bookings.length === 0) {
    return (
      <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #1a0000 0%, #330000 50%, #0d0d0d 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 3 }}>
        <ConfirmationNumberIcon sx={{ fontSize: 80, color: "#ff4444", mb: 2, opacity: 0.5 }} />
        <Typography variant="h5" sx={{ color: "#fff", mb: 3 }}>No bookings found</Typography>
        <Button variant="contained" sx={{ bgcolor: "#ff4444", "&:hover": { bgcolor: "#cc0000" } }} onClick={() => router.push("/events")}>
          Browse Events
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #1a0000 0%, #330000 50%, #0d0d0d 100%)", p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h3" sx={{ color: "#ff4444", fontWeight: "bold", mb: 1 }}>
          My Bookings
        </Typography>
        <Typography sx={{ color: "#aaa" }}>
          You have {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
        </Typography>
      </Box>

      {/* Bookings Grid */}
      <Box sx={{ maxWidth: 1200, mx: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 3 }}>
        {bookings.map((booking) => (
          <Card
            key={booking._id}
            sx={{
              bgcolor: "#1e1e1e",
              border: "2px solid #ff4444",
              borderRadius: 3,
              overflow: "hidden",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 8px 30px rgba(255, 68, 68, 0.3)",
              },
            }}
          >
            {/* Ticket Header */}
            <Box sx={{ bgcolor: "#ff4444", p: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <ConfirmationNumberIcon sx={{ color: "#fff" }} />
              <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold" }}>
                Booking Confirmed
              </Typography>
            </Box>

            <CardContent sx={{ p: 3 }}>
              {/* Event Title */}
              <Typography variant="h5" sx={{ color: "#fff", fontWeight: "bold", mb: 2 }}>
                {booking.event.title}
              </Typography>

              <Divider sx={{ bgcolor: "#444", mb: 2 }} />

              {/* Date */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <EventIcon sx={{ color: "#ff4444" }} />
                <Box>
                  <Typography variant="caption" sx={{ color: "#999", display: "block" }}>
                    Event Date
                  </Typography>
                  <Typography sx={{ color: "#fff", fontWeight: "500" }}>
                    {new Date(booking.date).toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>
              </Box>

              {/* Seats */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}>
                <ChairIcon sx={{ color: "#ff4444", mt: 0.5 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: "#999", display: "block", mb: 1 }}>
                    Your Seats
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {booking.seats.map((seat) => (
                      <Chip
                        key={seat}
                        label={seat}
                        size="small"
                        sx={{
                          bgcolor: "#2a2a2a",
                          color: "#fff",
                          border: "1px solid #ff4444",
                          fontWeight: "bold",
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ bgcolor: "#444", my: 2 }} />

              {/* Total Price */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CurrencyRupeeIcon sx={{ color: "#ff4444" }} />
                  <Typography variant="caption" sx={{ color: "#999" }}>
                    Total Amount
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ color: "#ff4444", fontWeight: "bold" }}>
                  ₹{booking.totalPrice}
                </Typography>
              </Box>

              {/* Booking ID */}
              <Typography variant="caption" sx={{ color: "#666", display: "block", mb: 2 }}>
                Booking ID: {booking._id}
              </Typography>

              {/* Action Button */}
              <Button
                fullWidth
                variant="outlined"
                sx={{
                  borderColor: "#ff4444",
                  color: "#ff4444",
                  "&:hover": {
                    borderColor: "#ff6666",
                    bgcolor: "rgba(255, 68, 68, 0.1)",
                  },
                }}
                onClick={() => router.push(`/events/${booking.event._id}/details`)}
              >
                View Event Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Back Button */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Button
          variant="contained"
          sx={{ bgcolor: "#ff4444", "&:hover": { bgcolor: "#cc0000" }, px: 4 }}
          onClick={() => router.push("/events")}
        >
          Back to Events
        </Button>
      </Box>
    </Box>
  );
}
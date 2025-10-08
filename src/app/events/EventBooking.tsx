// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import {
//   Box,
//   Typography,
//   Button,
//   Select,
//   MenuItem,
//   FormControl,
//   Snackbar,
//   Alert,
// } from "@mui/material";

// interface Event {
//   _id: string;
//   title: string;
//   description: string;
//   dates: string[];
//   location?: string;
//   price?: number;
//   ticketsAvailable?: number;
//   bookedSeats?: Record<string, string[]>; // date -> seats
//   seatsPerDate?: Record<string, number>; // date -> total seats
// }

// export default function EventBookingPage() {
//   const { id } = useParams();
//   const router = useRouter();

//   const [event, setEvent] = useState<Event | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedDate, setSelectedDate] = useState("");
//   const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
//   const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });
//   const [bookingInProgress, setBookingInProgress] = useState(false);

//   const rows = ["A", "B", "C", "D", "E"];
//   const seatsPerRow = 8;

//   // Fetch event
//   const fetchEvent = async () => {
//     try {
//       const res = await fetch(`http://localhost:5000/api/events/${id}`);
//       if (!res.ok) throw new Error("Failed to fetch event");
//       const data: Event = await res.json();
//       setEvent(data);
//       if (!selectedDate && data.dates.length > 0) setSelectedDate(data.dates[0]);
//     } catch (err) {
//       console.error(err);
//       showSnackbar("Failed to load event", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (id) fetchEvent();
//     const interval = setInterval(() => { if (id) fetchEvent(); }, 5000); // refresh seats
//     return () => clearInterval(interval);
//   }, [id]);

//   const bookedSeatsForDate = selectedDate ? event?.bookedSeats?.[selectedDate] || [] : [];

//   const toggleSeat = (seat: string) => {
//     if (bookedSeatsForDate.includes(seat)) return;
//     setSelectedSeats(prev => prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]);
//   };

//   const showSnackbar = (message: string, severity: "success" | "error") => {
//     setSnackbar({ open: true, message, severity });
//   };
//   const closeSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

//   const bookSeats = async () => {
//     if (!selectedDate) return showSnackbar("Select a date", "error");
//     if (selectedSeats.length === 0) return showSnackbar("Select seats", "error");
//     if (!event) return;

//     setBookingInProgress(true);

//     try {
//       const token = JSON.parse(localStorage.getItem("user") || "{}").token || "";
//       const totalPrice = selectedSeats.length * (event.price || 0);

//       const res = await fetch(`http://localhost:5000/api/events/${id}/book`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
//         body: JSON.stringify({ seats: selectedSeats, date: selectedDate, totalPrice }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Booking failed");

//       showSnackbar("Booking successful", "success");
//       await fetchEvent();
//       router.push(`/events/${id}/checkout?seats=${selectedSeats.join(",")}&date=${encodeURIComponent(selectedDate)}&price=${event.price || 0}`);
//       setSelectedSeats([]);
//     } catch (err: any) {
//       console.error(err);
//       showSnackbar(err.message || "Booking failed", "error");
//     } finally {
//       setBookingInProgress(false);
//     }
//   };

//   const renderSeats = () => {
//     return rows.map(row => (
//       <Box key={row} sx={{ display: "flex", gap: 1, mb: 1, justifyContent: "center" }}>
//         {Array.from({ length: seatsPerRow }, (_, i) => {
//           const seat = `${row}${i + 1}`;
//           const isBooked = bookedSeatsForDate.includes(seat);
//           const isSelected = selectedSeats.includes(seat);

//           return (
//             <Button
//               key={seat}
//               disabled={isBooked}
//               onClick={() => toggleSeat(seat)}
//               sx={{
//                 width: 35,
//                 height: 35,
//                 bgcolor: isBooked ? "red" : isSelected ? "orange" : "green",
//                 color: "white",
//                 minWidth: 0,
//                 borderRadius: 1,
//                 "&:hover": { bgcolor: isBooked ? "red" : "#555" },
//               }}
//             >
//               {seat}
//             </Button>
//           );
//         })}
//       </Box>
//     ));
//   };

//   if (loading) return <Typography>Loading event...</Typography>;
//   if (!event) return <Typography>Event not found</Typography>;

//   return (
//     <Box sx={{ p: 4 }}>
//       <Typography variant="h4" sx={{ mb: 2, color: "#6a11cb", fontWeight: "bold" }}>{event.title}</Typography>
//       <Typography sx={{ mb: 2 }}>{event.description}</Typography>
//       <Typography sx={{ mb: 1 }}>Location: {event.location || "Not specified"}</Typography>
//       <Typography sx={{ mb: 3 }}>Price: ₹{event.price || 0}</Typography>

//       <FormControl sx={{ mb: 2 }}>
//         <Select value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedSeats([]); }}>
//           {event.dates.map(d => (
//             <MenuItem key={d} value={d}>{new Date(d).toLocaleDateString()}</MenuItem>
//           ))}
//         </Select>
//       </FormControl>

//       <Typography sx={{ mb: 1 }}>Select Seats:</Typography>
//       {renderSeats()}

//      <Typography sx={{ mt: 1, mb: 2 }}>
//   Selected: {selectedSeats.join(", ") || "None"} | Available: {event.seatsPerDate?.[selectedDate] || 0}
// </Typography>

//       <Button variant="contained" onClick={bookSeats} disabled={selectedSeats.length === 0 || !selectedDate || bookingInProgress}>
//         {bookingInProgress ? "Booking..." : "Book Selected Seats"}
//       </Button>

//       <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={closeSnackbar}>
//         <Alert severity={snackbar.severity} onClose={closeSnackbar}>{snackbar.message}</Alert>
//       </Snackbar>
//     </Box>
//   );
// }


// // "use client";
// // import * as React from "react";
// // import { useEffect, useState } from "react";
// // import { useParams, useRouter } from "next/navigation";
// // import {
// //   Box,
// //   Typography,
// //   Button,
// //   Select,
// //   MenuItem,
// //   FormControl,
// //   Snackbar,
// //   Alert,
// // } from "@mui/material";


// // interface Event {
// //   _id: string;
// //   title: string;
// //   description: string;
// //   dates: string[];
// //   location?: string;
// //   price?: number;
// //   ticketsAvailable?: number;
// //   bookedSeats?: Record<string, string[]>; // date -> seats
// //   seatsPerDate?: Record<string, number>;   // date -> total seats
// // }

// // export default function EventBookingPage() {
// //   const { id } = useParams();
// //   const router = useRouter();

// //   const [event, setEvent] = useState<Event | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [selectedDate, setSelectedDate] = useState("");
// //   const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
// //   const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });
// //   const [bookingInProgress, setBookingInProgress] = useState(false);

// //   // Fetch event from backend
// //   const fetchEvent = async () => {
// //     try {
// //       const res = await fetch(`http://localhost:5000/api/events/${id}`);
// //       if (!res.ok) throw new Error("Failed to fetch event");
// //       const data: Event = await res.json();
// //       setEvent(data);
// //       if (!selectedDate && data.dates.length > 0) setSelectedDate(data.dates[0]);
// //     } catch (err) {
// //       console.error(err);
// //       showSnackbar("Failed to load event", "error");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     if (id) fetchEvent();
// //     const interval = setInterval(() => { if (id) fetchEvent(); }, 5000); // refresh seats
// //     return () => clearInterval(interval);
// //   }, [id]);

// //   const bookedSeatsForDate = selectedDate ? event?.bookedSeats?.[selectedDate] || [] : [];

// //   const toggleSeat = (seat: string) => {
// //     if (bookedSeatsForDate.includes(seat)) return;
// //     setSelectedSeats(prev => prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]);
// //   };

// //   const showSnackbar = (message: string, severity: "success" | "error") => {
// //     setSnackbar({ open: true, message, severity });
// //   };
// //   const closeSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

// //   const bookSeats = async () => {
// //     if (!selectedDate) return showSnackbar("Select a date", "error");
// //     if (selectedSeats.length === 0) return showSnackbar("Select seats", "error");
// //     if (!event) return;

// //     setBookingInProgress(true);

// //     try {
// //       const token = JSON.parse(localStorage.getItem("user") || "{}").token || "";
// //       const totalPrice = selectedSeats.length * (event.price || 0);

// //       const res = await fetch(`http://localhost:5000/api/events/${id}/book`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
// //         body: JSON.stringify({ seats: selectedSeats, date: selectedDate, totalPrice }),
// //       });

// //       const data = await res.json();
// //       if (!res.ok) throw new Error(data.message || "Booking failed");

// //       showSnackbar("Booking successful", "success");
// //       await fetchEvent();
// //       router.push(`/events/${id}/checkout?seats=${selectedSeats.join(",")}&date=${encodeURIComponent(selectedDate)}&price=${event.price || 0}`);
// //       setSelectedSeats([]);
// //     } catch (err: any) {
// //       console.error(err);
// //       showSnackbar(err.message || "Booking failed", "error");
// //     } finally {
// //       setBookingInProgress(false);
// //     }
// //   };

// //   // Generate seats dynamically based on ticketsAvailable
// //   const generateSeats = (totalSeats: number, booked: string[]) => {
// //     const seats: { id: string; booked: boolean }[] = [];
// //     const rows = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // up to 26 rows
// //     let seatCount = 0;

// //     for (let r = 0; r < rows.length && seatCount < totalSeats; r++) {
// //       for (let c = 1; c <= 20 && seatCount < totalSeats; c++) { // 20 seats per row max
// //         const seatId = `${rows[r]}${c}`;
// //         seats.push({ id: seatId, booked: booked.includes(seatId) });
// //         seatCount++;
// //       }
// //     }
// //     return seats;
// //   };

// //  const renderSeats = () => {
// //   if (!event) return null;

// //   const bookedSeats = selectedDate ? event.bookedSeats?.[selectedDate] || [] : [];
// //   const totalSeats = event.ticketsAvailable || 0;

// //   const seatsPerRow = 10; // you can adjust, e.g., 10, 12, 15
// //   const rowsNeeded = Math.ceil(totalSeats / seatsPerRow);

// //   const seatRows: React.ReactNode[] = [];

// //   for (let r = 0; r < rowsNeeded; r++) {
// //     const rowSeats: React.ReactNode[] = [];
// //     for (let c = 1; c <= seatsPerRow; c++) {
// //       const seatNumber = r * seatsPerRow + c;
// //       if (seatNumber > totalSeats) break;
// //       const seatId = `R${r + 1}S${c}`; // e.g., R1S1, R1S2
// //       const isBooked = bookedSeats.includes(seatId);

// //       rowSeats.push(
// //         <Button
// //           key={seatId}
// //           disabled={isBooked}
// //           onClick={() => toggleSeat(seatId)}
// //           sx={{
// //             width: 35,
// //             height: 35,
// //             bgcolor: isBooked ? "red" : selectedSeats.includes(seatId) ? "orange" : "green",
// //             color: "white",
// //             minWidth: 0,
// //             borderRadius: 1,
// //             "&:hover": { bgcolor: isBooked ? "red" : "#555" },
// //           }}
// //         >
// //           {seatId}
// //         </Button>
// //       );
// //     }
// //     seatRows.push(
// //       <Box key={r} sx={{ display: "flex", gap: 1, mb: 1, justifyContent: "center" }}>
// //         {rowSeats}
// //       </Box>
// //     );
// //   }

// //   return seatRows;
// // };



// //   if (loading) return <Typography>Loading event...</Typography>;
// //   if (!event) return <Typography>Event not found</Typography>;

// //   return (
// //     <Box sx={{ p: 4 }}>
// //       <Typography variant="h4" sx={{ mb: 2, color: "#6a11cb", fontWeight: "bold" }}>{event.title}</Typography>
// //       <Typography sx={{ mb: 2 }}>{event.description}</Typography>
// //       <Typography sx={{ mb: 1 }}>Location: {event.location || "Not specified"}</Typography>
// //       <Typography sx={{ mb: 3 }}>Price: ₹{event.price || 0}</Typography>

// //       <FormControl sx={{ mb: 2 }}>
// //         <Select value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedSeats([]); }}>
// //           {event.dates.map(d => (
// //             <MenuItem key={d} value={d}>{new Date(d).toLocaleDateString()}</MenuItem>
// //           ))}
// //         </Select>
// //       </FormControl>

// //       <Typography sx={{ mb: 1 }}>Select Seats:</Typography>
// //       {renderSeats()}

// //       <Typography sx={{ mt: 1, mb: 2 }}>
// //         Selected: {selectedSeats.join(", ") || "None"} | Available: {event.seatsPerDate?.[selectedDate] || 0}
// //       </Typography>

// //       <Button variant="contained" onClick={bookSeats} disabled={selectedSeats.length === 0 || !selectedDate || bookingInProgress}>
// //         {bookingInProgress ? "Booking..." : "Book Selected Seats"}
// //       </Button>

// //       <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={closeSnackbar}>
// //         <Alert severity={snackbar.severity} onClose={closeSnackbar}>{snackbar.message}</Alert>
// //       </Snackbar>
// //     </Box>
// //   );
// // }


"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  Snackbar,
  Alert,
} from "@mui/material";

interface Event {
  _id: string;
  title: string;
  description: string;
  dates: string[];
  location?: string;
  price?: number;
  ticketsAvailable?: number;
  bookedSeats?: Record<string, string[]>;
  seatsPerDate?: Record<string, number>;
}

export default function EventBookingPage() {
  const { id } = useParams();
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ 
    open: false, message: "", severity: "success" 
  });
  const [bookingInProgress, setBookingInProgress] = useState(false);

  // Calculate dynamic seat layout based on ticketsAvailable
  const calculateSeatLayout = (totalSeats: number) => {
    // Aim for roughly 8-10 seats per row for good UI
    const seatsPerRow = Math.min(10, Math.ceil(Math.sqrt(totalSeats * 1.2)));
    const rows = Math.ceil(totalSeats / seatsPerRow);
    
    const rowLabels: string[] = [];
    for (let i = 0; i < rows; i++) {
      rowLabels.push(String.fromCharCode(65 + i)); // A, B, C, ...
    }
    
    return { rows: rowLabels, seatsPerRow };
  };

  const fetchEvent = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/events/${id}`);
      if (!res.ok) throw new Error("Failed to fetch event");
      const data: Event = await res.json();
      
      // Set default ticketsAvailable if missing
      if (!data.ticketsAvailable) {
        data.ticketsAvailable = 50;
      }
      
      setEvent(data);
      if (!selectedDate && data.dates.length > 0) {
        setSelectedDate(data.dates[0]);
      }
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to load event", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchEvent();
    const interval = setInterval(() => { 
      if (id) fetchEvent(); 
    }, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const bookedSeatsForDate = selectedDate ? event?.bookedSeats?.[selectedDate] || [] : [];

  const toggleSeat = (seat: string) => {
    if (bookedSeatsForDate.includes(seat)) return;
    setSelectedSeats(prev => 
      prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
    );
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };
  
  const closeSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  const bookSeats = async () => {
    if (!selectedDate) return showSnackbar("Select a date", "error");
    if (selectedSeats.length === 0) return showSnackbar("Select seats", "error");
    if (!event) return;

    setBookingInProgress(true);

    try {
      const token = JSON.parse(localStorage.getItem("user") || "{}").token || "";
      const totalPrice = selectedSeats.length * (event.price || 0);

      const res = await fetch(`http://localhost:5000/api/events/${id}/book`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          seats: selectedSeats, 
          date: selectedDate, 
          totalPrice 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      showSnackbar("Booking successful", "success");
      await fetchEvent();
      router.push(`/events/${id}/checkout?seats=${selectedSeats.join(",")}&date=${encodeURIComponent(selectedDate)}&price=${event.price || 0}`);
      setSelectedSeats([]);
    } catch (err: any) {
      console.error(err);
      showSnackbar(err.message || "Booking failed", "error");
    } finally {
      setBookingInProgress(false);
    }
  };

  const renderSeats = () => {
    if (!event || !event.ticketsAvailable) return null;

    const { rows, seatsPerRow } = calculateSeatLayout(event.ticketsAvailable);
    const totalSeats = event.ticketsAvailable;
    let seatCount = 0;

    return rows.map(row => {
      const seatsInThisRow = Math.min(seatsPerRow, totalSeats - seatCount);
      const rowSeats = Array.from({ length: seatsInThisRow }, (_, i) => {
        seatCount++;
        const seat = `${row}${i + 1}`;
        const isBooked = bookedSeatsForDate.includes(seat);
        const isSelected = selectedSeats.includes(seat);

        return (
          <Button
            key={seat}
            disabled={isBooked}
            onClick={() => toggleSeat(seat)}
            sx={{
              width: 45,
              height: 45,
              bgcolor: isBooked ? "red" : isSelected ? "orange" : "green",
              color: "white",
              minWidth: 0,
              borderRadius: 1,
              fontSize: "0.75rem",
              "&:hover": { bgcolor: isBooked ? "red" : "#555" },
              "&:disabled": { bgcolor: "red", opacity: 0.7 }
            }}
          >
            {seat}
          </Button>
        );
      });

      return (
        <Box key={row} sx={{ display: "flex", gap: 1, mb: 1, justifyContent: "center" }}>
          {rowSeats}
        </Box>
      );
    });
  };

  if (loading) return <Typography>Loading event...</Typography>;
  if (!event) return <Typography>Event not found</Typography>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, color: "#6a11cb", fontWeight: "bold" }}>
        {event.title}
      </Typography>
      <Typography sx={{ mb: 2 }}>{event.description}</Typography>
      <Typography sx={{ mb: 1 }}>Location: {event.location || "Not specified"}</Typography>
      <Typography sx={{ mb: 3 }}>Price: ₹{event.price || 0}</Typography>

      <FormControl sx={{ mb: 2, minWidth: 200 }}>
        <Typography sx={{ mb: 1 }}>Date:</Typography>
        <Select 
          value={selectedDate} 
          onChange={(e) => { 
            setSelectedDate(e.target.value); 
            setSelectedSeats([]); 
          }}
        >
          {event.dates.map(d => (
            <MenuItem key={d} value={d}>
              {new Date(d).toLocaleDateString()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Select Your Seats:</Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 20, height: 20, bgcolor: "green", borderRadius: 1 }} />
            <Typography variant="body2">Available</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 20, height: 20, bgcolor: "orange", borderRadius: 1 }} />
            <Typography variant="body2">Selected</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 20, height: 20, bgcolor: "red", borderRadius: 1 }} />
            <Typography variant="body2">Booked</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ 
        bgcolor: "#f5f5f5", 
        p: 3, 
        borderRadius: 2, 
        display: "inline-block",
        mb: 2 
      }}>
        {renderSeats()}
      </Box>

      <Typography sx={{ mt: 2, mb: 2, fontWeight: "bold" }}>
        Selected: {selectedSeats.join(", ") || "None"} | 
        Available: {event.seatsPerDate?.[selectedDate] || 0} / {event.ticketsAvailable || 0}
      </Typography>

      <Button 
        variant="contained" 
        onClick={bookSeats} 
        disabled={selectedSeats.length === 0 || !selectedDate || bookingInProgress}
        sx={{ 
          bgcolor: "#6a11cb", 
          "&:hover": { bgcolor: "#5a0db3" },
          py: 1.5,
          px: 4
        }}
      >
        {bookingInProgress ? "Booking..." : `Book ${selectedSeats.length} Seat${selectedSeats.length !== 1 ? 's' : ''}`}
      </Button>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={closeSnackbar}>
        <Alert severity={snackbar.severity} onClose={closeSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
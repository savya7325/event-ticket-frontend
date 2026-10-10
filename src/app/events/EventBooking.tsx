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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  // const [bookingInProgress, setBookingInProgress] = useState(false);

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
      const res = await fetch(`${API_URL}/api/events/${id}`);
      if (!res.ok) throw new Error("Failed to fetch event");
      const data: Event = await res.json();
      
      // Set default ticketsAvailable if missing
      if (!data.ticketsAvailable) {
        data.ticketsAvailable = 50;
      }
      
     setEvent(data);
setSelectedDate(prev => prev || data.dates[0] || "");
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

 const goToCheckout = () => {
  if (!selectedDate) return showSnackbar("Select a date", "error");
  if (selectedSeats.length === 0) return showSnackbar("Select seats", "error");
  if (!event) return;

  router.push(
    `/events/${id}/checkout?seats=${selectedSeats.join(",")}&date=${selectedDate}&price=${event.price || 0}`
  );
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
  onClick={goToCheckout} 
  disabled={selectedSeats.length === 0 || !selectedDate}
  sx={{ 
    bgcolor: "#6a11cb", 
    "&:hover": { bgcolor: "#5a0db3" },
    py: 1.5,
    px: 4
  }}
>
  Proceed to Checkout
</Button>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={closeSnackbar}>
        <Alert severity={snackbar.severity} onClose={closeSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
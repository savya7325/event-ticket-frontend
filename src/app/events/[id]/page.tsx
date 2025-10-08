// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { Box, Typography, Button } from "@mui/material";

// // Define the Event type
// interface Event {
//   _id: string;
//   title: string;
//   description: string;
//   date: string;
//   location?: string;
//   price?: number;
//   ticketsAvailable: number;
// }

// export default function EventBookingPage() {
//   const { id } = useParams(); // Event ID from URL
//   const [event, setEvent] = useState<Event | null>(null);
//   const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch event data
//   useEffect(() => {
//     const fetchEvent = async () => {
//       try {
//         console.log("Fetching event with ID:", id);
//         const res = await fetch(`http://localhost:5000/api/events/${id}`);
//         console.log("Response status:", res.status);
//         if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//         const data: Event = await res.json();
//         setEvent(data);
//       } catch (err: any) {
//         console.error("Error fetching event:", err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) fetchEvent();
//   }, [id]);

//   if (loading) return <Typography>Loading event...</Typography>;
//   if (!event) return <Typography>Event not found</Typography>;

//   // Toggle seat selection
//   const toggleSeat = (seat: number) => {
//     setSelectedSeats((prev: number[]) =>
//       prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
//     );
//   };

//   // Book selected seats
//   const bookSeats = async () => {
//     if (selectedSeats.length === 0) return alert("Select seats first");
//     try {
//       const res = await fetch(`http://localhost:5000/api/events/${id}/book`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ seats: selectedSeats }),
//       });

//       const data: { message: string } = await res.json();
//       if (!res.ok) throw new Error(data.message || "Booking failed");

//       alert(data.message);

//       // Update local ticketsAvailable
//       setEvent((prev: Event | null) =>
//         prev
//           ? { ...prev, ticketsAvailable: prev.ticketsAvailable - selectedSeats.length }
//           : prev
//       );

//       // Clear selected seats
//       setSelectedSeats([]);
//     } catch (err: any) {
//       alert(err.message);
//     }
//   };

//   return (
//     <Box sx={{ p: 4 }}>
//       {/* Event details */}
//       <Typography variant="h4" sx={{ mb: 2, color: "#6a11cb", fontWeight: "bold" }}>
//         {event.title}
//       </Typography>
//       <Typography sx={{ mb: 2 }}>{event.description}</Typography>
//       <Typography sx={{ mb: 1 }}>Date: {new Date(event.date).toLocaleDateString()}</Typography>
//       <Typography sx={{ mb: 1 }}>Location: {event.location}</Typography>
//       <Typography sx={{ mb: 3 }}>Price: ₹{event.price}</Typography>

//       {/* Seat selection */}
//       <Typography variant="h6" sx={{ mb: 2 }}>
//         Select Your Seats
//       </Typography>
//       <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
//         {Array.from({ length: event.ticketsAvailable }, (_, i) => {
//           const seatNumber = i + 1;
//           const isSelected = selectedSeats.includes(seatNumber);
//           return (
//             <Button
//               key={seatNumber}
//               variant="outlined"
//               sx={{
//                 minWidth: 40,
//                 minHeight: 40,
//                 borderColor: isSelected ? "#ff4081" : "#6a11cb",
//                 color: isSelected ? "#fff" : "#6a11cb",
//                 bgcolor: isSelected ? "#6a11cb" : "transparent",
//                 "&:hover": { bgcolor: "#6a11cb", color: "white" },
//               }}
//               onClick={() => toggleSeat(seatNumber)}
//             >
//               {seatNumber}
//             </Button>
//           );
//         })}
//       </Box>

//       {/* Book button */}
//       <Button
//         variant="contained"
//         color="primary"
//         onClick={bookSeats}
//         disabled={selectedSeats.length === 0}
//       >
//         Book Selected Seats
//       </Button>
//     </Box>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Typography, Button, Select, MenuItem } from "@mui/material";

interface Event {
  _id: string;
  title: string;
  description: string;
  dates?: string[];
  date?: string; // fallback if only single date
  location?: string;
  price?: number;
  ticketsAvailable: number;
  bookedSeats?: { [date: string]: string[] };
}

export default function EventBookingPage() {
  const { id } = useParams();
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const rows = ["A", "B", "C", "D", "E"];
  const seatsPerRow = 10;

  useEffect(() => setHydrated(true), []);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/events/${id}`);
        if (!res.ok) throw new Error("Failed to fetch event");
        const data: Event = await res.json();

        // Normalize dates: use event.dates array, fallback to event.date
        const datesArray = Array.isArray(data.dates) && data.dates.length
          ? data.dates
          : data.date
          ? [data.date]
          : [];

        setEvent({ ...data, dates: datesArray });

        if (datesArray.length > 0) setSelectedDate(new Date(datesArray[0]).toISOString());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  if (!hydrated) return null;
  if (loading) return <Typography>Loading event...</Typography>;
  if (!event) return <Typography>Event not found</Typography>;

  const bookedSeatsForDate = selectedDate
    ? event.bookedSeats?.[new Date(selectedDate).toISOString().split("T")[0]] || []
    : [];

  const toggleSeat = (seat: string) => {
    if (bookedSeatsForDate.includes(seat)) return;
    setSelectedSeats(prev =>
      prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
    );
  };

  const bookSeats = async () => {
    if (!selectedDate) return alert("Select a date first");
    if (selectedSeats.length === 0) return alert("Select seats first");

    const seatsToBook = [...selectedSeats];

    try {
      const res = await fetch(`http://localhost:5000/api/events/${id}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seats: seatsToBook, date: selectedDate }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      alert(data.message);

      // Update booked seats locally
      setEvent(prev =>
        prev
          ? {
              ...prev,
              bookedSeats: {
                ...prev.bookedSeats,
                [new Date(selectedDate).toISOString().split("T")[0]]: [
                  ...(prev.bookedSeats?.[new Date(selectedDate).toISOString().split("T")[0]] || []),
                  ...seatsToBook,
                ],
              },
            }
          : prev
      );

      setSelectedSeats([]);
      router.push(`/events/${id}/checkout?seats=${seatsToBook.join(",")}&date=${selectedDate}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, color: "#6a11cb", fontWeight: "bold" }}>
        {event.title}
      </Typography>
      <Typography sx={{ mb: 2 }}>{event.description}</Typography>
      <Typography sx={{ mb: 1 }}>Location: {event.location || "Not specified"}</Typography>
      <Typography sx={{ mb: 3 }}>Price: ₹{event.price || 0}</Typography>

      {event.dates && event.dates.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography>Select Date:</Typography>
          <Select
            value={selectedDate}
            onChange={e => {
              setSelectedDate(e.target.value);
              setSelectedSeats([]); // clear seats when date changes
            }}
          >
            {event.dates.map(date => (
              <MenuItem key={date} value={new Date(date).toISOString()}>
                {new Date(date).toLocaleDateString()}
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}

      <Typography variant="h6" sx={{ mb: 1 }}>Select Your Seats</Typography>
      <Typography sx={{ mb: 2, color: "#666" }}>
        Selected Seats: {selectedSeats.join(", ") || "None"}
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${seatsPerRow}, 50px)`, gap: 10, mb: 2 }}>
        {rows.map(row =>
          Array.from({ length: seatsPerRow }, (_, i) => {
            const seatLabel = `${row}${i + 1}`;
            const isSelected = selectedSeats.includes(seatLabel);
            const isSold = bookedSeatsForDate.includes(seatLabel);

            return (
              <Button
                key={seatLabel}
                variant="outlined"
                onClick={() => toggleSeat(seatLabel)}
                disabled={isSold}
                sx={{
                  minWidth: 50,
                  minHeight: 50,
                  borderColor: isSelected ? "#ff4081" : "#6a11cb",
                  color: isSold ? "#666" : isSelected ? "#fff" : "#6a11cb",
                  bgcolor: isSold ? "#ccc" : isSelected ? "#6a11cb" : "transparent",
                  "&:hover": { bgcolor: isSold ? "#ccc" : "#6a11cb", color: "#fff" },
                }}
              >
                {seatLabel}
              </Button>
            );
          })
        )}
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={bookSeats}
        disabled={selectedSeats.length === 0 || !selectedDate}
      >
        Book Selected Seats
      </Button>
    </Box>
  );
}

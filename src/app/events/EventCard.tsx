// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Drawer,
//   Button,
//   Box,
//   TextField,
//   Typography,
//   Card,
//   CardContent,
//   CardMedia,
//   CardActions,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
// } from "@mui/material";
// import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
// import dayjs, { Dayjs } from "dayjs";
// import ClientDatePicker from "./ClientDatePicker";

// interface Event {
//   _id: string;
//   title: string;
//   description: string;
//   dates: string[];
//   location?: string;
//   price?: number;
//   ticketsAvailable?: number;
//   image?: string;
//   seatsPerDate?: Record<string, number>;
//   bookedSeats?: Record<string, string[]>;
// }

// interface Props {
//   event: Event;
//   role: "user" | "admin";
//   onEdit: (id: string, data: FormData) => Promise<void>;
//   onDelete: (id: string) => Promise<void>;
//   seatsPerDate?: Record<string, number>;      // add this
//   bookedSeats?: Record<string, string[]>;     // add this
// }


// export default function EventCard({ event, role, onEdit, onDelete }: Props) {
//   const router = useRouter();

//   const [eventData, setEventData] = useState<Event>(event);
//   const [editOpen, setEditOpen] = useState(false);
//   const [bookDialogOpen, setBookDialogOpen] = useState(false);

//   const [form, setForm] = useState({
//     title: event.title,
//     description: event.description,
//     dates: event.dates || [],
//     location: event.location || "",
//     price: event.price || 0,
//     ticketsAvailable: event.ticketsAvailable || 0,
//   });

//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [newDate, setNewDate] = useState<Dayjs | null>(null);

//   const [selectedDate, setSelectedDate] = useState(event.dates[0] || "");
//   const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
//   const [bookingInProgress, setBookingInProgress] = useState(false);

//   const rows = ["A", "B", "C", "D", "E"];
//   const cols = 8;

//   // Toggle seat selection
//   const toggleSeat = (seat: string) => {
//     setSelectedSeats(prev =>
//       prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
//     );
//   };

//   // Booking handler
//   const handleBooking = async () => {
//     if (!selectedDate || selectedSeats.length === 0 || bookingInProgress) return;
//     setBookingInProgress(true);
//     try {
//       const token = JSON.parse(localStorage.getItem("user") || "{}").token || "";
//       const totalPrice = selectedSeats.length * (eventData.price || 0);

//       const res = await fetch(`http://localhost:5000/api/events/${event._id}/book`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ seats: selectedSeats, date: selectedDate, totalPrice }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Booking failed");

//       router.push(
//         `/events/${event._id}/checkout?seats=${selectedSeats.join(",")}&date=${encodeURIComponent(
//           selectedDate
//         )}&price=${eventData.price || 0}`
//       );
//       setBookDialogOpen(false);
//       setSelectedSeats([]);
//     } catch (err: any) {
//       alert(err.message || "Booking failed");
//     } finally {
//       setBookingInProgress(false);
//     }
//   };

//   // Render seat grid
//   const renderSeats = () => {
//     const booked = eventData.bookedSeats?.[selectedDate] || [];
//     return rows.map(row => (
//       <div key={row} style={{ display: "flex", gap: 5, marginBottom: 5 }}>
//         {Array.from({ length: cols }).map((_, i) => {
//           const seat = `${row}${i + 1}`;
//           const isBooked = booked.includes(seat);
//           const isSelected = selectedSeats.includes(seat);
//           return (
//             <button
//               key={seat}
//               disabled={isBooked}
//               onClick={() => toggleSeat(seat)}
//               style={{
//                 width: 30,
//                 height: 30,
//                 background: isBooked ? "red" : isSelected ? "orange" : "green",
//                 color: "white",
//                 border: "none",
//                 borderRadius: 3,
//                 cursor: isBooked ? "not-allowed" : "pointer",
//               }}
//             >
//               {seat}
//             </button>
//           );
//         })}
//       </div>
//     ));
//   };

//   // Handle form change
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value, files } = e.target as HTMLInputElement;
//     if (name === "image" && files) setImageFile(files[0]);
//     else
//       setForm(prev => ({
//         ...prev,
//         [name]: name === "price" || name === "ticketsAvailable" ? Number(value) : value,
//       }));
//   };

//   // Submit edit form
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append("title", form.title);
//     formData.append("description", form.description);
//     form.dates.forEach(d => formData.append("dates", d));
//     formData.append("location", form.location);
//     formData.append("price", form.price.toString());
//     formData.append("ticketsAvailable", form.ticketsAvailable.toString());
//     if (imageFile) formData.append("image", imageFile);

//     onEdit(event._id, formData);

//     // Initialize bookedSeats and seatsPerDate for new dates
//     const newBookedSeats: Record<string, string[]> = { ...eventData.bookedSeats };
//     const newSeatsPerDate: Record<string, number> = { ...eventData.seatsPerDate };
//     form.dates.forEach(d => {
//       if (!(d in newBookedSeats)) newBookedSeats[d] = [];
//       if (!(d in newSeatsPerDate))
//         newSeatsPerDate[d] = form.ticketsAvailable - newBookedSeats[d].length;
//     });

//     setEventData(prev => ({
//       ...prev,
//       ...form,
//       bookedSeats: newBookedSeats,
//       seatsPerDate: newSeatsPerDate,
//     }));
//     setEditOpen(false);
//   };

//   return (
//     <>
//       <Card
//         sx={{
//           maxWidth: 345,
//           border: "1px solid #6a11cb",
//           borderRadius: 3,
//           bgcolor: "#1e1e2f",
//           color: "white",
//           boxShadow: "0px 4px 15px rgba(106, 17, 203, 0.4)",
//         }}
//       >
//        <Box 
//   onClick={() => router.push(`/events/${event._id}/details`)} 
//   sx={{ cursor: "pointer" }}
// >
//   <CardMedia
//     component="img"
//     height="180"
//     image={eventData.image || "/default-image.jpg"}
//     alt={eventData.title}
//   />
// </Box>
//         <CardContent>
//           <Typography variant="h6" sx={{ color: "#ffb703", fontWeight: "bold" }}>
//             {eventData.title}
//           </Typography>
//           <Typography variant="body2" sx={{ color: "#c9c9ff", mb: 1 }}>
//             {eventData.description}
//           </Typography>
//           <Typography variant="body2" sx={{ color: "#e0e0e0", mb: 1 }}>
//             {eventData.dates.map(d => dayjs(d).format("DD/MM/YYYY")).join(", ")}
//           </Typography>
//           {eventData.location && (
//             <Typography variant="body2" sx={{ color: "#bbbbff" }}>
//               {eventData.location}
//             </Typography>
//           )}
//           {eventData.price !== undefined && (
//             <Typography
//               variant="body2"
//               sx={{
//                 fontWeight: "bold",
//                 color: "white",
//                 bgcolor: "#6a11cb",
//                 px: 1.5,
//                 py: 0.5,
//                 borderRadius: 2,
//                 fontSize: "0.85rem",
//                 display: "inline-block",
//                 mb: 1,
//               }}
//             >
//               ₹{eventData.price}
//             </Typography>
//           )}

//           {(() => {
//   // Calculate total available seats from seatsPerDate
//   const totalSeatsFromDates = eventData.seatsPerDate && Object.keys(eventData.seatsPerDate).length > 0
//     ? Object.values(eventData.seatsPerDate).reduce((sum, seats) => sum + seats, 0)
//     : null;
  
//   // Use seatsPerDate total if available, otherwise fall back to ticketsAvailable
//   const displayTickets = totalSeatsFromDates !== null ? totalSeatsFromDates : (eventData.ticketsAvailable || 0);
  
//   return (
//     <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
//       <Typography
//         variant="body2"
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           gap: 0.5,
//           fontWeight: "bold",
//           color: displayTickets > 0 ? "#4caf50" : "#ff5252",
//           bgcolor: displayTickets > 0 ? "rgba(76,175,80,0.1)" : "rgba(255,82,82,0.1)",
//           px: 1.5,
//           py: 0.5,
//           borderRadius: 2,
//           fontSize: "0.85rem",
//         }}
//       >
//         <ConfirmationNumberIcon fontSize="small" /> {displayTickets} Tickets Available
//       </Typography>
//     </Box>
//   );
// })()}
//         </CardContent>

//         <CardActions sx={{ justifyContent: "space-between" }}>
//           {role === "user" && (
//             <Button
//               variant="contained"
//               sx={{ bgcolor: "#6a11cb", color: "white" }}
//               onClick={() => setBookDialogOpen(true)}
//             >
//               Book Ticket
//             </Button>
//           )}
//           {role === "admin" && (
//             <>
//               <Button
//                 variant="outlined"
//                 sx={{ borderColor: "#6a11cb", color: "#6a11cb" }}
//                 onClick={() => setEditOpen(true)}
//               >
//                 Edit
//               </Button>
//               <Button variant="outlined" color="error" onClick={() => onDelete(event._id)}>
//                 Delete
//               </Button>
//             </>
//           )}
//         </CardActions>
//       </Card>

//       {/* Admin Drawer */}
//       <Drawer anchor="right" open={editOpen} onClose={() => setEditOpen(false)}>
//         <Box sx={{ width: 400, p: 3 }}>
//           <Typography variant="h6" sx={{ mb: 2 }}>
//             Edit Event
//           </Typography>
//           <form onSubmit={handleSubmit}>
//             <TextField fullWidth label="Title" name="title" value={form.title} onChange={handleChange} sx={{ mb: 2 }} />
//             <TextField fullWidth label="Description" name="description" value={form.description} onChange={handleChange} sx={{ mb: 2 }} />
//             <Box sx={{ mb: 2 }}>
//               <Typography sx={{ mb: 1 }}>Dates</Typography>
//               <ClientDatePicker label="Select Date" value={newDate} onChange={setNewDate} />
//               <Button
//                 variant="contained"
//                 onClick={() => {
//                   if (newDate) {
//                     const iso = newDate.toISOString();
//                     if (!form.dates.includes(iso)) setForm(prev => ({ ...prev, dates: [...prev.dates, iso] }));
//                     setNewDate(null);
//                   }
//                 }}
//                 sx={{ mt: 1, mb: 1 }}
//               >
//                 Add Date
//               </Button>
//               <Box>
//                 {form.dates.map(d => (
//                   <Box key={d} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
//                     <Typography>{dayjs(d).format("DD/MM/YYYY")}</Typography>
//                     <Button
//                       size="small"
//                       color="error"
//                       onClick={() => setForm(prev => ({ ...prev, dates: prev.dates.filter(date => date !== d) }))}
//                     >
//                       Remove
//                     </Button>
//                   </Box>
//                 ))}
//               </Box>
//             </Box>

//             <TextField fullWidth label="Location" name="location" value={form.location} onChange={handleChange} sx={{ mb: 2 }} />
//             <TextField fullWidth label="Price" type="number" name="price" value={form.price} onChange={handleChange} sx={{ mb: 2 }} />
//             <TextField fullWidth label="Tickets Available" type="number" name="ticketsAvailable" value={form.ticketsAvailable} onChange={handleChange} sx={{ mb: 2 }} />
//             <TextField fullWidth type="file" name="image" onChange={handleChange} sx={{ mb: 2 }} />

//             <Button variant="contained" type="submit" sx={{ mt: 1 }}>
//               Save Changes
//             </Button>
//           </form>
//         </Box>
//       </Drawer>

//       {/* Booking Dialog */}
//       <Dialog open={bookDialogOpen} onClose={() => setBookDialogOpen(false)} fullWidth maxWidth="sm">
//         <DialogTitle>Book Seats for {eventData.title}</DialogTitle>
//         <DialogContent>
//           <FormControl fullWidth sx={{ mb: 2 }}>
//             <InputLabel>Date</InputLabel>
//             <Select
//               value={selectedDate}
//               label="Date"
//               onChange={e => {
//                 setSelectedDate(e.target.value);
//                 setSelectedSeats([]);
//               }}
//             >
//               {eventData.dates.map(d => (
//                 <MenuItem key={d} value={d}>
//                   {dayjs(d).format("DD/MM/YYYY")}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//           <div style={{ marginTop: 10 }}>{renderSeats()}</div>
//           <Typography variant="body2" sx={{ mt: 1 }}>
//             Legend: <span style={{ color: "green" }}>Available</span> | <span style={{ color: "red" }}>Booked</span> | <span style={{ color: "orange" }}>Selected</span>
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setBookDialogOpen(false)}>Cancel</Button>
//           <Button variant="contained" onClick={handleBooking} disabled={selectedSeats.length === 0 || bookingInProgress}>
//             {bookingInProgress ? "Booking..." : "Confirm Booking"}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Drawer,
  Button,
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import dayjs, { Dayjs } from "dayjs";
import ClientDatePicker from "./ClientDatePicker";

interface Event {
  _id: string;
  title: string;
  description: string;
  dates: string[];
  location?: string;
  price?: number;
  ticketsAvailable?: number;
  image?: string;
  seatsPerDate?: Record<string, number>;
  bookedSeats?: Record<string, string[]>;
}

interface Props {
  event: Event;
  role: "user" | "admin";
  onEdit: (id: string, data: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  seatsPerDate?: Record<string, number>;
  bookedSeats?: Record<string, string[]>;
}

export default function EventCard({ event, role, onEdit, onDelete }: Props) {
  const router = useRouter();

  const [eventData, setEventData] = useState<Event>(event);
  const [editOpen, setEditOpen] = useState(false);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);

  const [form, setForm] = useState({
    title: event.title,
    description: event.description,
    dates: event.dates || [],
    location: event.location || "",
    price: event.price || "",
    ticketsAvailable: event.ticketsAvailable || "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newDate, setNewDate] = useState<Dayjs | null>(null);

  const [selectedDate, setSelectedDate] = useState(event.dates[0] || "");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  // Calculate dynamic seat layout
  const calculateSeatLayout = (totalSeats: number) => {
    const seatsPerRow = Math.min(10, Math.ceil(Math.sqrt(totalSeats * 1.2)));
    const rows = Math.ceil(totalSeats / seatsPerRow);
    
    const rowLabels: string[] = [];
    for (let i = 0; i < rows; i++) {
      rowLabels.push(String.fromCharCode(65 + i)); // A, B, C, ...
    }
    
    return { rows: rowLabels, seatsPerRow };
  };

  // Toggle seat selection
  const toggleSeat = (seat: string) => {
    const booked = eventData.bookedSeats?.[selectedDate] || [];
    if (booked.includes(seat)) return;
    setSelectedSeats(prev =>
      prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
    );
  };

  // Booking handler
  const handleBooking = async () => {
    if (!selectedDate || selectedSeats.length === 0 || bookingInProgress) return;
    setBookingInProgress(true);
    try {
      const token = JSON.parse(localStorage.getItem("user") || "{}").token || "";
      const totalPrice = selectedSeats.length * (eventData.price || 0);

      const res = await fetch(`http://localhost:5000/api/events/${event._id}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ seats: selectedSeats, date: selectedDate, totalPrice }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      router.push(
        `/events/${event._id}/checkout?seats=${selectedSeats.join(",")}&date=${encodeURIComponent(
          selectedDate
        )}&price=${eventData.price || 0}`
      );
      setBookDialogOpen(false);
      setSelectedSeats([]);
    } catch (err: any) {
      alert(err.message || "Booking failed");
    } finally {
      setBookingInProgress(false);
    }
  };

  // Render seat grid with dynamic layout
  const renderSeats = () => {
    const totalSeats = eventData.ticketsAvailable || 50;
    const { rows, seatsPerRow } = calculateSeatLayout(totalSeats);
    const booked = eventData.bookedSeats?.[selectedDate] || [];
    let seatCount = 0;

    return rows.map(row => {
      const seatsInThisRow = Math.min(seatsPerRow, totalSeats - seatCount);
      const rowSeats = Array.from({ length: seatsInThisRow }, (_, i) => {
        seatCount++;
        const seat = `${row}${i + 1}`;
        const isBooked = booked.includes(seat);
        const isSelected = selectedSeats.includes(seat);

        return (
          <button
            key={seat}
            disabled={isBooked}
            onClick={() => toggleSeat(seat)}
            style={{
              width: 35,
              height: 35,
              background: isBooked ? "red" : isSelected ? "orange" : "green",
              color: "white",
              border: "none",
              borderRadius: 3,
              cursor: isBooked ? "not-allowed" : "pointer",
              fontSize: "0.75rem",
            }}
          >
            {seat}
          </button>
        );
      });

      return (
        <div key={row} style={{ display: "flex", gap: 5, marginBottom: 5, justifyContent: "center" }}>
          {rowSeats}
        </div>
      );
    });
  };

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "image" && files) setImageFile(files[0]);
    else if (name === "price" || name === "ticketsAvailable") {
      // Allow empty string or valid number
      setForm(prev => ({
        ...prev,
        [name]: value === "" ? "" : Number(value)
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Submit edit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    form.dates.forEach(d => formData.append("dates[]", d));
    formData.append("location", form.location);
    formData.append("price", form.price.toString());
    formData.append("ticketsAvailable", form.ticketsAvailable.toString());
    if (imageFile) formData.append("image", imageFile);

    await onEdit(event._id, formData);
    
    // Update local state immediately
    setEventData(prev => ({
      ...prev,
      title: form.title,
      description: form.description,
      dates: form.dates,
      location: form.location,
      price: typeof form.price === 'number' ? form.price : Number(form.price) || 0,
      ticketsAvailable: typeof form.ticketsAvailable === 'number' ? form.ticketsAvailable : Number(form.ticketsAvailable) || 0,
    }));
    
    setEditOpen(false);
  };

  return (
    <>
      <Card
        sx={{
          maxWidth: 345,
          border: "1px solid #6a11cb",
          borderRadius: 3,
          bgcolor: "#1e1e2f",
          color: "white",
          boxShadow: "0px 4px 15px rgba(106, 17, 203, 0.4)",
        }}
      >
        <Box 
          onClick={() => router.push(`/events/${event._id}/details`)} 
          sx={{ cursor: "pointer" }}
        >
          <CardMedia
            component="img"
            height="180"
            image={eventData.image ? (eventData.image.startsWith('http') ? eventData.image : `http://localhost:5000/uploads/${eventData.image}`) : "/default-image.jpg"}
            alt={eventData.title}
          />
        </Box>
        <CardContent>
          <Typography variant="h6" sx={{ color: "#ffb703", fontWeight: "bold" }}>
            {eventData.title}
          </Typography>
          <Typography variant="body2" sx={{ color: "#c9c9ff", mb: 1 }}>
            {eventData.description}
          </Typography>
          <Typography variant="body2" sx={{ color: "#e0e0e0", mb: 1 }}>
            {eventData.dates.map(d => dayjs(d).format("DD/MM/YYYY")).join(", ")}
          </Typography>
          {eventData.location && (
            <Typography variant="body2" sx={{ color: "#bbbbff" }}>
              {eventData.location}
            </Typography>
          )}
          {eventData.price !== undefined && (
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                color: "white",
                bgcolor: "#6a11cb",
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                fontSize: "0.85rem",
                display: "inline-block",
                mb: 1,
              }}
            >
              ₹{eventData.price}
            </Typography>
          )}

          {/* FIXED: Show ticketsAvailable per event, not sum of all dates */}
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <Typography
              variant="body2"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontWeight: "bold",
                color: (eventData.ticketsAvailable || 0) > 0 ? "#4caf50" : "#ff5252",
                bgcolor: (eventData.ticketsAvailable || 0) > 0 ? "rgba(76,175,80,0.1)" : "rgba(255,82,82,0.1)",
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                fontSize: "0.85rem",
              }}
            >
              <ConfirmationNumberIcon fontSize="small" /> {eventData.ticketsAvailable || 0} Tickets Available
            </Typography>
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: "space-between" }}>
          {role === "user" && (
            <Button
              variant="contained"
              sx={{ bgcolor: "#6a11cb", color: "white" }}
              onClick={() => setBookDialogOpen(true)}
            >
              Book Ticket
            </Button>
          )}
          {role === "admin" && (
            <>
              <Button
                variant="outlined"
                sx={{ borderColor: "#6a11cb", color: "#6a11cb" }}
                onClick={() => setEditOpen(true)}
              >
                Edit
              </Button>
              <Button variant="outlined" color="error" onClick={() => onDelete(event._id)}>
                Delete
              </Button>
            </>
          )}
        </CardActions>
      </Card>

      {/* Admin Drawer */}
      <Drawer anchor="right" open={editOpen} onClose={() => setEditOpen(false)}>
        <Box sx={{ width: 400, p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Edit Event
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Title" name="title" value={form.title} onChange={handleChange} sx={{ mb: 2 }} />
            <TextField fullWidth label="Description" name="description" value={form.description} onChange={handleChange} sx={{ mb: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ mb: 1 }}>Dates</Typography>
              <ClientDatePicker label="Select Date" value={newDate} onChange={setNewDate} />
              <Button
                variant="contained"
                onClick={() => {
                  if (newDate) {
                    const iso = newDate.toISOString();
                    if (!form.dates.includes(iso)) setForm(prev => ({ ...prev, dates: [...prev.dates, iso] }));
                    setNewDate(null);
                  }
                }}
                sx={{ mt: 1, mb: 1 }}
              >
                Add Date
              </Button>
              <Box>
                {form.dates.map(d => (
                  <Box key={d} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Typography>{dayjs(d).format("DD/MM/YYYY")}</Typography>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => setForm(prev => ({ ...prev, dates: prev.dates.filter(date => date !== d) }))}
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
              </Box>
            </Box>

            <TextField fullWidth label="Location" name="location" value={form.location} onChange={handleChange} sx={{ mb: 2 }} />
            
            {/* FIXED: Remove spinner from number inputs */}
            <TextField 
              fullWidth 
              label="Price" 
              type="number" 
              name="price" 
              value={form.price} 
              onChange={handleChange}
              placeholder="Enter price"
              inputProps={{ min: 0, step: "any" }}
              sx={{ 
                mb: 2,
                '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': {
                  WebkitAppearance: 'none',
                  margin: 0
                },
                '& input[type=number]': {
                  MozAppearance: 'textfield'
                }
              }} 
            />
            
            <TextField 
              fullWidth 
              label="Tickets Available" 
              type="number" 
              name="ticketsAvailable" 
              value={form.ticketsAvailable} 
              onChange={handleChange}
              placeholder="Enter ticket count"
              inputProps={{ min: 1 }}
              sx={{ 
                mb: 2,
                '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': {
                  WebkitAppearance: 'none',
                  margin: 0
                },
                '& input[type=number]': {
                  MozAppearance: 'textfield'
                }
              }} 
            />
            
            <TextField fullWidth type="file" name="image" onChange={handleChange} sx={{ mb: 2 }} />

            <Button variant="contained" type="submit" sx={{ mt: 1 }}>
              Save Changes
            </Button>
          </form>
        </Box>
      </Drawer>

      {/* Booking Dialog */}
      <Dialog open={bookDialogOpen} onClose={() => setBookDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Book Seats for {eventData.title}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Date</InputLabel>
            <Select
              value={selectedDate}
              label="Date"
              onChange={e => {
                setSelectedDate(e.target.value);
                setSelectedSeats([]);
              }}
            >
              {eventData.dates.map(d => (
                <MenuItem key={d} value={d}>
                  {dayjs(d).format("DD/MM/YYYY")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ mb: 2 }}>
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

          <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 2 }}>
            {renderSeats()}
          </Box>
          
          <Typography variant="body2" sx={{ mt: 2, fontWeight: "bold" }}>
            Selected: {selectedSeats.join(", ") || "None"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBooking} disabled={selectedSeats.length === 0 || bookingInProgress}>
            {bookingInProgress ? "Booking..." : `Book ${selectedSeats.length} Seat${selectedSeats.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
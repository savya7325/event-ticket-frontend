"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Drawer,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ConfirmDialog from "../components/ConfirmDialog";
import dayjs from "dayjs";
import EventForm from "./EventForm";
import { capacityOf, nextShowDate, seatsLeftOn } from "../components/seats";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Event {
  _id: string;
  title: string;
  description: string;
  dates: string[];
  location?: string;
  price?: number;
  capacity?: number;
  ticketsAvailable?: number;
  image?: string;
  seatsPerDate?: Record<string, number>;
  bookedSeats?: Record<string, string[]>;
}

interface Props {
  event: Event;
  role: "user" | "admin";
  // Resolves with the saved event (null if the update failed).
  onEdit: (id: string, data: FormData) => Promise<Event | null>;
  onDelete: (id: string) => Promise<void>;
  seatsPerDate?: Record<string, number>;
  bookedSeats?: Record<string, string[]>;
}

export default function EventCard({ event, role, onEdit, onDelete }: Props) {
  const router = useRouter();

  const [eventData, setEventData] = useState<Event>(event);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);


  const imageUrl = eventData.image
    ? eventData.image.startsWith("http")
      ? eventData.image
      : `${API_URL}${eventData.image}`
    : undefined;

  const [selectedDate, setSelectedDate] = useState(event.dates[0] || "");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  // const [bookingInProgress, setBookingInProgress] = useState(false);

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
    // const booked = eventData.bookedSeats?.[selectedDate] || [];
    const booked = eventData.bookedSeats?.[selectedDate.slice(0, 10)] || [];
    if (booked.includes(seat)) return;
    setSelectedSeats(prev =>
      prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
    );
  };

  // Booking handler
  const handleBooking = () => {
  if (!selectedDate || selectedSeats.length === 0) return;
  router.push(
    `/events/${event._id}/checkout?seats=${selectedSeats.join(",")}&date=${encodeURIComponent(
      selectedDate
    )}&price=${eventData.price || 0}`
  );
  setBookDialogOpen(false);
  setSelectedSeats([]);
};
  // Render seat grid with dynamic layout
  const renderSeats = () => {
    const totalSeats = capacityOf(eventData); // fixed hall size, never shrinks
    const { rows, seatsPerRow } = calculateSeatLayout(totalSeats);
    const booked = eventData.bookedSeats?.[selectedDate.slice(0, 10)] || [];
    // Split wide rows with a center aisle, like a real hall.
    const aisleAfter = seatsPerRow >= 6 ? Math.ceil(seatsPerRow / 2) : 0;
    let seatCount = 0;

    const rowLabelSx = {
      width: 20,
      textAlign: "center",
      fontSize: "0.7rem",
      fontWeight: 600,
      letterSpacing: 1,
      color: "rgba(196,181,253,0.55)",
    } as const;

    return rows.map(row => {
      const seatsInThisRow = Math.min(seatsPerRow, totalSeats - seatCount);
      const rowSeats = Array.from({ length: seatsInThisRow }, (_, i) => {
        seatCount++;
        const seat = `${row}${i + 1}`;
        const isBooked = booked.includes(seat);
        const isSelected = selectedSeats.includes(seat);

        return (
          <Box
            key={seat}
            component="button"
            type="button"
            disabled={isBooked}
            onClick={() => toggleSeat(seat)}
            aria-label={`Seat ${seat}${isBooked ? " (booked)" : ""}`}
            aria-pressed={isSelected}
            title={seat}
            sx={{
              width: 30,
              height: 28,
              mr: aisleAfter && i + 1 === aisleAfter ? 3 : 0,
              borderRadius: "9px 9px 5px 5px",
              fontSize: "0.65rem",
              fontWeight: 600,
              fontFamily: "inherit",
              p: 0,
              transition: "transform .15s ease, background .15s ease, box-shadow .15s ease",
              ...(isBooked
                ? {
                    bgcolor: "rgba(255,255,255,0.06)",
                    border: "1px solid transparent",
                    color: "rgba(255,255,255,0.18)",
                    cursor: "not-allowed",
                  }
                : isSelected
                ? {
                    background: "linear-gradient(180deg, #fcd34d, #f59e0b)",
                    border: "1px solid #fcd34d",
                    color: "#1a1325",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(245,158,11,0.45)",
                    transform: "translateY(-2px)",
                  }
                : {
                    bgcolor: "rgba(139,92,246,0.08)",
                    border: "1px solid rgba(167,139,250,0.45)",
                    color: "#c4b5fd",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "rgba(139,92,246,0.3)",
                      borderColor: "#a78bfa",
                      color: "#fff",
                      transform: "translateY(-2px)",
                    },
                  }),
              "&:focus-visible": { outline: "2px solid #fcd34d", outlineOffset: 2 },
            }}
          >
            {i + 1}
          </Box>
        );
      });

      return (
        <Box key={row} sx={{ display: "flex", alignItems: "center", gap: 0.75, justifyContent: "center" }}>
          <Box sx={rowLabelSx}>{row}</Box>
          <Box sx={{ display: "flex", gap: 0.75 }}>{rowSeats}</Box>
          <Box sx={rowLabelSx}>{row}</Box>
        </Box>
      );
    });
  };

  const seatsLeft = selectedDate ? seatsLeftOn(eventData, selectedDate) : capacityOf(eventData);
  // Card badge: seats left for the next upcoming show.
  const nextDate = nextShowDate(eventData);
  const nextLeft = nextDate ? seatsLeftOn(eventData, nextDate) : 0;
  const totalPrice = selectedSeats.length * (eventData.price || 0);


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
          {/* <CardMedia
            component="img"
            height="180"
            image={eventData.image ? (eventData.image.startsWith('http') ? eventData.image : `${API_URL}/uploads/${eventData.image}`) : "/default-image.jpg"}
            alt={eventData.title}
          /> */}
          <CardMedia
  component="img"
  height="180"

  image={imageUrl ?? "/default-image.jpg"}

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

          {/* Seats left for the next show date (each date has its own count) */}
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <Typography
              variant="body2"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontWeight: "bold",
                color: nextLeft > 0 ? "#4caf50" : "#ff5252",
                bgcolor: nextLeft > 0 ? "rgba(76,175,80,0.1)" : "rgba(255,82,82,0.1)",
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                fontSize: "0.85rem",
              }}
            >
              <ConfirmationNumberIcon fontSize="small" />{" "}
              {nextLeft > 0 ? `${nextLeft} of ${capacityOf(eventData)} seats left` : "Sold out"}
              {eventData.dates.length > 1 && nextDate ? ` · ${dayjs(nextDate).format("D MMM")}` : ""}
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
              <Button variant="outlined" color="error" onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            </>
          )}
        </CardActions>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this event?"
        message="It will be removed from the site and can't be booked any more. This can't be undone."
        details={[
          ["Event", eventData.title],
          ["Dates", eventData.dates.map(d => dayjs(d).format("D MMM YYYY")).join(", ") || "—"],
          ["Location", eventData.location || "—"],
        ]}
        confirmLabel="Delete event"
        cancelLabel="Keep event"
        onConfirm={async () => {
          await onDelete(event._id);
          setConfirmDelete(false);
        }}
        onClose={() => setConfirmDelete(false)}
      />

      {/* Admin edit drawer: same dark form as "Add event" */}
      <Drawer
        anchor="right"
        open={editOpen}
        onClose={() => setEditOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "100%", sm: 500 },
              bgcolor: "#120e1a",
              backgroundImage: "none",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "-30px 0 80px rgba(0,0,0,0.5)",
            },
          },
          backdrop: { sx: { bgcolor: "rgba(5,3,10,0.6)", backdropFilter: "blur(4px)" } },
        }}
      >
        <EventForm
          compact
          mode="edit"
          initial={{
            title: eventData.title,
            description: eventData.description,
            dates: eventData.dates,
            location: eventData.location,
            price: eventData.price,
            ticketsAvailable: capacityOf(eventData), // edit form works in seats per show
            imageUrl: imageUrl,
          }}
          onClose={() => setEditOpen(false)}
          onSave={async data => {
            const updated = await onEdit(event._id, data);
            // Use what the server saved (incl. the new image URL) so the card updates without a refresh.
            if (updated) setEventData(updated);
            return !!updated;
          }}
          onSuccess={() => setEditOpen(false)}
        />
      </Drawer>

      {/* Booking Dialog */}
      <Dialog
        open={bookDialogOpen}
        onClose={() => setBookDialogOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            bgcolor: "#130f1c",
            backgroundImage: "radial-gradient(ellipse at top, rgba(124,58,237,0.18), transparent 60%)",
            color: "#fff",
            borderRadius: 4,
            border: "1px solid rgba(167,139,250,0.18)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3, px: { xs: 2.5, sm: 4 } }}>
          <Typography sx={{ fontSize: "0.7rem", letterSpacing: 3, color: "#a78bfa", fontWeight: 600 }}>
            SELECT YOUR SEATS
          </Typography>
          <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, mt: 0.5 }}>{eventData.title}</Typography>
          {eventData.location && (
            <Typography sx={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", mt: 0.25 }}>
              {eventData.location}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 2.5, sm: 4 } }}>
          {/* Date picker as pills */}
          <Box sx={{ display: "flex", gap: 1.25, overflowX: "auto", py: 1.5, mb: 1 }}>
            {eventData.dates.map(d => {
              const active = d === selectedDate;
              return (
                <Box
                  key={d}
                  component="button"
                  type="button"
                  onClick={() => {
                    setSelectedDate(d);
                    setSelectedSeats([]);
                  }}
                  sx={{
                    flexShrink: 0,
                    minWidth: 64,
                    px: 1.5,
                    py: 1,
                    borderRadius: 3,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "center",
                    transition: "all .15s ease",
                    border: active ? "1px solid #a78bfa" : "1px solid rgba(255,255,255,0.1)",
                    background: active ? "linear-gradient(160deg, #7c3aed, #5b21b6)" : "rgba(255,255,255,0.03)",
                    color: active ? "#fff" : "rgba(255,255,255,0.7)",
                    boxShadow: active ? "0 6px 20px rgba(124,58,237,0.4)" : "none",
                    "&:hover": { borderColor: "#a78bfa" },
                  }}
                >
                  <Box sx={{ fontSize: "0.65rem", letterSpacing: 1.5, opacity: 0.8 }}>
                    {dayjs(d).format("ddd").toUpperCase()}
                  </Box>
                  <Box sx={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.3 }}>{dayjs(d).format("DD")}</Box>
                  <Box sx={{ fontSize: "0.65rem", opacity: 0.8 }}>{dayjs(d).format("MMM YYYY")}</Box>
                </Box>
              );
            })}
          </Box>

          {/* Seat map */}
          <Box
            sx={{
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,0.06)",
              bgcolor: "rgba(0,0,0,0.25)",
              px: 2,
              pt: 3,
              pb: 2.5,
              overflowX: "auto",
            }}
          >
            {/* Stage / screen */}
            <Box sx={{ maxWidth: 420, mx: "auto", mb: 4, textAlign: "center" }}>
              <Box
                sx={{
                  height: 18,
                  borderTop: "3px solid #a78bfa",
                  borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
                  boxShadow: "0 -10px 30px -6px rgba(167,139,250,0.55)",
                }}
              />
              <Typography sx={{ fontSize: "0.65rem", letterSpacing: 6, color: "rgba(196,181,253,0.6)" }}>
                STAGE
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.9, width: "max-content", mx: "auto" }}>
              {renderSeats()}
            </Box>

            {/* Legend */}
            <Box sx={{ display: "flex", gap: 3, justifyContent: "center", mt: 3, flexWrap: "wrap" }}>
              {[
                { label: "Available", sx: { bgcolor: "rgba(139,92,246,0.08)", border: "1px solid rgba(167,139,250,0.45)" } },
                { label: "Selected", sx: { background: "linear-gradient(180deg, #fcd34d, #f59e0b)" } },
                { label: "Booked", sx: { bgcolor: "rgba(255,255,255,0.06)" } },
              ].map(item => (
                <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 16, height: 14, borderRadius: "5px 5px 3px 3px", ...item.sx }} />
                  <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>{item.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", mt: 1.5, textAlign: "center" }}>
            {seatsLeft} seats left for {dayjs(selectedDate).format("DD MMM YYYY")}
          </Typography>
        </DialogContent>

        {/* Summary bar */}
        <DialogActions
          sx={{
            px: { xs: 2.5, sm: 4 },
            py: 2.5,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            bgcolor: "rgba(0,0,0,0.25)",
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ minWidth: 0, flex: "1 1 240px" }}>
            <Typography sx={{ fontSize: "0.7rem", letterSpacing: 2, color: "rgba(255,255,255,0.5)" }}>
              {selectedSeats.length ? `${selectedSeats.length} SEAT${selectedSeats.length > 1 ? "S" : ""} SELECTED` : "NO SEATS SELECTED"}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 0.75, minHeight: 24 }}>
              {selectedSeats.length === 0 ? (
                <Typography sx={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.35)" }}>
                  Tap a seat to select it
                </Typography>
              ) : (
                selectedSeats.map(s => (
                  <Box
                    key={s}
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 1.5,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#fcd34d",
                      border: "1px solid rgba(252,211,77,0.4)",
                      bgcolor: "rgba(252,211,77,0.08)",
                    }}
                  >
                    {s}
                  </Box>
                ))
              )}
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: "auto" }}>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: "0.7rem", letterSpacing: 2, color: "rgba(255,255,255,0.5)" }}>TOTAL</Typography>
              <Typography sx={{ fontSize: "1.35rem", fontWeight: 700 }}>₹{totalPrice.toLocaleString("en-IN")}</Typography>
            </Box>
            <Button onClick={() => setBookDialogOpen(false)} sx={{ color: "rgba(255,255,255,0.6)", textTransform: "none" }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleBooking}
              disabled={selectedSeats.length === 0}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                px: 3,
                py: 1.25,
                borderRadius: 2.5,
                background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                boxShadow: "0 8px 24px rgba(124,58,237,0.45)",
                "&:hover": { background: "linear-gradient(135deg, #a78bfa, #7c3aed)" },
                "&.Mui-disabled": { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", boxShadow: "none" },
              }}
            >
              Proceed to Checkout
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
}
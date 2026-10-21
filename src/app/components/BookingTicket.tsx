"use client";

import Link from "next/link";
import { Box, Typography } from "@mui/material";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Booking, bookingTotal, eventImageUrl, formatINR, isUpcoming, relativeDay } from "./userApi";
import { cardSx, ui } from "./theme";

const fullDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

// Ticket-style card: event info on the left, perforated stub with seats and price on the right.
export default function BookingTicket({ booking }: { booking: Booking }) {
  const upcoming = isUpcoming(booking);
  const event = booking.event;
  const image = eventImageUrl(event?.image);

  return (
    <Box
      sx={{
        ...cardSx,
        overflow: "hidden",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        transition: "transform .2s ease, border-color .2s ease",
        opacity: upcoming ? 1 : 0.78,
        "&:hover": { transform: "translateY(-3px)", borderColor: "rgba(167,139,250,0.35)" },
      }}
    >
      {/* Poster */}
      <Box
        sx={{
          width: { xs: "100%", sm: 150 },
          height: { xs: 140, sm: "auto" },
          flexShrink: 0,
          backgroundColor: "#1d1629",
          backgroundImage: image ? `url('${image}')` : "linear-gradient(135deg, #4c1d95, #1e1b4b)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: upcoming ? "none" : "grayscale(0.6)",
        }}
      />

      {/* Details */}
      <Box sx={{ flex: 1, p: 2.5, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Box
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 1.5,
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: 0.5,
              color: upcoming ? ui.success : ui.faint,
              bgcolor: upcoming ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.06)",
            }}
          >
            {upcoming ? "UPCOMING" : "ATTENDED"}
          </Box>
          <Typography sx={{ fontSize: "0.75rem", color: ui.faint }}>{relativeDay(booking.date)}</Typography>
        </Box>

        <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mb: 1.25 }} noWrap>
          {event?.title ?? "Event no longer available"}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, color: ui.muted, fontSize: "0.85rem" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarMonthRoundedIcon sx={{ fontSize: 17, color: ui.accentSoft }} />
            {fullDate(booking.date)}
          </Box>
          {event?.location && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PlaceRoundedIcon sx={{ fontSize: 17, color: ui.accentSoft }} />
              {event.location}
            </Box>
          )}
        </Box>

        {event && (
          <Box
            component={Link}
            href={`/events/${event._id}/details`}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              mt: 1.75,
              fontSize: "0.82rem",
              fontWeight: 600,
              color: ui.accentSoft,
              textDecoration: "none",
              "&:hover": { color: "#fff" },
            }}
          >
            Event details <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
        )}
      </Box>

      {/* Stub */}
      <Box
        sx={{
          position: "relative",
          width: { xs: "100%", sm: 190 },
          flexShrink: 0,
          p: 2.5,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 2,
          bgcolor: "rgba(139,92,246,0.06)",
          borderLeft: { sm: `2px dashed ${ui.border}` },
          borderTop: { xs: `2px dashed ${ui.border}`, sm: "none" },
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "0.68rem", letterSpacing: 1.5, color: ui.faint, mb: 0.75 }}>
            {booking.seats.length} SEAT{booking.seats.length !== 1 ? "S" : ""}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {booking.seats.map(s => (
              <Box
                key={s}
                sx={{
                  px: 0.9,
                  py: 0.2,
                  borderRadius: 1.25,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: ui.gold,
                  border: "1px solid rgba(252,211,77,0.35)",
                  bgcolor: "rgba(252,211,77,0.08)",
                }}
              >
                {s}
              </Box>
            ))}
          </Box>
        </Box>
        <Box>
          <Typography sx={{ fontSize: "0.68rem", letterSpacing: 1.5, color: ui.faint }}>PAID</Typography>
          <Typography sx={{ fontSize: "1.3rem", fontWeight: 800 }}>{formatINR(bookingTotal(booking))}</Typography>
          <Typography sx={{ fontSize: "0.68rem", color: ui.faint, fontFamily: "monospace" }}>
            #{booking._id.slice(-8).toUpperCase()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

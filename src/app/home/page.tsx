"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Button, Typography } from "@mui/material";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import EventSeatRoundedIcon from "@mui/icons-material/EventSeatRounded";
import CurrencyRupeeRoundedIcon from "@mui/icons-material/CurrencyRupeeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import UserShell from "../components/UserShell";
import { useAuth } from "../context/AuthContext";
import { useMyBookings } from "../components/useMyBookings";
import { CardSkeleton, EmptyState, ErrorState, StatCard } from "../components/ui";
import {
  BookingEvent,
  bookingTotal,
  eventImageUrl,
  formatINR,
  getEvents,
  isUpcoming,
  relativeDay,
} from "../components/userApi";
import { cardSx, eyebrowSx, ghostButtonSx, primaryButtonSx, ui } from "../components/theme";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

const shortDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

// First upcoming date of an event, or null if all its dates have passed.
const nextDateOf = (ev: BookingEvent) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (ev.dates || []).map(d => new Date(d)).filter(d => d >= today).sort((a, b) => +a - +b)[0] ?? null;
};

function HomeDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { bookings, loading, error, reload } = useMyBookings();
  const [events, setEvents] = useState<BookingEvent[] | null>(null);

  useEffect(() => {
    getEvents().then(setEvents).catch(() => setEvents([]));
  }, []);

  const upcoming = useMemo(() => bookings.filter(isUpcoming).reverse(), [bookings]); // soonest first
  const nextBooking = upcoming[0];
  const totalSeats = bookings.reduce((n, b) => n + b.seats.length, 0);
  const totalSpent = bookings.reduce((n, b) => n + bookingTotal(b), 0);

  const discover = useMemo(
    () =>
      (events || [])
        .map(ev => ({ ev, next: nextDateOf(ev) }))
        .filter(x => x.next)
        .sort((a, b) => +a.next! - +b.next!)
        .slice(0, 4),
    [events]
  );

  const firstName = (user?.username || "").split(/[\s_]+/)[0];

  return (
    <>
      {/* Hero */}
      <Box
        sx={{
          ...cardSx,
          position: "relative",
          overflow: "hidden",
          p: { xs: 3, md: 5 },
          mb: 3,
          background:
            "radial-gradient(600px 300px at 90% 10%, rgba(139,92,246,0.35), transparent 70%), linear-gradient(135deg, rgba(76,29,149,0.45), rgba(30,27,75,0.25))",
        }}
      >
        <Typography sx={eyebrowSx}>{greeting()}</Typography>
        <Typography component="h1" sx={{ fontSize: { xs: "1.9rem", md: "2.6rem" }, fontWeight: 800, mt: 0.5, lineHeight: 1.15 }}>
          Welcome back, {firstName} 👋
        </Typography>
        <Typography sx={{ color: ui.muted, mt: 1.25, maxWidth: 520 }}>
          {nextBooking
            ? `Your next event, ${nextBooking.event?.title ?? "an event"}, is ${relativeDay(nextBooking.date).toLowerCase()}.`
            : "Find something worth going out for. New events are added every week."}
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, mt: 3, flexWrap: "wrap" }}>
          <Button onClick={() => router.push("/events")} sx={primaryButtonSx}>
            Browse events
          </Button>
          <Button onClick={() => router.push("/mybookings")} sx={ghostButtonSx}>
            My tickets
          </Button>
        </Box>
      </Box>

      {error && (
        <Box sx={{ mb: 3 }}>
          <ErrorState message={error} onRetry={reload} />
        </Box>
      )}

      {/* Stats */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr) minmax(0,1fr)", md: "repeat(4, minmax(0,1fr))" }, gap: 2, mb: 4 }}>
        {loading ? (
          Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} height={92} />)
        ) : (
          <>
            <StatCard label="Upcoming" value={upcoming.length} icon={<EventAvailableRoundedIcon />} hint="events ahead" />
            <StatCard label="Bookings" value={bookings.length} icon={<ConfirmationNumberRoundedIcon />} hint="all time" />
            <StatCard label="Seats" value={totalSeats} icon={<EventSeatRoundedIcon />} hint="tickets booked" />
            <StatCard label="Spent" value={formatINR(totalSpent)} icon={<CurrencyRupeeRoundedIcon />} hint="all time" />
          </>
        )}
      </Box>

      {/* Next event + recent activity */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", md: "minmax(0,1.4fr) minmax(0,1fr)" }, gap: 3, mb: 5 }}>
        <Box>
          <SectionTitle title="Your next event" />
          {loading ? (
            <CardSkeleton height={260} />
          ) : nextBooking ? (
            <Box sx={{ ...cardSx, overflow: "hidden" }}>
              <Box
                sx={{
                  height: 150,
                  backgroundColor: "#1d1629",
                  backgroundImage: eventImageUrl(nextBooking.event?.image)
                    ? `linear-gradient(to top, rgba(13,10,20,0.95), transparent 70%), url('${eventImageUrl(nextBooking.event?.image)}')`
                    : "linear-gradient(135deg, #4c1d95, #1e1b4b)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "flex-end",
                  p: 2.5,
                }}
              >
                <Box sx={{ px: 1.25, py: 0.5, borderRadius: 2, bgcolor: ui.gold, color: "#1a1325", fontWeight: 800, fontSize: "0.75rem" }}>
                  {relativeDay(nextBooking.date).toUpperCase()}
                </Box>
              </Box>
              <Box sx={{ p: 2.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: "1.3rem" }}>{nextBooking.event?.title}</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5, mt: 1.25, color: ui.muted, fontSize: "0.88rem" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: ui.accentSoft }} />
                    {new Date(nextBooking.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                  </Box>
                  {nextBooking.event?.location && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <PlaceRoundedIcon sx={{ fontSize: 18, color: ui.accentSoft }} />
                      {nextBooking.event.location}
                    </Box>
                  )}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mt: 2.5 }}>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {nextBooking.seats.map(s => (
                      <Box key={s} sx={{ px: 1, py: 0.25, borderRadius: 1.5, fontSize: "0.78rem", fontWeight: 700, color: ui.gold, border: "1px solid rgba(252,211,77,0.35)" }}>
                        {s}
                      </Box>
                    ))}
                  </Box>
                  <Button onClick={() => router.push("/mybookings")} endIcon={<ArrowForwardRoundedIcon />} sx={ghostButtonSx}>
                    View ticket
                  </Button>
                </Box>
              </Box>
            </Box>
          ) : (
            <EmptyState
              icon={<EventAvailableRoundedIcon />}
              title="Nothing booked yet"
              text="When you book an event, your next one will show up here with your seats."
              action={<Button onClick={() => router.push("/events")} sx={primaryButtonSx}>Find an event</Button>}
            />
          )}
        </Box>

        <Box>
          <SectionTitle title="Recent bookings" href="/mybookings" />
          <Box sx={{ ...cardSx, p: 1 }}>
            {loading ? (
              <Box sx={{ p: 1.5, display: "grid", gap: 1.5 }}>
                {Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} height={52} />)}
              </Box>
            ) : bookings.length === 0 ? (
              <Typography sx={{ color: ui.faint, p: 2.5, fontSize: "0.9rem" }}>Your booking history will appear here.</Typography>
            ) : (
              bookings.slice(0, 5).map(b => (
                <Box
                  key={b._id}
                  sx={{ display: "flex", alignItems: "center", gap: 1.75, p: 1.5, borderRadius: 2.5, "&:hover": { bgcolor: ui.surfaceHover } }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      flexShrink: 0,
                      borderRadius: 2.5,
                      display: "grid",
                      placeItems: "center",
                      textAlign: "center",
                      lineHeight: 1.05,
                      bgcolor: isUpcoming(b) ? "rgba(139,92,246,0.16)" : "rgba(255,255,255,0.05)",
                      color: isUpcoming(b) ? ui.accentSoft : ui.faint,
                    }}
                  >
                    <Box>
                      <Box sx={{ fontWeight: 800, fontSize: "0.95rem" }}>{new Date(b.date).getDate()}</Box>
                      <Box sx={{ fontSize: "0.6rem", letterSpacing: 1 }}>
                        {new Date(b.date).toLocaleDateString("en-IN", { month: "short" }).toUpperCase()}
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }} noWrap>
                      {b.event?.title ?? "Event removed"}
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: ui.faint }} noWrap>
                      {b.seats.join(", ")} · {relativeDay(b.date)}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>{formatINR(bookingTotal(b))}</Typography>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Box>

      {/* Discover */}
      <SectionTitle title="Happening soon" href="/events" />
      {events === null ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "minmax(0,1fr) minmax(0,1fr)", md: "repeat(4, minmax(0,1fr))" }, gap: 2 }}>
          {Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} height={240} />)}
        </Box>
      ) : discover.length === 0 ? (
        <Typography sx={{ color: ui.faint }}>No upcoming events right now. Check back soon.</Typography>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "minmax(0,1fr) minmax(0,1fr)", md: "repeat(4, minmax(0,1fr))" }, gap: 2 }}>
          {discover.map(({ ev, next }) => (
            <Box
              key={ev._id}
              component={Link}
              href={`/events/${ev._id}/details`}
              sx={{
                ...cardSx,
                overflow: "hidden",
                textDecoration: "none",
                color: "inherit",
                transition: "transform .2s ease, border-color .2s ease",
                "&:hover": { transform: "translateY(-4px)", borderColor: "rgba(167,139,250,0.4)" },
              }}
            >
              <Box
                sx={{
                  height: 140,
                  backgroundColor: "#1d1629",
                  backgroundImage: eventImageUrl(ev.image) ? `url('${eventImageUrl(ev.image)}')` : "linear-gradient(135deg, #4c1d95, #1e1b4b)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: ui.accentSoft, letterSpacing: 1 }}>
                  {shortDate(next!.toISOString()).toUpperCase()}
                  {ev.location ? ` · ${ev.location.toUpperCase()}` : ""}
                </Typography>
                <Typography sx={{ fontWeight: 700, mt: 0.5 }} noWrap>
                  {ev.title}
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", color: ui.muted, mt: 0.5 }}>
                  {ev.price ? `From ${formatINR(ev.price)}` : "Free entry"}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </>
  );
}

function SectionTitle({ title, href }: { title: string; href?: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.75 }}>
      <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>{title}</Typography>
      {href && (
        <Box
          component={Link}
          href={href}
          sx={{ fontSize: "0.85rem", fontWeight: 600, color: ui.accentSoft, textDecoration: "none", "&:hover": { color: "#fff" } }}
        >
          View all
        </Box>
      )}
    </Box>
  );
}

export default function HomePage() {
  return (
    <UserShell>
      <HomeDashboard />
    </UserShell>
  );
}

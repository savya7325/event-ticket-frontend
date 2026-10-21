"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, ButtonBase, Typography } from "@mui/material";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import UserShell from "../components/UserShell";
import BookingTicket from "../components/BookingTicket";
import { useMyBookings } from "../components/useMyBookings";
import { CardSkeleton, EmptyState, ErrorState, PageHeader } from "../components/ui";
import { bookingTotal, formatINR, isUpcoming } from "../components/userApi";
import { primaryButtonSx, ui } from "../components/theme";

type Tab = "upcoming" | "past" | "all";

function BookingHistory() {
  const router = useRouter();
  const { bookings, loading, error, reload } = useMyBookings();
  const [tab, setTab] = useState<Tab>("upcoming");

  const groups = useMemo(() => {
    const upcoming = bookings.filter(isUpcoming).reverse(); // soonest first
    const past = bookings.filter(b => !isUpcoming(b)); // most recent first
    return { upcoming, past, all: [...upcoming, ...past] };
  }, [bookings]);

  const shown = groups[tab];
  const totalSpent = bookings.reduce((n, b) => n + bookingTotal(b), 0);

  const tabs: { key: Tab; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "all", label: "All" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Booking history"
        title="My Bookings"
        subtitle={
          loading
            ? "Loading your tickets…"
            : bookings.length
            ? `${bookings.length} booking${bookings.length !== 1 ? "s" : ""} · ${formatINR(totalSpent)} spent`
            : "All your tickets in one place."
        }
        action={
          <Button onClick={() => router.push("/events")} sx={primaryButtonSx}>
            Book more events
          </Button>
        }
      />

      {/* Tabs */}
      <Box
        role="tablist"
        sx={{
          display: "inline-flex",
          p: 0.5,
          mb: 3,
          borderRadius: 3,
          bgcolor: ui.surface,
          border: `1px solid ${ui.border}`,
        }}
      >
        {tabs.map(t => {
          const active = tab === t.key;
          return (
            <ButtonBase
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              sx={{
                px: 2,
                py: 0.9,
                gap: 1,
                borderRadius: 2.5,
                fontSize: "0.88rem",
                fontWeight: 600,
                color: active ? "#fff" : ui.muted,
                background: active ? ui.gradient : "transparent",
                transition: "all .15s ease",
              }}
            >
              {t.label}
              <Box
                component="span"
                sx={{
                  minWidth: 20,
                  px: 0.6,
                  borderRadius: 99,
                  fontSize: "0.7rem",
                  bgcolor: active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)",
                }}
              >
                {loading ? "–" : groups[t.key].length}
              </Box>
            </ButtonBase>
          );
        })}
      </Box>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <Box sx={{ display: "grid", gap: 2 }}>
          {Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} height={170} />)}
        </Box>
      ) : shown.length === 0 ? (
        <EmptyState
          icon={tab === "past" ? <HistoryRoundedIcon /> : <ConfirmationNumberRoundedIcon />}
          title={tab === "past" ? "No past events yet" : tab === "upcoming" ? "No upcoming bookings" : "No bookings yet"}
          text={
            tab === "past"
              ? "Events you've attended will be listed here."
              : "Pick an event, choose your seats and your tickets will show up here."
          }
          action={
            tab !== "past" && (
              <Button onClick={() => router.push("/events")} sx={primaryButtonSx}>
                Browse events
              </Button>
            )
          }
        />
      ) : (
        <Box sx={{ display: "grid", gap: 2 }}>
          {shown.map(b => (
            <BookingTicket key={b._id} booking={b} />
          ))}
        </Box>
      )}
    </>
  );
}

export default function MyBookingsPage() {
  return (
    <UserShell>
      <BookingHistory />
    </UserShell>
  );
}

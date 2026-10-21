"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Dialog,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import EventSeatRoundedIcon from "@mui/icons-material/EventSeatRounded";
import CurrencyRupeeRoundedIcon from "@mui/icons-material/CurrencyRupeeRounded";
import UpcomingRoundedIcon from "@mui/icons-material/UpcomingRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import UserShell, { useExpireSession } from "../../components/UserShell";
import { initialsOf } from "../../components/UserNavbar";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ToastProvider";
import { CardSkeleton, EmptyState, ErrorState, PageHeader, StatCard } from "../../components/ui";
import { AuthError, formatINR, relativeDay } from "../../components/userApi";
import { ghostButtonSx, ui } from "../../components/theme";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 10;

interface Booking {
  _id: string;
  event: { _id: string; title: string } | null;
  user: { _id: string; username: string; email: string } | null;
  date: string;
  seats: string[];
  totalPrice?: number;
  createdAt?: string;
}

type Status = "all" | "upcoming" | "past";
type Sort = "newest" | "showDate" | "amount";

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const isUpcoming = (b: Booking) => new Date(b.date) >= startOfToday();
const showDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const shortId = (id: string) => `#${id.slice(-8).toUpperCase()}`;

// Shared grid so header and rows line up on desktop; rows stack into cards on small screens.
const ROW_GRID = { md: "minmax(0,1.6fr) minmax(0,1.5fr) minmax(0,1.1fr) minmax(0,1fr) 110px 110px" };

function BookingsLedger() {
  const { user } = useAuth();
  const toast = useToast();
  const expireSession = useExpireSession();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [shown, setShown] = useState(PAGE_SIZE);
  const [toCancel, setToCancel] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/bookings`, { headers: { Authorization: `Bearer ${user.token}` } });
      if (res.status === 401) throw new AuthError();
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Could not load bookings.");
      setBookings(await res.json());
    } catch (err) {
      if (err instanceof AuthError) return expireSession();
      setError(err instanceof Error ? err.message : "Could not load bookings.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => setShown(PAGE_SIZE), [query, status, sort]);

  const all = useMemo(() => bookings ?? [], [bookings]);
  const counts = useMemo(
    () => ({ all: all.length, upcoming: all.filter(isUpcoming).length, past: all.filter(b => !isUpcoming(b)).length }),
    [all]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = all.filter(b => {
      if (status === "upcoming" && !isUpcoming(b)) return false;
      if (status === "past" && isUpcoming(b)) return false;
      if (!q) return true;
      return [b._id, b.event?.title, b.user?.username, b.user?.email, ...b.seats].some(v => v?.toLowerCase().includes(q));
    });
    const by: Record<Sort, (a: Booking, b: Booking) => number> = {
      newest: (a, b) => +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0),
      showDate: (a, b) => +new Date(a.date) - +new Date(b.date),
      amount: (a, b) => (b.totalPrice ?? 0) - (a.totalPrice ?? 0),
    };
    return [...list].sort(by[sort]);
  }, [all, query, status, sort]);

  const totals = useMemo(
    () => ({
      seats: all.reduce((n, b) => n + b.seats.length, 0),
      revenue: all.reduce((n, b) => n + (b.totalPrice ?? 0), 0),
    }),
    [all]
  );

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.info("Booking ID copied", id);
    } catch {
      toast.error("Couldn't copy", "Your browser blocked clipboard access.");
    }
  };

  const confirmCancel = async () => {
    if (!toCancel || !user) return;
    setCancelling(true);
    try {
      const res = await fetch(`${API_URL}/api/bookings/${toCancel._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.status === 401) throw new AuthError();
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Please try again.");
      setBookings(prev => (prev ?? []).filter(b => b._id !== toCancel._id));
      toast.success("Booking cancelled", `Seats ${toCancel.seats.join(", ")} are open again for ${toCancel.event?.title ?? "this event"}.`);
      setToCancel(null);
    } catch (err) {
      if (err instanceof AuthError) return expireSession();
      toast.error("Couldn't cancel booking", err instanceof Error ? err.message : undefined);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Box office"
        title="Bookings"
        subtitle="Every ticket sold, who holds it, and when the show is."
      />

      {/* Summary */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr) minmax(0,1fr)", md: "repeat(4, minmax(0,1fr))" }, gap: 2, mb: 3 }}>
        {!bookings ? (
          Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} height={92} />)
        ) : (
          <>
            <StatCard label="Bookings" value={counts.all} icon={<ConfirmationNumberRoundedIcon />} />
            <StatCard label="Upcoming" value={counts.upcoming} icon={<UpcomingRoundedIcon />} />
            <StatCard label="Seats sold" value={totals.seats} icon={<EventSeatRoundedIcon />} />
            <StatCard label="Revenue" value={formatINR(totals.revenue)} icon={<CurrencyRupeeRoundedIcon />} />
          </>
        )}
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            flex: "1 1 280px",
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.75,
            height: 44,
            borderRadius: 99,
            bgcolor: ui.surface,
            border: `1px solid ${ui.border}`,
            "&:focus-within": { borderColor: ui.accent, boxShadow: "0 0 0 3px rgba(139,92,246,0.18)" },
          }}
        >
          <SearchRoundedIcon sx={{ color: ui.faint, fontSize: 20 }} />
          <InputBase
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by event, guest, email, seat or booking ID"
            inputProps={{ "aria-label": "Search bookings" }}
            sx={{ flex: 1, color: ui.text, fontSize: "0.9rem" }}
          />
          {query && (
            <IconButton size="small" aria-label="Clear search" onClick={() => setQuery("")} sx={{ color: ui.faint }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Box role="tablist" sx={{ display: "inline-flex", p: 0.5, borderRadius: 99, bgcolor: ui.surface, border: `1px solid ${ui.border}` }}>
          {(["all", "upcoming", "past"] as Status[]).map(s => (
            <ButtonBase
              key={s}
              role="tab"
              aria-selected={status === s}
              onClick={() => setStatus(s)}
              sx={{
                gap: 0.75,
                px: 1.75,
                py: 0.85,
                borderRadius: 99,
                fontSize: "0.85rem",
                fontWeight: 600,
                textTransform: "capitalize",
                color: status === s ? "#fff" : ui.muted,
                background: status === s ? ui.gradient : "transparent",
              }}
            >
              {s}
              <Box component="span" sx={{ px: 0.7, borderRadius: 99, fontSize: "0.7rem", bgcolor: status === s ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)" }}>
                {bookings ? counts[s] : "–"}
              </Box>
            </ButtonBase>
          ))}
        </Box>

        <Select
          value={sort}
          onChange={e => setSort(e.target.value as Sort)}
          size="small"
          aria-label="Sort bookings"
          MenuProps={{ slotProps: { paper: { sx: { bgcolor: "#17121f", color: ui.text, border: `1px solid ${ui.border}`, borderRadius: 2.5, mt: 0.5 } } } }}
          sx={{
            height: 44,
            minWidth: 180,
            borderRadius: 99,
            color: ui.text,
            fontSize: "0.88rem",
            bgcolor: ui.surface,
            "& fieldset": { borderColor: ui.border },
            "&:hover fieldset": { borderColor: "rgba(167,139,250,0.5) !important" },
            "&.Mui-focused fieldset": { borderColor: `${ui.accent} !important` },
            "& .MuiSelect-icon": { color: ui.faint },
          }}
        >
          <MenuItem value="newest">Newest first</MenuItem>
          <MenuItem value="showDate">Show date (soonest)</MenuItem>
          <MenuItem value="amount">Amount (highest)</MenuItem>
        </Select>
      </Box>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !bookings ? (
        <Box sx={{ display: "grid", gap: 1.25 }}>{Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} height={84} />)}</Box>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<EventBusyRoundedIcon />}
          title={query ? "No matching bookings" : status === "upcoming" ? "No upcoming bookings" : status === "past" ? "No past bookings" : "No bookings yet"}
          text={query ? `Nothing matches "${query}". Try an event name, email or seat like F4.` : "When guests book tickets, they'll show up here."}
          action={query ? <Button onClick={() => setQuery("")} sx={ghostButtonSx}>Clear search</Button> : undefined}
        />
      ) : (
        <>
          {/* Column header (desktop) */}
          <Box
            sx={{
              display: { xs: "none", md: "grid" },
              gridTemplateColumns: ROW_GRID.md,
              gap: 2,
              px: 2.5,
              pb: 1,
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: ui.faint,
            }}
          >
            <span>Event</span>
            <span>Guest</span>
            <span>Show date</span>
            <span>Seats</span>
            <Box component="span" sx={{ textAlign: "right" }}>Amount</Box>
            <span />
          </Box>

          <Box sx={{ display: "grid", gap: 1.25 }}>
            {filtered.slice(0, shown).map(b => {
              const upcoming = isUpcoming(b);
              return (
                <Box
                  key={b._id}
                  sx={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: { xs: "minmax(0,1fr) minmax(0,1fr)", md: ROW_GRID.md },
                    gap: { xs: 1.5, md: 2 },
                    alignItems: "center",
                    p: { xs: 2, md: 2.5 },
                    pl: { xs: 2.5, md: 3 },
                    borderRadius: 3.5,
                    bgcolor: ui.surface,
                    border: `1px solid ${ui.border}`,
                    overflow: "hidden",
                    transition: "border-color .15s ease, background .15s ease",
                    "&:hover": { bgcolor: ui.surfaceHover, borderColor: "rgba(167,139,250,0.3)" },
                    // status edge, like a ticket's colour band
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      background: upcoming ? "linear-gradient(180deg, #d55181, #8b5cf6)" : "rgba(255,255,255,0.12)",
                    },
                  }}
                >
                  {/* Event + ID */}
                  <Box sx={{ minWidth: 0, gridColumn: { xs: "1 / -1", md: "auto" } }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.98rem" }} noWrap>
                      {b.event?.title ?? <Box component="span" sx={{ color: ui.faint, fontStyle: "italic" }}>Event removed</Box>}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                      <Typography sx={{ fontSize: "0.75rem", color: ui.faint, fontFamily: "monospace" }}>{shortId(b._id)}</Typography>
                      <Tooltip title="Copy full booking ID">
                        <IconButton size="small" aria-label="Copy booking ID" onClick={() => copyId(b._id)} sx={{ color: ui.faint, p: 0.4, "&:hover": { color: ui.accentSoft } }}>
                          <ContentCopyRoundedIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Guest */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, gridColumn: { xs: "1 / -1", md: "auto" } }}>
                    <Avatar sx={{ width: 34, height: 34, fontSize: "0.78rem", fontWeight: 700, background: b.user ? ui.gradient : "rgba(255,255,255,0.08)", color: b.user ? "#fff" : ui.faint }}>
                      {b.user ? initialsOf(b.user.username) : "?"}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: "0.88rem", fontWeight: 600, color: b.user ? ui.text : ui.faint }} noWrap>
                        {b.user?.username ?? "Deleted account"}
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: ui.faint }} noWrap>
                        {b.user?.email ?? "—"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Show date */}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.86rem", fontWeight: 600 }} noWrap>
                      {showDate(b.date)}
                    </Typography>
                    <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: upcoming ? ui.success : ui.faint }}>
                      {upcoming ? relativeDay(b.date) : `Past · ${relativeDay(b.date)}`}
                    </Typography>
                  </Box>

                  {/* Seats */}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {b.seats.map(s => (
                      <Box key={s} sx={{ px: 0.85, py: 0.15, borderRadius: 1.25, fontSize: "0.74rem", fontWeight: 700, color: ui.gold, border: "1px solid rgba(252,211,77,0.35)", bgcolor: "rgba(252,211,77,0.08)" }}>
                        {s}
                      </Box>
                    ))}
                  </Box>

                  {/* Amount */}
                  <Typography sx={{ fontWeight: 800, fontSize: "1rem", textAlign: { xs: "left", md: "right" }, fontVariantNumeric: "tabular-nums" }}>
                    {formatINR(b.totalPrice ?? 0)}
                  </Typography>

                  {/* Action */}
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      size="small"
                      onClick={() => setToCancel(b)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 99,
                        px: 1.75,
                        color: ui.danger,
                        border: "1px solid rgba(248,113,113,0.3)",
                        "&:hover": { bgcolor: "rgba(248,113,113,0.1)", borderColor: ui.danger },
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, mt: 3 }}>
            <Typography sx={{ fontSize: "0.8rem", color: ui.faint }}>
              Showing {Math.min(shown, filtered.length)} of {filtered.length} booking{filtered.length !== 1 ? "s" : ""}
            </Typography>
            {shown < filtered.length && (
              <Button onClick={() => setShown(s => s + PAGE_SIZE)} sx={ghostButtonSx}>
                Show more
              </Button>
            )}
          </Box>
        </>
      )}

      {/* Cancel confirmation */}
      <Dialog
        open={!!toCancel}
        onClose={() => !cancelling && setToCancel(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { bgcolor: "#17121f", color: ui.text, borderRadius: 4, border: `1px solid ${ui.border}`, backgroundImage: "none", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" },
          },
        }}
      >
        {toCancel && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: "50%", display: "grid", placeItems: "center", mb: 2, color: ui.danger, bgcolor: "rgba(248,113,113,0.12)" }}>
              <WarningAmberRoundedIcon />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1.2rem" }}>Cancel this booking?</Typography>
            <Typography sx={{ color: ui.muted, fontSize: "0.9rem", mt: 0.75 }}>
              The booking is removed and its seats go back on sale. This can&apos;t be undone.
            </Typography>

            <Box sx={{ mt: 2.5, p: 2, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: `1px dashed ${ui.border}`, display: "grid", gap: 1, fontSize: "0.85rem" }}>
              {[
                ["Event", toCancel.event?.title ?? "Event removed"],
                ["Guest", toCancel.user ? `${toCancel.user.username} · ${toCancel.user.email}` : "Deleted account"],
                ["Show date", showDate(toCancel.date)],
                ["Seats", toCancel.seats.join(", ")],
                ["Amount", formatINR(toCancel.totalPrice ?? 0)],
              ].map(([k, v]) => (
                <Box key={k} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Box component="span" sx={{ color: ui.faint }}>{k}</Box>
                  <Box component="span" sx={{ fontWeight: 600, textAlign: "right", minWidth: 0, overflowWrap: "anywhere" }}>{v}</Box>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: "flex", gap: 1.25, justifyContent: "flex-end", mt: 3 }}>
              <Button onClick={() => setToCancel(null)} disabled={cancelling} sx={ghostButtonSx}>
                Keep booking
              </Button>
              <Button
                onClick={confirmCancel}
                disabled={cancelling}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2.5,
                  px: 2.5,
                  color: "#fff",
                  bgcolor: "#dc2626",
                  minWidth: 150,
                  "&:hover": { bgcolor: "#b91c1c" },
                  "&.Mui-disabled": { color: "rgba(255,255,255,0.6)", bgcolor: "rgba(220,38,38,0.5)" },
                }}
              >
                {cancelling ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Cancel booking"}
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>
    </>
  );
}

// Access is enforced by app/admin/layout.tsx and adminOnly on the API.
export default function AdminBookings() {
  return (
    <UserShell allowAdmin>
      <BookingsLedger />
    </UserShell>
  );
}

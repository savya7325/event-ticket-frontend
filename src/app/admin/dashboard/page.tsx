"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, ButtonBase, Typography } from "@mui/material";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import CurrencyRupeeRoundedIcon from "@mui/icons-material/CurrencyRupeeRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import UserShell, { useExpireSession } from "../../components/UserShell";
import { useAuth } from "../../context/AuthContext";
import { CardSkeleton, ErrorState } from "../../components/ui";
import { AuthError, eventImageUrl, formatINR } from "../../components/userApi";
import { eyebrowSx, ghostButtonSx, primaryButtonSx, ui } from "../../components/theme";
import { capacityOf } from "../../components/seats";
import { ActivityChart, Bucket, chart, Donut, OTHER_COLOR, SERIES, SeriesKey, SLICE_COLORS } from "./charts";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const HERO_IMAGE = "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1600";

interface Stats {
  users: { _id: string; username: string; email: string; role: number | string; createdAt: string }[];
  events: { _id: string; title: string; location?: string; price?: number; capacity?: number; ticketsAvailable?: number; dates?: string[]; image?: string; createdAt: string }[];
  bookings: {
    _id: string;
    event: { _id: string; title: string } | null;
    user: { _id: string; username: string; email: string } | null;
    date: string;
    seats: string[];
    totalPrice?: number;
    createdAt: string;
  }[];
}

type Range = "7d" | "30d" | "90d" | "12m";
const RANGES: { key: Range; label: string }[] = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "12m", label: "12 months" },
];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-IN", opts);

// Days for 7/30d, weeks for 90d, months for 12m.
function makeBuckets(range: Range) {
  const today = startOfDay(new Date());
  if (range === "12m") {
    return Array.from({ length: 12 }, (_, i) => {
      const start = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1);
      return { start, end: new Date(start.getFullYear(), start.getMonth() + 1, 1), label: fmt(start, { month: "short" }), full: fmt(start, { month: "long", year: "numeric" }) };
    });
  }
  if (range === "90d") {
    const first = addDays(today, -7 * 12 - ((today.getDay() + 6) % 7));
    return Array.from({ length: 13 }, (_, i) => {
      const start = addDays(first, i * 7);
      return { start, end: addDays(start, 7), label: fmt(start, { day: "numeric", month: "short" }), full: `Week of ${fmt(start, { day: "numeric", month: "long" })}` };
    });
  }
  const days = range === "7d" ? 7 : 30;
  return Array.from({ length: days }, (_, i) => {
    const start = addDays(today, i - days + 1);
    return {
      start,
      end: addDays(start, 1),
      label: range === "7d" ? fmt(start, { weekday: "short" }) : fmt(start, { day: "numeric", month: "short" }),
      full: fmt(start, { weekday: "long", day: "numeric", month: "long" }),
    };
  });
}

const timeAgo = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return days < 30 ? `${days}d ago` : fmt(new Date(iso), { day: "numeric", month: "short" });
};

const isAdminRole = (r: number | string) => r === 1 || r === "1" || r === "admin";

const panelSx = {
  bgcolor: chart.surface,
  border: `1px solid ${ui.border}`,
  borderRadius: 4,
  p: { xs: 2, md: 3 },
  minWidth: 0,
  overflow: "hidden",
} as const;

/** KPI card styled as a ticket: main body + perforated stub. */
function TicketStat({ label, value, delta, period, color, icon }: { label: string; value: ReactNode; delta: string; period: string; color: string; icon: ReactNode }) {
  const notch = { content: '""', position: "absolute", right: 92, width: 18, height: 18, borderRadius: "50%", bgcolor: "#0d0a14" } as const;
  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        borderRadius: 4,
        overflow: "hidden",
        border: `1px solid ${color}40`,
        background: `linear-gradient(135deg, ${color}2b 0%, ${color}0d 55%, rgba(255,255,255,0.02) 100%)`,
        transition: "transform .2s ease, box-shadow .2s ease",
        "&:hover": { transform: "translateY(-3px)", boxShadow: `0 14px 34px ${color}26` },
        "&::before": { ...notch, top: -10 },
        "&::after": { ...notch, bottom: -10 },
      }}
    >
      <Box sx={{ flex: 1, p: 2.25, minWidth: 0 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            mb: 1.5,
            color: "#fff",
            background: `linear-gradient(135deg, ${color}, ${color}99)`,
            boxShadow: `0 6px 16px ${color}55`,
            "& svg": { fontSize: 21 },
          }}
        >
          {icon}
        </Box>
        <Typography sx={{ fontSize: "0.8rem", color: ui.muted, fontWeight: 500 }}>{label}</Typography>
        <Typography sx={{ fontSize: "1.85rem", fontWeight: 800, lineHeight: 1.15 }} noWrap>
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 101,
          flexShrink: 0,
          borderLeft: "2px dashed rgba(255,255,255,0.14)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 1,
          bgcolor: "rgba(0,0,0,0.18)",
        }}
      >
        <Typography sx={{ fontSize: "1.05rem", fontWeight: 800, color: ui.success }} noWrap>
          {delta}
        </Typography>
        <Typography sx={{ fontSize: "0.68rem", color: ui.faint, lineHeight: 1.3, mt: 0.25 }}>{period}</Typography>
      </Box>
    </Box>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const expireSession = useExpireSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<Range>("30d");
  const [hidden, setHidden] = useState<Set<SeriesKey>>(new Set());
  const [asTable, setAsTable] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${user.token}` } });
      if (res.status === 401) throw new AuthError();
      if (!res.ok) {
        throw new Error(
          res.status === 404
            ? "The stats endpoint wasn't found. Restart the backend so it loads /api/admin/stats."
            : (await res.json().catch(() => ({}))).message || "Could not load dashboard data."
        );
      }
      setStats(await res.json());
    } catch (err) {
      if (err instanceof AuthError) return expireSession();
      setError(err instanceof Error ? err.message : "Could not load dashboard data.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  useEffect(() => {
    load();
  }, [load]);

  const view = useMemo(() => {
    if (!stats) return null;
    const ranges = makeBuckets(range);
    const from = ranges[0].start;
    const today = startOfDay(new Date());
    const customers = stats.users.filter(u => !isAdminRole(u.role));

    const count = (items: { createdAt: string }[]) => {
      const out = ranges.map(() => 0);
      for (const it of items) {
        const t = new Date(it.createdAt);
        const i = ranges.findIndex(r => t >= r.start && t < r.end);
        if (i >= 0) out[i]++;
      }
      return out;
    };
    const users = count(customers);
    const bookings = count(stats.bookings);
    const events = count(stats.events);
    const buckets: Bucket[] = ranges.map((r, i) => ({ label: r.label, full: r.full, values: { users: users[i], bookings: bookings[i], events: events[i] } }));
    const inRange = <T extends { createdAt: string }>(items: T[]) => items.filter(i => new Date(i.createdAt) >= from);

    // Donut: seats booked per event, top 3 + "Other".
    const seatsByEvent = new Map<string, { label: string; value: number }>();
    for (const b of stats.bookings) {
      const key = b.event?._id ?? "deleted";
      const row = seatsByEvent.get(key) ?? { label: b.event?.title ?? "Deleted event", value: 0 };
      row.value += b.seats.length;
      seatsByEvent.set(key, row);
    }
    const ranked = [...seatsByEvent.values()].sort((a, b) => b.value - a.value);
    const slices = ranked.slice(0, 3).map((r, i) => ({ ...r, color: SLICE_COLORS[i] }));
    const otherSeats = ranked.slice(3).reduce((n, r) => n + r.value, 0);
    if (otherSeats) slices.push({ label: `Other (${ranked.length - 3})`, value: otherSeats, color: OTHER_COLOR });

    // Upcoming shows with per-event occupancy across their future dates.
    const upcoming = stats.events
      .map(ev => {
        const future = (ev.dates || []).map(d => new Date(d)).filter(d => d >= today).sort((a, b) => +a - +b);
        const capacity = future.length * capacityOf(ev);
        const sold = stats.bookings.filter(b => b.event?._id === ev._id && new Date(b.date) >= today).reduce((n, b) => n + b.seats.length, 0);
        return { ev, next: future[0], capacity, sold };
      })
      .filter(x => x.next)
      .sort((a, b) => +a.next - +b.next)
      .slice(0, 5);

    const activity = [
      ...customers.map(u => ({ id: `u${u._id}`, at: u.createdAt, key: "users" as SeriesKey, title: `${u.username} joined Evenza`, sub: u.email })),
      ...stats.bookings.map(b => ({
        id: `b${b._id}`,
        at: b.createdAt,
        key: "bookings" as SeriesKey,
        title: `${b.user?.username ?? "A guest"} grabbed ${b.seats.length} ticket${b.seats.length !== 1 ? "s" : ""}`,
        sub: `${b.event?.title ?? "Deleted event"} · ${b.seats.join(", ")} · ${formatINR(b.totalPrice ?? 0)}`,
      })),
      ...stats.events.map(ev => ({ id: `e${ev._id}`, at: ev.createdAt, key: "events" as SeriesKey, title: `${ev.title} went on sale`, sub: ev.location || "Venue TBA" })),
    ]
      .sort((a, b) => +new Date(b.at) - +new Date(a.at))
      .slice(0, 7);

    return {
      buckets,
      kpis: {
        users: { total: customers.length, delta: inRange(customers).length },
        bookings: { total: stats.bookings.reduce((n, b) => n + b.seats.length, 0), delta: inRange(stats.bookings).reduce((n, b) => n + b.seats.length, 0) },
        events: { total: stats.events.length, delta: inRange(stats.events).length },
        revenue: { total: stats.bookings.reduce((n, b) => n + (b.totalPrice ?? 0), 0), delta: inRange(stats.bookings).reduce((n, b) => n + (b.totalPrice ?? 0), 0) },
      },
      slices,
      totalSeats: ranked.reduce((n, r) => n + r.value, 0),
      upcoming,
      activity,
    };
  }, [stats, range]);

  const rangeLabel = RANGES.find(r => r.key === range)!.label;
  const seriesColor = Object.fromEntries(SERIES.map(s => [s.key, s.color])) as Record<SeriesKey, string>;
  const activityIcon: Record<SeriesKey, ReactNode> = {
    users: <PersonAddAlt1RoundedIcon />,
    bookings: <ConfirmationNumberRoundedIcon />,
    events: <EventRoundedIcon />,
  };

  const toggleSeries = (key: SeriesKey) =>
    setHidden(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else if (next.size < SERIES.length - 1) next.add(key);
      return next;
    });

  return (
    <>
      {/* Hero: concert banner */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 5,
          mb: 3,
          minHeight: { xs: 220, md: 240 },
          display: "flex",
          alignItems: "flex-end",
          backgroundColor: "#1e1030",
          backgroundImage: `linear-gradient(90deg, rgba(13,10,20,0.95) 0%, rgba(13,10,20,0.75) 45%, rgba(88,28,135,0.35) 100%), url('${HERO_IMAGE}')`,
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
          border: `1px solid ${ui.border}`,
        }}
      >
        <Box sx={{ position: "relative", p: { xs: 3, md: 4.5 }, width: "100%", display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 3 }}>
          <Box>
            <Typography sx={{ ...eyebrowSx, color: ui.gold }}>🎟️ Box office · {fmt(new Date(), { weekday: "long", day: "numeric", month: "long" })}</Typography>
            <Typography component="h1" sx={{ fontSize: { xs: "1.9rem", md: "2.6rem" }, fontWeight: 800, mt: 0.75, lineHeight: 1.1 }}>
              The show is on, {(user?.username || "").split(/[\s_]+/)[0]}.
            </Typography>
            <Typography sx={{ color: ui.muted, mt: 1, maxWidth: 480 }}>
              {view
                ? `${view.kpis.bookings.delta} tickets sold and ${view.kpis.users.delta} new fans in the last ${rangeLabel.toLowerCase()}.`
                : "Here's how your events are doing."}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap" }}>
            <Button onClick={() => router.push("/admin/bookings")} sx={{ ...ghostButtonSx, bgcolor: "rgba(13,10,20,0.6)", backdropFilter: "blur(6px)" }}>
              Manage bookings
            </Button>
            <Button onClick={() => router.push("/admin/events")} startIcon={<AddRoundedIcon />} sx={primaryButtonSx}>
              New event
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Range filter: one row above everything it affects */}
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2.5 }}>
        <Box role="radiogroup" aria-label="Time range" sx={{ display: "inline-flex", p: 0.5, borderRadius: 99, bgcolor: ui.surface, border: `1px solid ${ui.border}` }}>
          {RANGES.map(r => (
            <ButtonBase
              key={r.key}
              role="radio"
              aria-checked={range === r.key}
              onClick={() => setRange(r.key)}
              sx={{ px: 2, py: 0.85, borderRadius: 99, fontSize: "0.85rem", fontWeight: 600, color: range === r.key ? "#fff" : ui.muted, background: range === r.key ? ui.gradient : "transparent" }}
            >
              {r.label}
            </ButtonBase>
          ))}
        </Box>
        <Typography sx={{ fontSize: "0.8rem", color: ui.faint }}>Ticket stubs show the last {rangeLabel.toLowerCase()}</Typography>
      </Box>

      {error && (
        <Box sx={{ mb: 3 }}>
          <ErrorState message={error} onRetry={load} />
        </Box>
      )}

      {/* KPI ticket stubs */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "minmax(0,1fr) minmax(0,1fr)", lg: "repeat(4, minmax(0,1fr))" }, gap: 2, mb: 3 }}>
        {!view ? (
          Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} height={150} />)
        ) : (
          <>
            <TicketStat label="Tickets sold" value={view.kpis.bookings.total} delta={`+${view.kpis.bookings.delta}`} period={rangeLabel} color={seriesColor.bookings} icon={<ConfirmationNumberRoundedIcon />} />
            <TicketStat label="Revenue" value={formatINR(view.kpis.revenue.total)} delta={`+${formatINR(view.kpis.revenue.delta)}`} period={rangeLabel} color="#2dd4bf" icon={<CurrencyRupeeRoundedIcon />} />
            <TicketStat label="Fans registered" value={view.kpis.users.total} delta={`+${view.kpis.users.delta}`} period={rangeLabel} color={seriesColor.users} icon={<PersonAddAlt1RoundedIcon />} />
            <TicketStat label="Events listed" value={view.kpis.events.total} delta={`+${view.kpis.events.delta}`} period={rangeLabel} color={seriesColor.events} icon={<EventRoundedIcon />} />
          </>
        )}
      </Box>

      {/* Activity + share */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,1.75fr) minmax(0,1fr)" }, gap: 3, mb: 3 }}>
        <Box sx={panelSx}>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 2 }}>
            <Box>
              <Typography sx={eyebrowSx}>Activity</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mt: 0.25 }}>Sign-ups, bookings & launches</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
              {SERIES.map(s => {
                const off = hidden.has(s.key);
                return (
                  <ButtonBase
                    key={s.key}
                    onClick={() => toggleSeries(s.key)}
                    aria-pressed={!off}
                    sx={{
                      gap: 0.85,
                      px: 1.25,
                      py: 0.55,
                      borderRadius: 99,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: off ? ui.faint : ui.text,
                      bgcolor: off ? "transparent" : `${s.color}1f`,
                      border: `1px solid ${off ? ui.border : `${s.color}55`}`,
                      textDecoration: off ? "line-through" : "none",
                    }}
                  >
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: s.color, opacity: off ? 0.4 : 1 }} />
                    {s.label}
                  </ButtonBase>
                );
              })}
              <ButtonBase
                onClick={() => setAsTable(t => !t)}
                aria-label={asTable ? "Show chart" : "Show as table"}
                title={asTable ? "Show chart" : "Show as table"}
                sx={{ width: 32, height: 32, borderRadius: 99, color: ui.muted, border: `1px solid ${ui.border}`, "&:hover": { color: "#fff" } }}
              >
                {asTable ? <BarChartRoundedIcon sx={{ fontSize: 18 }} /> : <TableRowsRoundedIcon sx={{ fontSize: 18 }} />}
              </ButtonBase>
            </Box>
          </Box>

          {!view ? (
            <CardSkeleton height={300} />
          ) : asTable ? (
            <Box sx={{ maxHeight: 300, overflow: "auto" }}>
              <Box
                component="table"
                sx={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.85rem",
                  "& th, & td": { py: 1, px: 1.5, textAlign: "right", borderBottom: `1px solid ${ui.border}` },
                  "& th:first-of-type, & td:first-of-type": { textAlign: "left" },
                  "& th": { color: ui.faint, fontWeight: 600, position: "sticky", top: 0, bgcolor: chart.surface },
                  "& td": { fontVariantNumeric: "tabular-nums" },
                }}
              >
                <thead>
                  <tr>
                    <th>Period</th>
                    {SERIES.map(s => <th key={s.key}>{s.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[...view.buckets].reverse().map(b => (
                    <tr key={b.full}>
                      <td>{b.full}</td>
                      {SERIES.map(s => <td key={s.key}>{b.values[s.key]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </Box>
            </Box>
          ) : (
            <ActivityChart buckets={view.buckets} hidden={hidden} />
          )}
        </Box>

        <Box sx={panelSx}>
          <Typography sx={eyebrowSx}>Crowd share</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mt: 0.25, mb: 2.5 }}>Seats booked by event</Typography>
          {!view ? (
            <CardSkeleton height={260} />
          ) : view.slices.length === 0 ? (
            <Typography sx={{ color: ui.faint, fontSize: "0.9rem" }}>No tickets sold yet.</Typography>
          ) : (
            <Donut slices={view.slices} centerLabel="seats booked" unit="seats" />
          )}
        </Box>
      </Box>

      {/* Upcoming shows + feed */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,1.15fr) minmax(0,1fr)" }, gap: 3 }}>
        <Box sx={panelSx}>
          <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 2 }}>
            <Box>
              <Typography sx={eyebrowSx}>On stage soon</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mt: 0.25 }}>Upcoming shows</Typography>
            </Box>
            <ButtonBase onClick={() => router.push("/admin/events")} sx={{ fontSize: "0.82rem", fontWeight: 600, color: ui.accentSoft, "&:hover": { color: "#fff" } }}>
              All events
            </ButtonBase>
          </Box>
          {!view ? (
            <Box sx={{ display: "grid", gap: 1.5 }}>{Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} height={72} />)}</Box>
          ) : view.upcoming.length === 0 ? (
            <Typography sx={{ color: ui.faint, fontSize: "0.9rem" }}>No upcoming shows. Add an event to get started.</Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 1 }}>
              {view.upcoming.map(({ ev, next, capacity, sold }) => {
                const pct = capacity ? Math.round((sold / capacity) * 100) : 0;
                const img = eventImageUrl(ev.image);
                return (
                  <Box
                    key={ev._id}
                    onClick={() => router.push(`/events/${ev._id}/details`)}
                    sx={{ display: "flex", gap: 1.75, alignItems: "center", p: 1.25, mx: -1.25, borderRadius: 3, cursor: "pointer", "&:hover": { bgcolor: "rgba(255,255,255,0.04)" } }}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        flexShrink: 0,
                        borderRadius: 2.5,
                        backgroundColor: "#2a1d3d",
                        backgroundImage: img ? `url('${img}')` : "linear-gradient(135deg, #7c3aed, #db2777)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        position: "relative",
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          left: 4,
                          bottom: 4,
                          px: 0.6,
                          borderRadius: 1,
                          bgcolor: "rgba(13,10,20,0.85)",
                          fontSize: "0.62rem",
                          fontWeight: 800,
                          lineHeight: 1.5,
                          color: ui.gold,
                        }}
                      >
                        {fmt(next, { day: "numeric", month: "short" }).toUpperCase()}
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }} noWrap>
                        {ev.title}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: ui.faint, fontSize: "0.78rem", mb: 0.9 }}>
                        <PlaceRoundedIcon sx={{ fontSize: 14 }} />
                        <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {ev.location || "Venue TBA"}
                        </Box>
                      </Box>
                      <Box sx={{ height: 6, borderRadius: 99, bgcolor: `${seriesColor.bookings}26`, overflow: "hidden" }}>
                        <Box sx={{ height: "100%", width: `${pct}%`, minWidth: sold ? 6 : 0, borderRadius: 99, background: `linear-gradient(90deg, ${seriesColor.bookings}, #f472b6)` }} />
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: "right", flexShrink: 0, minWidth: 70 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: "1rem" }}>{pct}%</Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: ui.faint, fontVariantNumeric: "tabular-nums" }}>
                        {sold}/{capacity} sold
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        <Box sx={panelSx}>
          <Typography sx={eyebrowSx}>Live feed</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mt: 0.25, mb: 2 }}>What&apos;s happening</Typography>
          {!view ? (
            <Box sx={{ display: "grid", gap: 1.5 }}>{Array.from({ length: 5 }, (_, i) => <CardSkeleton key={i} height={48} />)}</Box>
          ) : view.activity.length === 0 ? (
            <Typography sx={{ color: ui.faint, fontSize: "0.9rem" }}>Nothing yet.</Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 0.5 }}>
              {view.activity.map(a => (
                <Box key={a.id} sx={{ display: "flex", gap: 1.5, alignItems: "center", p: 1, mx: -1, borderRadius: 2.5, "&:hover": { bgcolor: "rgba(255,255,255,0.04)" } }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      flexShrink: 0,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      color: seriesColor[a.key],
                      bgcolor: `${seriesColor[a.key]}1f`,
                      border: `1px solid ${seriesColor[a.key]}40`,
                      "& svg": { fontSize: 18 },
                    }}
                  >
                    {activityIcon[a.key]}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.86rem", fontWeight: 600 }} noWrap>
                      {a.title}
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: ui.faint }} noWrap>
                      {a.sub}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: "0.72rem", color: ui.faint, flexShrink: 0 }}>{timeAgo(a.at)}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}

// Access is enforced by app/admin/layout.tsx and adminOnly on the API.
export default function AdminDashboard() {
  return (
    <UserShell allowAdmin>
      <Dashboard />
    </UserShell>
  );
}

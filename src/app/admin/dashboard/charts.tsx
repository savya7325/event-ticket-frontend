"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { ui } from "../../components/theme";

// Chart chrome for the dark dashboard surface (#161220).
export const chart = {
  surface: "#161220",
  grid: "rgba(255,255,255,0.06)",
  axis: "rgba(255,255,255,0.14)",
  tick: "rgba(255,255,255,0.45)",
};

// Activity series in the app's brand hues. Validated on #161220:
// adjacent CVD ΔE ≥ 13.2, normal-vision ΔE ≥ 19.3, all ≥ 3:1. Color follows the entity everywhere.
export const SERIES = [
  { key: "users", label: "Registrations", color: "#9085e9" },
  { key: "bookings", label: "Bookings", color: "#d55181" },
  { key: "events", label: "New events", color: "#c98500" },
] as const;
export type SeriesKey = (typeof SERIES)[number]["key"];

// Donut slices are events, a different entity, so they use a separate set.
// Validated all-pairs on #161220 (CVD ΔE ≥ 9.4, normal ΔE ≥ 20.9); the tail folds into gray "Other".
export const SLICE_COLORS = ["#3987e5", "#199e70", "#d95926"];
export const OTHER_COLOR = "#5b5668";

export interface Bucket {
  label: string;
  full: string;
  values: Record<SeriesKey, number>;
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

const niceScale = (rawMax: number) => {
  if (rawMax <= 4) return [4, 1];
  const rough = rawMax / 4;
  const mag = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map(m => m * mag).find(s => s >= rough) ?? 10 * mag;
  return [Math.ceil(rawMax / step) * step, step];
};

// Rounded top (4px data-end), square on the baseline.
const columnPath = (x: number, y: number, w: number, h: number, rounded: boolean) => {
  const r = rounded ? Math.min(6, w / 2, h) : 0;
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
};

/** Stacked columns: one wide column per period, segments per series, 2px surface gaps. */
export function ActivityChart({ buckets, hidden }: { buckets: Bucket[]; hidden: Set<SeriesKey> }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const height = 300;
  const m = { top: 14, right: 8, bottom: 30, left: 34 };
  const plotW = Math.max(0, width - m.left - m.right);
  const plotH = height - m.top - m.bottom;

  const visible = SERIES.filter(s => !hidden.has(s.key));
  const totals = buckets.map(b => visible.reduce((n, s) => n + b.values[s.key], 0));
  const [yMax, step] = niceScale(Math.max(0, ...totals));
  const ticks = Array.from({ length: Math.round(yMax / step) + 1 }, (_, i) => i * step);
  const y = (v: number) => m.top + plotH - (v / yMax) * plotH;

  const n = buckets.length || 1;
  const gw = plotW / n;
  const barW = Math.max(6, Math.min(56, gw * 0.66));
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(plotW / 60))));
  const hovered = hover !== null ? buckets[hover] : null;
  const tipLeft = hover !== null ? m.left + gw * hover + gw / 2 : 0;
  // Beside the column on wide charts; clamped inside the chart on phones.
  const TIP_W = 180;
  const tipX = width < 520 ? Math.min(Math.max(0, tipLeft - TIP_W / 2), width - TIP_W) : tipLeft > width / 2 ? tipLeft - TIP_W - 16 : tipLeft + 16;

  return (
    <Box ref={ref} sx={{ position: "relative", width: "100%", minWidth: 0, height, overflow: "hidden" }} onMouseLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={width} height={height} style={{ display: "block" }} role="img" aria-label="Registrations, bookings and new events over time">
          <defs>
            {visible.map(s => (
              <linearGradient key={s.key} id={`col-${s.key}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={s.color} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.78} />
              </linearGradient>
            ))}
          </defs>
          {ticks.map(t => (
            <g key={t}>
              <line x1={m.left} x2={width - m.right} y1={y(t)} y2={y(t)} stroke={t === 0 ? chart.axis : chart.grid} strokeDasharray={t === 0 ? undefined : "3 5"} />
              <text x={m.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill={chart.tick} style={{ fontVariantNumeric: "tabular-nums" }}>
                {t}
              </text>
            </g>
          ))}

          {buckets.map((b, i) => {
            const x = m.left + gw * i + (gw - barW) / 2;
            let acc = 0;
            const segs = visible.filter(s => b.values[s.key] > 0);
            return (
              <g key={i} opacity={hover === null || hover === i ? 1 : 0.4} style={{ transition: "opacity .15s ease" }}>
                {hover === i && <rect x={m.left + gw * i + 2} y={m.top} width={gw - 4} height={plotH} rx={8} fill="rgba(255,255,255,0.035)" />}
                {/* empty periods keep a faint slot so the rhythm of the axis stays readable */}
                {segs.length === 0 && <rect x={x} y={y(0) - 3} width={barW} height={3} rx={1.5} fill="rgba(255,255,255,0.07)" />}
                {segs.map((s, k) => {
                  const v = b.values[s.key];
                  const top = y(acc + v);
                  const h = y(acc) - top - (k > 0 ? 2 : 0); // 2px surface gap between stacked segments
                  acc += v;
                  return <path key={s.key} d={columnPath(x, top, barW, Math.max(1, h), k === segs.length - 1)} fill={`url(#col-${s.key})`} />;
                })}
                {i % labelEvery === 0 && (
                  <text x={m.left + gw * i + gw / 2} y={height - 10} textAnchor="middle" fontSize={11} fill={chart.tick}>
                    {b.label}
                  </text>
                )}
                <rect
                  x={m.left + gw * i}
                  y={m.top}
                  width={gw}
                  height={plotH}
                  fill="transparent"
                  tabIndex={0}
                  aria-label={`${b.full}: ${visible.map(s => `${b.values[s.key]} ${s.label.toLowerCase()}`).join(", ")}`}
                  onMouseEnter={() => setHover(i)}
                  onClick={() => setHover(h => (h === i ? null : i))} // tap to show / hide on touch screens
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  style={{ outline: "none", cursor: "pointer" }}
                />
              </g>
            );
          })}
        </svg>
      )}

      {hovered && (
        <Box
          sx={{
            position: "absolute",
            top: 6,
            left: tipX,
            pointerEvents: "none",
            width: TIP_W,
            p: 1.5,
            borderRadius: 3,
            bgcolor: "rgba(29,22,40,0.96)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(167,139,250,0.25)",
            boxShadow: "0 14px 34px rgba(0,0,0,0.5)",
            zIndex: 2,
          }}
        >
          <Typography sx={{ fontSize: "0.75rem", color: ui.faint, mb: 0.75 }}>{hovered.full}</Typography>
          {visible.map(s => (
            <Box key={s.key} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.25 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: 0.75, bgcolor: s.color }} />
              <Typography sx={{ fontSize: "0.82rem", color: ui.muted, flex: 1 }}>{s.label}</Typography>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{hovered.values[s.key]}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

const polar = (cx: number, cy: number, r: number, a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];

const arcPath = (cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) => {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = polar(cx, cy, r1, a0);
  const [x1, y1] = polar(cx, cy, r1, a1);
  const [x2, y2] = polar(cx, cy, r0, a1);
  const [x3, y3] = polar(cx, cy, r0, a0);
  return `M${x0},${y0}A${r1},${r1} 0 ${large} 1 ${x1},${y1}L${x2},${y2}A${r0},${r0} 0 ${large} 0 ${x3},${y3}Z`;
};

/** Donut for share-of-total, with a direct-labelled legend (value + %) so identity never rests on colour. */
export function Donut({ slices, centerLabel, unit }: { slices: { label: string; value: number; color: string }[]; centerLabel: string; unit: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const total = slices.reduce((n, s) => n + s.value, 0);
  const size = 200; // drawn at 200, scaled down by CSS on narrow screens
  const c = size / 2;
  const gap = slices.length > 1 ? 0.035 : 0; // radians of surface gap between slices
  let a = -Math.PI / 2;
  const arcs = slices.map(s => {
    const sweep = total ? (s.value / total) * Math.PI * 2 : 0;
    const arc = { a0: a + gap / 2, a1: a + sweep - gap / 2 };
    a += sweep;
    return arc;
  });
  const active = hover !== null ? slices[hover] : null;

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row", lg: "column", xl: "row" }, alignItems: "center", gap: 3, minWidth: 0 }}>
      <Box sx={{ position: "relative", width: { xs: 180, sm: size }, maxWidth: "100%", aspectRatio: "1", flexShrink: 0 }}>
        <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" style={{ display: "block", overflow: "visible" }} role="img" aria-label={`${centerLabel}: ${slices.map(s => `${s.label} ${s.value}`).join(", ")}`}>
          <circle cx={c} cy={c} r={78} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={30} />
          {slices.map((s, i) => (
            <path
              key={s.label}
              d={arcPath(c, c, hover === i ? 60 : 63, hover === i ? 98 : 93, arcs[i].a0, Math.max(arcs[i].a0 + 0.001, arcs[i].a1))}
              fill={s.color}
              opacity={hover === null || hover === i ? 1 : 0.45}
              style={{ transition: "all .2s ease", cursor: "pointer" }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setHover(h => (h === i ? null : i))}
            />
          ))}
        </svg>
        <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none", textAlign: "center" }}>
          <Box sx={{ maxWidth: 110 }}>
            <Typography sx={{ fontSize: "1.9rem", fontWeight: 800, lineHeight: 1 }}>{active ? active.value : total}</Typography>
            <Typography sx={{ fontSize: "0.72rem", color: ui.faint, mt: 0.5 }} noWrap>
              {active ? active.label : centerLabel}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1, width: "100%", display: "grid", gap: 0.5 }}>
        {slices.map((s, i) => (
          <Box
            key={s.label}
            tabIndex={0}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1.25, py: 1, borderRadius: 2, outline: "none", bgcolor: hover === i ? "rgba(255,255,255,0.05)" : "transparent" }}
          >
            <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: s.color, flexShrink: 0 }} />
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, flex: 1, minWidth: 0 }} noWrap>
              {s.label}
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: ui.faint, fontVariantNumeric: "tabular-nums" }}>
              {s.value} {unit}
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, width: 44, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {total ? Math.round((s.value / total) * 100) : 0}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// Shared look for the signed-in user area (home, bookings, profile, events nav).
export const ui = {
  pageBg:
    "radial-gradient(1100px 560px at 0% -10%, rgba(124,58,237,0.22), transparent 60%)," +
    "radial-gradient(900px 480px at 100% 0%, rgba(219,39,119,0.10), transparent 60%), #0d0a14",
  surface: "rgba(255,255,255,0.035)",
  surfaceHover: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.08)",
  text: "#f5f3ff",
  muted: "rgba(255,255,255,0.62)",
  faint: "rgba(255,255,255,0.4)",
  accent: "#8b5cf6",
  accentSoft: "#c4b5fd",
  gold: "#fcd34d",
  success: "#34d399",
  danger: "#f87171",
  gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
};

export const cardSx = {
  bgcolor: ui.surface,
  border: `1px solid ${ui.border}`,
  borderRadius: 4,
  backdropFilter: "blur(8px)",
} as const;

export const eyebrowSx = {
  fontSize: "0.7rem",
  fontWeight: 600,
  letterSpacing: 2.5,
  textTransform: "uppercase",
  color: ui.accentSoft,
} as const;

export const primaryButtonSx = {
  textTransform: "none",
  fontWeight: 700,
  borderRadius: 2.5,
  px: 2.5,
  py: 1.1,
  color: "#fff",
  background: ui.gradient,
  boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
  "&:hover": { background: "linear-gradient(135deg, #a78bfa, #7c3aed)" },
} as const;

export const ghostButtonSx = {
  textTransform: "none",
  fontWeight: 600,
  borderRadius: 2.5,
  px: 2.5,
  py: 1.1,
  color: ui.text,
  border: `1px solid ${ui.border}`,
  bgcolor: ui.surface,
  "&:hover": { bgcolor: ui.surfaceHover, borderColor: "rgba(167,139,250,0.5)" },
} as const;

// Dark outlined inputs (TextField / DatePicker field) for forms on dark surfaces.
export const darkFieldSx = {
  "& .MuiInputLabel-root": { color: ui.faint },
  "& .MuiInputLabel-root.Mui-focused": { color: ui.accentSoft },
  "& .MuiInputLabel-root.Mui-error": { color: ui.danger },
  "& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root": {
    color: ui.text,
    borderRadius: 3,
    bgcolor: "rgba(255,255,255,0.03)",
    transition: "background .15s ease",
    "& fieldset, & .MuiPickersOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.12)" },
    "&:hover fieldset, &:hover .MuiPickersOutlinedInput-notchedOutline": { borderColor: "rgba(167,139,250,0.5)" },
    "&.Mui-focused": { bgcolor: "rgba(139,92,246,0.06)" },
    "&.Mui-focused fieldset, &.Mui-focused .MuiPickersOutlinedInput-notchedOutline": { borderColor: ui.accent, borderWidth: 1.5 },
    "&.Mui-error fieldset, &.Mui-error .MuiPickersOutlinedInput-notchedOutline": { borderColor: ui.danger },
  },
  "& .MuiInputAdornment-root, & .MuiInputAdornment-root .MuiTypography-root, & .MuiIconButton-root": { color: ui.faint },
  "& .MuiFormHelperText-root": { mx: 0.5, color: ui.faint },
  "& .MuiFormHelperText-root.Mui-error": { color: ui.danger },
  "& input::placeholder, & textarea::placeholder": { color: ui.faint, opacity: 1 },
  // hide number spinners
  "& input[type=number]": { MozAppearance: "textfield" },
  "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button": { WebkitAppearance: "none", m: 0 },
} as const;

// Calendar popup for date pickers on dark pages.
export const darkPopperPaperSx = {
  bgcolor: "#1a1424",
  color: ui.text,
  border: `1px solid ${ui.border}`,
  borderRadius: 3,
  backgroundImage: "none",
  boxShadow: "0 20px 50px rgba(0,0,0,0.55)",
  "& .MuiPickersDay-root": { color: ui.text, "&:hover": { bgcolor: "rgba(139,92,246,0.2)" } },
  "& .MuiPickersDay-root.Mui-selected": { background: ui.gradient, color: "#fff" },
  "& .MuiPickersDay-today": { borderColor: ui.accentSoft },
  "& .MuiPickersDay-root.Mui-disabled": { color: "rgba(255,255,255,0.2) !important" },
  "& .MuiDayCalendar-weekDayLabel, & .MuiPickersCalendarHeader-switchViewIcon, & .MuiPickersArrowSwitcher-button": { color: ui.faint },
  "& .MuiPickersYear-yearButton.Mui-selected, & .MuiPickersMonth-monthButton.Mui-selected": { background: ui.gradient },
} as const;

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, ButtonBase, CircularProgress, IconButton, InputAdornment, TextField, Typography, useMediaQuery } from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import EventSeatRoundedIcon from "@mui/icons-material/EventSeatRounded";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import CelebrationRoundedIcon from "@mui/icons-material/CelebrationRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import { useAuth } from "./context/AuthContext";
import { homePathFor } from "./auth/roles";
import PublicNavbar from "./components/PublicNavbar";
import SiteFooter from "./components/SiteFooter";
import { darkFieldSx, eyebrowSx, primaryButtonSx, ui } from "./components/theme";

const px = (id: number, w = 1200) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

// Background: videos on larger screens, the still photo on phones (the videos are 4K).
const POSTER = px(2101488, 1800);
const BACKGROUND_VIDEOS = ["https://www.pexels.com/download/video/2845487/", "https://www.pexels.com/download/video/31580002/"];

const HIGHLIGHTS = [
  { id: 1190297, label: "Live concerts" },
  { id: 1540406, label: "Festivals" },
  { id: 269140, label: "Theatre" },
  { id: 5475779, label: "Tech meetups" },
  { id: 169190, label: "Weddings & galas" },
  { id: 2814828, label: "Nightlife" },
];

const PERKS = [
  { icon: <EventSeatRoundedIcon />, text: "Pick your exact seat on a live seat map" },
  { icon: <MarkEmailReadRoundedIcon />, text: "Instant booking confirmation by email" },
  { icon: <CelebrationRoundedIcon />, text: "Concerts, workshops, festivals and more" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Home() {
  const { user, loading, login, register } = useAuth();
  const router = useRouter();
  const isPhone = useMediaQuery("(max-width: 767px)");

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentVideo(prev => (prev + 1) % BACKGROUND_VIDEOS.length), 9000);
    return () => clearInterval(interval);
  }, []);

  // Where to go after signing in: back to the page that sent us here (?next=), else the role's home.
  const destinationFor = (u: Parameters<typeof homePathFor>[0]) => {
    const next = new URLSearchParams(window.location.search).get("next");
    const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
    return safeNext && !next!.startsWith("/admin") ? safeNext : homePathFor(u);
  };

  // Already signed in? Skip the login screen.
  useEffect(() => {
    if (!loading && user) router.replace(destinationFor(user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  const fieldErrors = {
    username: isRegister && formData.username.trim().length < 3 ? "At least 3 characters" : "",
    email: !EMAIL_RE.test(formData.email.trim()) ? "Enter a valid email" : "",
    // Only new accounts need 6+; older accounts may have shorter passwords, so login just needs one.
    password: isRegister ? (formData.password.length < 6 ? "At least 6 characters" : "") : !formData.password ? "Enter your password" : "",
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const switchMode = (register: boolean) => {
    setIsRegister(register);
    setError("");
    setTouched(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (Object.values(fieldErrors).some(Boolean) || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      if (isRegister) {
        const registered = await register({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
        });
        router.push(destinationFor(registered));
      } else {
        const loggedIn = await login({ email: formData.email.trim(), password: formData.password });
        // Admins (role 1) go to the admin dashboard, users (role 2) to /home.
        router.push(destinationFor(loggedIn));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const scrollRail = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (rail) rail.scrollBy({ left: dir * rail.clientWidth * 0.8, behavior: "smooth" });
  };

  const fieldProps = (name: keyof typeof formData) => ({
    name,
    value: formData[name],
    onChange: handleChange,
    error: touched && !!fieldErrors[name],
    helperText: touched && fieldErrors[name] ? fieldErrors[name] : " ",
    fullWidth: true,
    sx: darkFieldSx,
    // Labels sit above the field: browser autofill fills inputs without telling React, which left labels overlapping the text.
    slotProps: { inputLabel: { shrink: true } },
  });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0d0a14", color: ui.text }}>
      {/* ---------- Hero with background ---------- */}
      <Box component="section" sx={{ position: "relative", overflow: "hidden", minHeight: { md: "100vh" }, pb: { xs: 6, md: 8 } }}>
        <Box aria-hidden sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Box sx={{ position: "absolute", inset: 0, backgroundImage: `url('${POSTER}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
          {!isPhone && (
            // Only the active video is mounted, so just one file downloads at a time.
            <video
              key={BACKGROUND_VIDEOS[currentVideo]}
              src={BACKGROUND_VIDEOS[currentVideo]}
              poster={POSTER}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", animation: "fade-up 1.2s ease both" }}
            />
          )}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(13,10,20,0.92) 0%, rgba(13,10,20,0.7) 50%, rgba(13,10,20,0.55) 100%), linear-gradient(180deg, rgba(13,10,20,0) 60%, #0d0a14 100%)",
            }}
          />
          <Box sx={{ position: "absolute", inset: 0, background: "radial-gradient(700px 400px at 85% 30%, rgba(124,58,237,0.35), transparent 70%)" }} />
        </Box>

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <PublicNavbar />

          <Box
            sx={{
              maxWidth: 1180,
              mx: "auto",
              px: { xs: 2, sm: 3, md: 4 },
              pt: { xs: 5, md: 10 },
              display: "grid",
              gridTemplateColumns: { xs: "minmax(0,1fr)", md: "minmax(0,1.1fr) minmax(0,440px)" },
              gap: { xs: 5, md: 8 },
              alignItems: "center",
            }}
          >
            {/* Pitch */}
            <Box sx={{ textAlign: { xs: "center", md: "left" }, animation: "fade-up .6s ease both" }}>
              <Typography sx={{ ...eyebrowSx, color: ui.gold }}>🎟️ Live events, booked in seconds</Typography>
              <Typography component="h1" sx={{ fontSize: { xs: "2.3rem", sm: "3rem", md: "3.6rem" }, fontWeight: 800, lineHeight: 1.05, mt: 1.5, letterSpacing: "-1px" }}>
                Experience events{" "}
                <Box component="span" sx={{ background: "linear-gradient(90deg, #c4b5fd, #f472b6, #fcd34d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  like never before
                </Box>
              </Typography>
              <Typography sx={{ color: "rgba(237,233,254,0.82)", mt: 2.5, fontSize: { xs: "1rem", md: "1.15rem" }, lineHeight: 1.7, maxWidth: 520, mx: { xs: "auto", md: 0 } }}>
                Book tickets, explore events and manage your experience seamlessly with Evenza.
              </Typography>
              <Box component="ul" sx={{ listStyle: "none", mt: 3.5, display: { xs: "none", sm: "grid" }, gap: 1.5, justifyContent: { xs: "center", md: "start" } }}>
                {PERKS.map(p => (
                  <Box component="li" key={p.text} sx={{ display: "flex", alignItems: "center", gap: 1.5, color: ui.muted, fontSize: "0.95rem" }}>
                    <Box sx={{ width: 34, height: 34, borderRadius: 2, display: "grid", placeItems: "center", color: ui.accentSoft, bgcolor: "rgba(139,92,246,0.16)", border: "1px solid rgba(139,92,246,0.3)", "& svg": { fontSize: 18 } }}>
                      {p.icon}
                    </Box>
                    {p.text}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Auth card */}
            <Box
              component="form"
              noValidate
              autoComplete="off" // start empty: no saved logins filled in on page load
              onSubmit={handleSubmit}
              sx={{
                width: "100%",
                maxWidth: 440,
                mx: "auto",
                p: { xs: 3, sm: 4 },
                borderRadius: 5,
                bgcolor: "rgba(18,14,26,0.78)",
                backdropFilter: "blur(16px)",
                border: `1px solid ${ui.border}`,
                boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
                animation: "fade-up .6s ease .1s both",
              }}
            >
              {/* Login / Register switch */}
              <Box role="tablist" sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", p: 0.5, mb: 3, borderRadius: 99, bgcolor: "rgba(255,255,255,0.05)", border: `1px solid ${ui.border}` }}>
                {[
                  { label: "Log in", value: false },
                  { label: "Sign up", value: true },
                ].map(t => (
                  <ButtonBase
                    key={t.label}
                    role="tab"
                    aria-selected={isRegister === t.value}
                    onClick={() => switchMode(t.value)}
                    sx={{
                      py: 1,
                      borderRadius: 99,
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      color: isRegister === t.value ? "#fff" : ui.muted,
                      background: isRegister === t.value ? ui.gradient : "transparent",
                      transition: "all .2s ease",
                    }}
                  >
                    {t.label}
                  </ButtonBase>
                ))}
              </Box>

              <Typography sx={{ fontWeight: 800, fontSize: "1.5rem" }}>{isRegister ? "Create your account" : "Welcome back"}</Typography>
              <Typography sx={{ color: ui.muted, fontSize: "0.9rem", mt: 0.5, mb: 3 }}>
                {isRegister ? "It takes less than a minute. Then grab your seats." : "Log in to book tickets and see your bookings."}
              </Typography>

              {isRegister && <TextField label="Username" placeholder="Pick a username" autoComplete="off" {...fieldProps("username")} />}
              <TextField label="Email" placeholder="you@example.com" type="email" autoComplete="off" {...fieldProps("email")} />
              <TextField
                label="Password"
                placeholder={isRegister ? "At least 6 characters" : "Your password"}
                type={showPassword ? "text" : "password"}
                // "new-password" stops Chrome filling a saved password when the page loads.
                autoComplete="new-password"
                {...fieldProps("password")}
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(s => !s)} edge="end" size="small">
                          {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {error && (
                <Box role="alert" sx={{ display: "flex", gap: 1, alignItems: "flex-start", p: 1.5, mb: 2, borderRadius: 2.5, color: "#fecaca", bgcolor: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", fontSize: "0.86rem" }}>
                  <ErrorOutlineRoundedIcon sx={{ fontSize: 19, color: ui.danger, mt: 0.1 }} />
                  {error}
                </Box>
              )}

              <Button type="submit" disabled={submitting} fullWidth sx={{ ...primaryButtonSx, py: 1.4, fontSize: "1rem", "&.Mui-disabled": { color: "rgba(255,255,255,0.75)", opacity: 0.8 } }}>
                {submitting ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : isRegister ? "Create account" : "Log in"}
              </Button>

              <Typography sx={{ textAlign: "center", fontSize: "0.88rem", color: ui.muted, mt: 2.5 }}>
                {isRegister ? "Already have an account?" : "New to Evenza?"}{" "}
                <ButtonBase onClick={() => switchMode(!isRegister)} sx={{ color: ui.accentSoft, fontWeight: 700, fontSize: "inherit", verticalAlign: "baseline", "&:hover": { color: "#fff" } }}>
                  {isRegister ? "Log in" : "Create an account"}
                </ButtonBase>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ---------- Highlights ---------- */}
      <Box component="section" sx={{ maxWidth: 1180, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 6, md: 9 } }}>
        <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, mb: 3 }}>
          <Box>
            <Typography sx={eyebrowSx}>Event highlights</Typography>
            <Typography component="h2" sx={{ fontSize: { xs: "1.7rem", md: "2.3rem" }, fontWeight: 800, mt: 0.5 }}>
              Moments you could be part of
            </Typography>
          </Box>
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1 }}>
            {([-1, 1] as const).map(dir => (
              <IconButton
                key={dir}
                aria-label={dir === -1 ? "Scroll left" : "Scroll right"}
                onClick={() => scrollRail(dir)}
                sx={{ color: "#fff", border: `1px solid ${ui.border}`, bgcolor: ui.surface, "&:hover": { bgcolor: ui.surfaceHover, borderColor: "rgba(167,139,250,0.5)" } }}
              >
                {dir === -1 ? <ChevronLeftRoundedIcon /> : <ChevronRightRoundedIcon />}
              </IconButton>
            ))}
          </Box>
        </Box>

        {/* Scroll-snap rail; scrollbar hidden, edges fade out */}
        <Box
          ref={railRef}
          sx={{
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: { xs: "78%", sm: "calc((100% - 16px) / 2)", md: "calc((100% - 32px) / 3)" },
            gap: 2,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            maskImage: { xs: "linear-gradient(90deg, #000 85%, transparent)", md: "none" },
            pb: 1,
          }}
        >
          {HIGHLIGHTS.map(h => (
            <Box
              key={h.id}
              className="tap"
              sx={{
                position: "relative",
                scrollSnapAlign: "start",
                aspectRatio: "4 / 3",
                borderRadius: 4,
                overflow: "hidden",
                border: `1px solid ${ui.border}`,
                backgroundColor: "#1d1629",
                backgroundImage: `linear-gradient(180deg, transparent 55%, rgba(13,10,20,0.85)), url('${px(h.id, 800)}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transition: "transform .3s ease, border-color .3s ease",
                "&:hover": { transform: "translateY(-4px)", borderColor: "rgba(167,139,250,0.45)" },
              }}
            >
              <Box sx={{ position: "absolute", left: 14, bottom: 14, px: 1.25, py: 0.5, borderRadius: 99, fontSize: "0.8rem", fontWeight: 700, bgcolor: "rgba(13,10,20,0.7)", backdropFilter: "blur(6px)", border: `1px solid ${ui.border}` }}>
                {h.label}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <SiteFooter />
    </Box>
  );
}

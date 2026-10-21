"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Box, Button, Typography } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
// Swiper ships its layout as CSS; without these the slides stack and overlap.
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import MusicNoteRoundedIcon from "@mui/icons-material/MusicNoteRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import CelebrationRoundedIcon from "@mui/icons-material/CelebrationRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import EventSeatRoundedIcon from "@mui/icons-material/EventSeatRounded";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PublicNavbar from "../components/PublicNavbar";
import SiteFooter from "../components/SiteFooter";
import { useAuth } from "../context/AuthContext";
import { cardSx, eyebrowSx, ghostButtonSx, primaryButtonSx, ui } from "../components/theme";

const px = (id: number, w = 1200) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

const HERO = px(1190297, 1800);
const COLLAGE = [px(2952834, 900), px(1114425, 600), px(2608516, 600)];
// Six slides so loop mode always has more slides than fit on screen.
const GALLERY = [167491, 2952834, 1114425, 2608516, 1540406, 5475779].map(id => px(id, 900));

const CATEGORIES = [
  { label: "Concerts", icon: <MusicNoteRoundedIcon /> },
  { label: "Workshops", icon: <BuildRoundedIcon /> },
  { label: "Festivals", icon: <CelebrationRoundedIcon /> },
  { label: "Meetups", icon: <GroupsRoundedIcon /> },
  { label: "Expos", icon: <StorefrontRoundedIcon /> },
];

const STEPS = [
  { icon: <TravelExploreRoundedIcon />, title: "Discover", text: "Browse upcoming events by date, venue and price, all in one place." },
  { icon: <EventSeatRoundedIcon />, title: "Pick your seats", text: "Choose exactly where you sit on a live seat map for the show date you want." },
  { icon: <MarkEmailReadRoundedIcon />, title: "Get your ticket", text: "Check out in seconds. Your confirmation lands in your inbox and in My Bookings." },
];

const AUDIENCES = [
  {
    eyebrow: "For fans",
    title: "Book without the hassle",
    points: ["Live seat map for every show date", "Instant email confirmation", "All your tickets in My Bookings", "Upcoming and past events at a glance"],
  },
  {
    eyebrow: "For organizers",
    title: "Run your events in one place",
    points: ["List events with posters, dates and pricing", "Dashboard for sign-ups, bookings and revenue", "Track seats sold for every show", "Manage and cancel bookings"],
  },
];

function SectionHeading({ eyebrow, title, center }: { eyebrow: string; title: ReactNode; center?: boolean }) {
  return (
    <Box sx={{ textAlign: center ? "center" : "left", mb: { xs: 3, md: 4 } }}>
      <Typography sx={eyebrowSx}>{eyebrow}</Typography>
      <Typography component="h2" sx={{ fontSize: { xs: "1.7rem", md: "2.3rem" }, fontWeight: 800, mt: 0.75, lineHeight: 1.15 }}>
        {title}
      </Typography>
    </Box>
  );
}

const photoSx = (src: string) => ({
  backgroundImage: `url('${src}')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundColor: "#1d1629",
  borderRadius: 4,
  border: `1px solid ${ui.border}`,
});

export default function AboutPage() {
  const { user } = useAuth();
  const browseHref = user ? "/events" : "/";

  return (
    <Box sx={{ minHeight: "100vh", color: ui.text, background: ui.pageBg }}>
      <PublicNavbar />

      <Box component="main" className="stagger" sx={{ maxWidth: 1180, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, pt: { xs: 3, md: 4 }, pb: 8 }}>
        {/* Hero */}
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 5,
            minHeight: { xs: 380, md: 460 },
            display: "flex",
            alignItems: "flex-end",
            border: `1px solid ${ui.border}`,
            backgroundColor: "#1e1030",
            backgroundImage: `linear-gradient(180deg, rgba(13,10,20,0.15) 0%, rgba(13,10,20,0.6) 55%, rgba(13,10,20,0.95) 100%), url('${HERO}')`,
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
            mb: { xs: 6, md: 9 },
          }}
        >
          <Box sx={{ p: { xs: 3, md: 6 }, maxWidth: 760 }}>
            <Typography sx={{ ...eyebrowSx, color: ui.gold }}>About Evenza</Typography>
            <Typography component="h1" sx={{ fontSize: { xs: "2.1rem", md: "3.4rem" }, fontWeight: 800, lineHeight: 1.08, mt: 1, letterSpacing: "-0.5px" }}>
              Every great night out starts with{" "}
              <Box component="span" sx={{ background: "linear-gradient(90deg, #c4b5fd, #f472b6, #fcd34d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                a ticket
              </Box>
            </Typography>
            <Typography sx={{ color: "rgba(237,233,254,0.85)", mt: 2, fontSize: { xs: "0.95rem", md: "1.1rem" }, lineHeight: 1.7, maxWidth: 620 }}>
              Evenza is your destination to explore and experience events of every kind. From concerts and workshops to community
              gatherings, we connect passionate organizers with enthusiastic attendees.
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, mt: 3.5, flexWrap: "wrap" }}>
              <Button component={Link} href={browseHref} sx={primaryButtonSx}>
                Browse events
              </Button>
              <Button component={Link} href="/contact" sx={{ ...ghostButtonSx, bgcolor: "rgba(13,10,20,0.55)", backdropFilter: "blur(6px)" }}>
                Contact us
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Categories */}
        <Box sx={{ mb: { xs: 7, md: 10 } }}>
          <SectionHeading eyebrow="What you'll find" title="Something for every crowd" center />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", sm: "repeat(3, minmax(0,1fr))", md: "repeat(5, minmax(0,1fr))" }, gap: 2 }}>
            {CATEGORIES.map(c => (
              <Box
                key={c.label}
                className="tap"
                sx={{
                  ...cardSx,
                  py: 3,
                  px: 2,
                  textAlign: "center",
                  transition: "transform .2s ease, border-color .2s ease",
                  "&:hover": { transform: "translateY(-4px)", borderColor: "rgba(167,139,250,0.4)" },
                }}
              >
                <Box sx={{ width: 48, height: 48, mx: "auto", mb: 1.5, borderRadius: 3, display: "grid", placeItems: "center", color: ui.accentSoft, bgcolor: "rgba(139,92,246,0.14)", border: "1px solid rgba(139,92,246,0.3)" }}>
                  {c.icon}
                </Box>
                <Typography sx={{ fontWeight: 700 }}>{c.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Mission */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", md: "minmax(0,1fr) minmax(0,1fr)" }, gap: { xs: 4, md: 6 }, alignItems: "center", mb: { xs: 7, md: 10 } }}>
          <Box>
            <SectionHeading eyebrow="Our mission" title="Booking should feel as exciting as the show" />
            <Typography sx={{ color: ui.muted, lineHeight: 1.85, fontSize: { xs: "0.95rem", md: "1.02rem" } }}>
              We believe booking an event should be as exciting as attending it. That&apos;s why Evenza is built to make the process
              seamless, fun and stress-free. Whether you&apos;re joining a concert, a workshop, a conference or a local gathering, attendees
              get a smooth experience while organizers get the tools they need to bring their events to life.
            </Typography>
          </Box>
          {/* Collage: one tall photo + two stacked, all on the same grid so edges line up */}
          <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)", gridTemplateRows: "1fr 1fr", gap: 1.5, height: { xs: 300, sm: 380, md: 420 } }}>
            <Box role="img" aria-label="Crowd at a concert" sx={{ ...photoSx(COLLAGE[0]), gridRow: "1 / span 2" }} />
            <Box role="img" aria-label="Event venue" sx={photoSx(COLLAGE[1])} />
            <Box role="img" aria-label="Audience enjoying a show" sx={photoSx(COLLAGE[2])} />
          </Box>
        </Box>

        {/* How it works */}
        <Box sx={{ mb: { xs: 7, md: 10 } }}>
          <SectionHeading eyebrow="How it works" title="From browsing to your seat in three steps" center />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", md: "repeat(3, minmax(0,1fr))" }, gap: 2 }}>
            {STEPS.map((s, i) => (
              <Box key={s.title} sx={{ ...cardSx, p: 3, position: "relative", overflow: "hidden" }}>
                <Typography sx={{ position: "absolute", right: 16, top: 6, fontSize: "4.5rem", fontWeight: 800, lineHeight: 1, color: "rgba(255,255,255,0.05)" }}>
                  {i + 1}
                </Typography>
                <Box sx={{ width: 46, height: 46, borderRadius: 3, display: "grid", placeItems: "center", color: "#fff", background: ui.gradient, boxShadow: "0 8px 20px rgba(124,58,237,0.35)", mb: 2 }}>
                  {s.icon}
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>{s.title}</Typography>
                <Typography sx={{ color: ui.muted, fontSize: "0.9rem", mt: 0.75, lineHeight: 1.7 }}>{s.text}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Audiences */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", md: "repeat(2, minmax(0,1fr))" }, gap: 2, mb: { xs: 7, md: 10 } }}>
          {AUDIENCES.map((a, i) => (
            <Box
              key={a.eyebrow}
              sx={{
                ...cardSx,
                p: { xs: 3, md: 4 },
                background: i === 0 ? "linear-gradient(135deg, rgba(124,58,237,0.22), rgba(255,255,255,0.02))" : "linear-gradient(135deg, rgba(219,39,119,0.18), rgba(255,255,255,0.02))",
              }}
            >
              <Typography sx={{ ...eyebrowSx, color: i === 0 ? ui.accentSoft : "#f9a8d4" }}>{a.eyebrow}</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: "1.4rem", mt: 0.5, mb: 2 }}>{a.title}</Typography>
              <Box component="ul" sx={{ listStyle: "none", display: "grid", gap: 1.25 }}>
                {a.points.map(p => (
                  <Box component="li" key={p} sx={{ display: "flex", alignItems: "center", gap: 1.25, color: ui.muted, fontSize: "0.92rem" }}>
                    <CheckCircleRoundedIcon sx={{ fontSize: 19, color: i === 0 ? ui.accentSoft : "#f472b6" }} />
                    {p}
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Gallery */}
        <Box sx={{ mb: { xs: 7, md: 10 } }}>
          <SectionHeading eyebrow="Gallery" title="Memorable moments" center />
          <Box
            sx={{
              // Swiper reads these CSS variables for its arrows and dots.
              "--swiper-theme-color": "#a78bfa",
              "--swiper-navigation-size": "20px",
              "--swiper-pagination-bullet-inactive-color": "#ffffff",
              "--swiper-pagination-bullet-inactive-opacity": "0.3",
              "& .swiper": { pb: 5 },
              "& .swiper-button-prev, & .swiper-button-next": {
                width: 42,
                height: 42,
                top: "calc(50% - 20px)",
                borderRadius: "50%",
                bgcolor: "rgba(13,10,20,0.7)",
                backdropFilter: "blur(6px)",
                border: `1px solid ${ui.border}`,
                display: { xs: "none", sm: "flex" },
              },
            }}
          >
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              spaceBetween={16}
              slidesPerView={1.15}
              centeredSlides={false}
              breakpoints={{ 600: { slidesPerView: 2, spaceBetween: 18 }, 1000: { slidesPerView: 3, spaceBetween: 20 } }}
              autoplay={{ delay: 3200, disableOnInteraction: false, pauseOnMouseEnter: true }}
              loop
              navigation
              pagination={{ clickable: true }}
            >
              {GALLERY.map((src, i) => (
                <SwiperSlide key={src}>
                  <Box
                    role="img"
                    aria-label={`Event moment ${i + 1}`}
                    sx={{
                      ...photoSx(src),
                      aspectRatio: "4 / 3",
                      width: "100%",
                      transition: "transform .3s ease",
                      "&:hover": { transform: "scale(1.02)" },
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        </Box>

        {/* CTA */}
        <Box
          sx={{
            ...cardSx,
            p: { xs: 3, md: 5 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 3,
            background: "radial-gradient(500px 220px at 90% 0%, rgba(219,39,119,0.3), transparent 70%), linear-gradient(135deg, rgba(124,58,237,0.35), rgba(30,27,75,0.3))",
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.5rem", md: "1.9rem" } }}>Your next show is waiting</Typography>
            <Typography sx={{ color: ui.muted, mt: 0.75 }}>Find an event, pick your seats and you&apos;re in.</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button component={Link} href={browseHref} sx={primaryButtonSx}>
              Browse events
            </Button>
            <Button component={Link} href="/contact" sx={ghostButtonSx}>
              Talk to us
            </Button>
          </Box>
        </Box>
      </Box>

      <SiteFooter />
    </Box>
  );
}

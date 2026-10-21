"use client";

import { FormEvent, ReactNode, useState } from "react";
import Link from "next/link";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, ButtonBase, CircularProgress, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import { useToast } from "../components/ToastProvider";
import PublicNavbar from "../components/PublicNavbar";
import SiteFooter from "../components/SiteFooter";
import { cardSx, darkFieldSx, eyebrowSx, primaryButtonSx, ui } from "../components/theme";

// Change contact details here; everything on the page reads from this.
const CONTACT = {
  email: "savyaak07@gmail.com",
  phone: "12345678", // placeholder — replace with the real support number before launch
  hours: "Mon – Sat · 10 am – 7 pm IST",
};

const TOPICS = ["Booking help", "Hosting an event", "Feedback", "Something else"];

const FAQS = [
  {
    q: "Where can I find my tickets?",
    a: "Log in and open My Bookings. Every booking shows the event, date, your seats and a booking ID.",
  },
  {
    q: "Can I cancel or change a booking?",
    a: "Email us with your booking ID and we'll take care of it. Cancelled seats go straight back on sale.",
  },
  {
    q: "I want to list my event on Evenza.",
    a: "Pick “Hosting an event” in the form below and tell us about the show: dates, venue and seats. We'll get back to you within a day.",
  },
];

function ContactCard({ icon, label, value, hint, href, action }: { icon: ReactNode; label: string; value: string; hint: string; href?: string; action?: ReactNode }) {
  const body = (
    <>
      <Box sx={{ width: 46, height: 46, borderRadius: 3, display: "grid", placeItems: "center", color: "#fff", background: ui.gradient, boxShadow: "0 8px 20px rgba(124,58,237,0.35)", mb: 2 }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: "0.78rem", color: ui.faint, fontWeight: 600, letterSpacing: 1 }}>{label.toUpperCase()}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5, minWidth: 0 }}>
        <Typography sx={{ fontSize: "1.05rem", fontWeight: 700, overflowWrap: "anywhere" }}>{value}</Typography>
        {href && <ArrowOutwardRoundedIcon sx={{ fontSize: 16, color: ui.accentSoft, flexShrink: 0 }} />}
      </Box>
      <Typography sx={{ fontSize: "0.82rem", color: ui.muted, mt: 0.75 }}>{hint}</Typography>
    </>
  );

  return (
    <Box
      className="tap"
      sx={{
        ...cardSx,
        position: "relative",
        p: 3,
        transition: "transform .2s ease, border-color .2s ease",
        "&:hover": { transform: "translateY(-4px)", borderColor: "rgba(167,139,250,0.4)" },
      }}
    >
      {href ? (
        <Box component="a" href={href} sx={{ display: "block", color: "inherit", textDecoration: "none" }}>
          {body}
        </Box>
      ) : (
        body
      )}
      {action && <Box sx={{ position: "absolute", top: 16, right: 16 }}>{action}</Box>}
    </Box>
  );
}

export default function ContactPage() {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [topic, setTopic] = useState(TOPICS[0]);
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const errors = {
    name: !form.name.trim() ? "Tell us your name" : "",
    email: !/^\S+@\S+\.\S+$/.test(form.email) ? "Enter a valid email so we can reply" : "",
    message: form.message.trim().length < 10 ? "A few more words, please (10+ characters)" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      toast.success("Email copied", CONTACT.email);
    } catch {
      toast.error("Couldn't copy", "Your browser blocked clipboard access.");
    }
  };

  // Posts to the backend, which emails the admin and sends the visitor a confirmation.
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched(true);
    if (hasErrors || sending) return;
    const website = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    setSending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), topic, message: form.message.trim(), website }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 404) throw new Error("Our message service is offline right now.");
      if (!res.ok) throw new Error(data.message || "Please try again in a moment.");
      setSentTo(form.email.trim());
      toast.success("Message sent", "We'll reply to your email soon.");
    } catch (err) {
      toast.error("Couldn't send your message", err instanceof Error ? `${err.message} You can also email ${CONTACT.email}.` : undefined);
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setForm({ name: "", email: "", message: "" });
    setTopic(TOPICS[0]);
    setTouched(false);
    setSentTo(null);
  };

  const field = (name: keyof typeof form) => ({
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [name]: e.target.value })),
    error: touched && !!errors[name],
    helperText: touched ? errors[name] || " " : " ",
    fullWidth: true,
    sx: darkFieldSx,
  });

  return (
    <Box sx={{ minHeight: "100vh", color: ui.text, background: ui.pageBg }}>
      <PublicNavbar />

      <Box component="main" className="stagger" sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, pt: { xs: 5, md: 8 }, pb: 8 }}>
        {/* Hero */}
        <Box sx={{ textAlign: "center", maxWidth: 640, mx: "auto", mb: { xs: 5, md: 7 } }}>
          <Typography sx={eyebrowSx}>Contact</Typography>
          <Typography component="h1" sx={{ fontSize: { xs: "2.1rem", md: "3.2rem" }, fontWeight: 800, lineHeight: 1.1, mt: 1, letterSpacing: "-0.5px" }}>
            We&apos;re here to help{" "}
            <Box component="span" sx={{ background: "linear-gradient(90deg, #c4b5fd, #f472b6, #fcd34d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              before the show
            </Box>
          </Typography>
          <Typography sx={{ color: ui.muted, mt: 2, fontSize: { xs: "0.95rem", md: "1.05rem" } }}>
            Questions about a booking, want to host your event, or just have feedback? Reach out and a real person will reply.
          </Typography>
        </Box>

        {/* Ways to reach us */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "repeat(3, minmax(0,1fr))" }, gap: 2, mb: { xs: 5, md: 7 } }}>
          <ContactCard
            icon={<MailOutlineRoundedIcon />}
            label="Email us"
            value={CONTACT.email}
            hint="Best for booking issues. We reply within a day."
            href={`mailto:${CONTACT.email}`}
            action={
              <Tooltip title="Copy email">
                <IconButton aria-label="Copy email" onClick={copyEmail} size="small" sx={{ color: ui.faint, "&:hover": { color: "#fff" } }}>
                  <ContentCopyRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            }
          />
          <ContactCard icon={<PhoneInTalkRoundedIcon />} label="Call us" value={CONTACT.phone} hint="For urgent help on the day of an event." href={`tel:${CONTACT.phone}`} />
          <ContactCard icon={<ScheduleRoundedIcon />} label="Support hours" value={CONTACT.hours} hint="Messages sent after hours are answered next morning." />
        </Box>

        {/* Form + FAQ */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", md: "minmax(0,1.15fr) minmax(0,1fr)" }, gap: 3, alignItems: "start" }}>
          {sentTo ? (
            <Box sx={{ ...cardSx, p: { xs: 3, md: 5 }, textAlign: "center", animation: "fade-up .4s ease both" }}>
              <Box sx={{ width: 64, height: 64, mx: "auto", mb: 2.5, borderRadius: "50%", display: "grid", placeItems: "center", color: "#fff", background: "linear-gradient(135deg, #34d399, #059669)", boxShadow: "0 10px 30px rgba(52,211,153,0.35)" }}>
                <CheckRoundedIcon sx={{ fontSize: 34 }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: "1.5rem" }}>Message sent!</Typography>
              <Typography sx={{ color: ui.muted, mt: 1, maxWidth: 380, mx: "auto" }}>
                Thanks for reaching out. We&apos;ve emailed a copy to <b style={{ color: ui.text }}>{sentTo}</b> and will reply there soon.
              </Typography>
              <Button onClick={reset} sx={{ ...primaryButtonSx, mt: 3 }}>
                Send another message
              </Button>
            </Box>
          ) : (
          <Box component="form" noValidate onSubmit={submit} sx={{ ...cardSx, p: { xs: 2.5, md: 4 } }}>
            {/* Honeypot: hidden from people, bots fill it in and get ignored */}
            <Box component="input" name="website" tabIndex={-1} autoComplete="off" aria-hidden sx={{ position: "absolute", left: "-10000px", width: 1, height: 1, opacity: 0 }} />
            <Typography sx={eyebrowSx}>Send a message</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: "1.35rem", mt: 0.5, mb: 2.5 }}>Tell us what you need</Typography>

            <Typography sx={{ fontSize: "0.8rem", color: ui.faint, mb: 1 }}>What&apos;s it about?</Typography>
            <Box role="radiogroup" sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2.5 }}>
              {TOPICS.map(t => (
                <ButtonBase
                  key={t}
                  role="radio"
                  aria-checked={topic === t}
                  onClick={() => setTopic(t)}
                  sx={{
                    px: 1.75,
                    py: 0.8,
                    borderRadius: 99,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: topic === t ? "#fff" : ui.muted,
                    background: topic === t ? ui.gradient : "transparent",
                    border: `1px solid ${topic === t ? "transparent" : ui.border}`,
                  }}
                >
                  {t}
                </ButtonBase>
              ))}
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "minmax(0,1fr) minmax(0,1fr)" }, columnGap: 2 }}>
              <TextField label="Your name" autoComplete="name" {...field("name")} />
              <TextField label="Email" type="email" autoComplete="email" {...field("email")} />
            </Box>
            <TextField label="Message" placeholder="Include your booking ID if it's about a booking" multiline minRows={5} {...field("message")} />

            <Button
              type="submit"
              disabled={sending}
              endIcon={sending ? undefined : <SendRoundedIcon />}
              fullWidth
              sx={{ ...primaryButtonSx, mt: 1, py: 1.4, "&.Mui-disabled": { color: "rgba(255,255,255,0.75)", opacity: 0.75 } }}
            >
              {sending ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Send message"}
            </Button>
            <Typography sx={{ fontSize: "0.75rem", color: ui.faint, mt: 1.25, textAlign: "center" }}>
              We usually reply within a day, by email.
            </Typography>
          </Box>
          )}

          <Box>
            <Typography sx={eyebrowSx}>Quick answers</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: "1.35rem", mt: 0.5, mb: 2 }}>Frequently asked</Typography>
            <Box sx={{ display: "grid", gap: 1.25 }}>
              {FAQS.map(f => (
                <Accordion
                  key={f.q}
                  disableGutters
                  elevation={0}
                  sx={{
                    ...cardSx,
                    color: ui.text,
                    "&::before": { display: "none" },
                    "&.Mui-expanded": { borderColor: "rgba(167,139,250,0.35)" },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ color: ui.accentSoft }} />} sx={{ px: 2.5, py: 0.5 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>{f.q}</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2.25 }}>
                    <Typography sx={{ color: ui.muted, fontSize: "0.88rem", lineHeight: 1.7 }}>{f.a}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>

            <Box sx={{ ...cardSx, mt: 2.5, p: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap", background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(219,39,119,0.12))" }}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>Ready for your next show?</Typography>
                <Typography sx={{ fontSize: "0.82rem", color: ui.muted }}>Log in to browse events and pick your seats.</Typography>
              </Box>
              <Button component={Link} href="/" sx={primaryButtonSx}>
                Browse events
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <SiteFooter />
    </Box>
  );
}

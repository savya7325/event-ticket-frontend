"use client";

import { ReactNode, useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { Box, Button, ButtonBase, CircularProgress, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import EventSeatRoundedIcon from "@mui/icons-material/EventSeatRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import dayjs, { Dayjs } from "dayjs";
import { createEvent } from "../auth/api";
import { useAuth } from "../context/AuthContext";
import ClientDatePicker from "./ClientDatePicker";
import { useToast } from "../components/ToastProvider";
import { MAX_CAPACITY } from "../components/seats";
import { darkFieldSx, ghostButtonSx, primaryButtonSx, ui } from "../components/theme";

// Editing keeps the current poster unless a new one is chosen.
const makeSchema = (mode: "create" | "edit") =>
  Yup.object({
    title: Yup.string().required("Title is required").min(3, "Title must be at least 3 characters"),
    description: Yup.string().required("Description is required").min(10, "Description must be at least 10 characters"),
    dates: Yup.array().of(Yup.date()).min(1, "Pick at least one show date").required("Pick at least one show date"),
    location: Yup.string().required("Location is required"),
    price: Yup.number()
      .transform(value => (value === "" ? undefined : Number(value)))
      .required("Price is required")
      .min(0, "Price can't be negative"),
    ticketsAvailable: Yup.number()
      .transform(value => (value === "" ? undefined : Number(value)))
      .required("Seats per show is required")
      .min(1, "At least 1 seat")
      .max(MAX_CAPACITY, `The seat map supports up to ${MAX_CAPACITY} seats (rows A–Z)`)
      .integer("Must be a whole number"),
    image: mode === "create" ? Yup.mixed().required("Add a poster image") : Yup.mixed().nullable(),
  });

interface EventFormValues {
  title: string;
  description: string;
  dates: string[];
  location: string;
  price: number | "";
  ticketsAvailable: number | "";
  image: File | null;
}

export interface EventFormInitial {
  title: string;
  description: string;
  dates: string[]; // any date strings; normalised to YYYY-MM-DD
  location?: string;
  price?: number;
  ticketsAvailable?: number;
  imageUrl?: string; // current poster, shown until replaced
}

interface EventFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
  compact?: boolean; // rendered inside a drawer
  mode?: "create" | "edit";
  initial?: EventFormInitial;
  // Edit mode: saves the FormData and resolves true on success (the caller shows toasts).
  onSave?: (data: FormData) => Promise<boolean>;
}

const emptyValues: EventFormValues = {
  title: "",
  description: "",
  dates: [],
  location: "",
  price: "",
  ticketsAvailable: "",
  image: null,
};

function Section({ step, title, hint, children }: { step: number; title: string; hint?: string; children: ReactNode }) {
  return (
    <Box component="section" sx={{ display: "grid", gap: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            fontSize: "0.72rem",
            fontWeight: 800,
            color: ui.accentSoft,
            bgcolor: "rgba(139,92,246,0.16)",
            border: "1px solid rgba(139,92,246,0.35)",
          }}
        >
          {step}
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>{title}</Typography>
        {hint && <Typography sx={{ fontSize: "0.75rem", color: ui.faint, ml: "auto" }}>{hint}</Typography>}
      </Box>
      {children}
    </Box>
  );
}

function PosterDrop({ file, existingUrl, error, onChange }: { file: File | null; existingUrl?: string; error?: string; onChange: (f: File | null) => void }) {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!file) return setFilePreview(null);
    const url = URL.createObjectURL(file);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // A newly picked file wins; otherwise show the event's current poster.
  const preview = filePreview ?? existingUrl ?? null;

  const pick = (f?: File | null) => {
    if (f && f.type.startsWith("image/")) onChange(f);
  };

  return (
    <Box>
      <Box
        component="label"
        onDragOver={e => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files?.[0]);
        }}
        sx={{
          position: "relative",
          display: "grid",
          placeItems: "center",
          height: 190,
          borderRadius: 3.5,
          cursor: "pointer",
          overflow: "hidden",
          textAlign: "center",
          border: `1.5px dashed ${error ? ui.danger : dragging ? ui.accent : "rgba(255,255,255,0.16)"}`,
          bgcolor: dragging ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.03)",
          backgroundImage: preview ? `linear-gradient(to top, rgba(13,10,20,0.85), rgba(13,10,20,0.1) 60%), url('${preview}')` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "all .15s ease",
          "&:hover": { borderColor: ui.accent },
        }}
      >
        <input type="file" hidden accept="image/*" onChange={e => pick(e.currentTarget.files?.[0])} />
        {preview ? (
          <Box sx={{ position: "absolute", left: 14, right: 14, bottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }} noWrap>
              {file?.name ?? "Current poster"}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: ui.accentSoft, flexShrink: 0 }}>Replace</Typography>
          </Box>
        ) : (
          <Box sx={{ px: 3 }}>
            <Box sx={{ width: 48, height: 48, mx: "auto", mb: 1.25, borderRadius: "50%", display: "grid", placeItems: "center", color: ui.accentSoft, bgcolor: "rgba(139,92,246,0.14)" }}>
              <CloudUploadRoundedIcon />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
              Drop your poster here or <Box component="span" sx={{ color: ui.accentSoft }}>browse</Box>
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: ui.faint, mt: 0.5 }}>JPG or PNG · landscape works best</Typography>
          </Box>
        )}
      </Box>
      {filePreview && (
        <Button size="small" onClick={() => onChange(null)} sx={{ mt: 0.75, textTransform: "none", color: ui.faint, "&:hover": { color: ui.danger } }}>
          {existingUrl ? "Keep current poster" : "Remove poster"}
        </Button>
      )}
      {error && <Typography sx={{ color: ui.danger, fontSize: "0.75rem", mt: 0.75, ml: 0.5 }}>{error}</Typography>}
    </Box>
  );
}

const EventForm = ({ onSuccess, onClose, compact, mode = "create", initial, onSave }: EventFormProps = {}) => {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const editing = mode === "edit";

  const initialValues: EventFormValues = initial
    ? {
        title: initial.title,
        description: initial.description,
        dates: [...new Set(initial.dates.map(d => dayjs(d).format("YYYY-MM-DD")))].sort(),
        location: initial.location ?? "",
        price: initial.price ?? "",
        ticketsAvailable: initial.ticketsAvailable ?? "",
        image: null,
      }
    : emptyValues;

  const handleSubmit = async (values: EventFormValues, { setSubmitting, resetForm, setErrors }: any) => {
    try {
      const token = user?.token;
      if (!token) {
        toast.error("Please log in again", "You must be logged in as admin to manage events.");
        router.push("/");
        return;
      }

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      values.dates.forEach(date => formData.append("dates[]", date));
      formData.append("location", values.location);
      formData.append("price", values.price.toString());
      // Seats per show. ticketsAvailable is sent too for older backends.
      formData.append("capacity", values.ticketsAvailable.toString());
      formData.append("ticketsAvailable", values.ticketsAvailable.toString());
      if (values.image) formData.append("image", values.image);

      if (editing) {
        // The caller saves and shows the success / error toast.
        if (onSave && (await onSave(formData))) onSuccess?.();
        return;
      }

      await createEvent(formData, token);
      toast.success("Event added successfully", `"${values.title}" is now live for bookings.`);
      resetForm();
      if (onSuccess) onSuccess();
      else router.push("/events");
    } catch (error: any) {
      console.error("Error creating event:", error);
      if (Array.isArray(error.response?.data?.errors)) {
        const formikErrors: any = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.field) formikErrors[err.field] = err.message;
        });
        setErrors(formikErrors);
      } else {
        toast.error("Couldn't add event", error.response?.data?.message || "Please check the details and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;
  if (!user || !isAdmin) {
    return (
      <Box sx={{ p: 4, textAlign: "center", color: ui.text }}>
        <Typography sx={{ fontWeight: 800, fontSize: "1.2rem", color: ui.danger }}>Admins only</Typography>
        <Typography sx={{ color: ui.muted, mt: 1 }}>You must be logged in as an admin to create events.</Typography>
        <Button onClick={() => router.push("/")} sx={{ ...primaryButtonSx, mt: 3 }}>
          Go to login
        </Button>
      </Box>
    );
  }

  const form = (
    <Formik initialValues={initialValues} validationSchema={makeSchema(mode)} onSubmit={handleSubmit}>
      {({ values, setFieldValue, setFieldTouched, errors, touched, submitCount, isSubmitting }) => {
        const show = (name: keyof EventFormValues) => (touched[name] || submitCount > 0) && (errors[name] as string | undefined);
        const addDate = (d: Dayjs | null) => {
          if (!d || !d.isValid()) return;
          const s = d.format("YYYY-MM-DD");
          if (!values.dates.includes(s)) setFieldValue("dates", [...values.dates, s].sort());
        };

        return (
          <Form style={{ display: "flex", flexDirection: "column", height: "100%", color: ui.text }} noValidate>
            {/* Header */}
            <Box
              sx={{
                position: "relative",
                px: 3.5,
                pt: 3.5,
                pb: 3,
                borderBottom: `1px solid ${ui.border}`,
                background: "radial-gradient(420px 160px at 100% 0%, rgba(219,39,119,0.25), transparent 70%), linear-gradient(160deg, rgba(124,58,237,0.28), rgba(124,58,237,0) 70%)",
              }}
            >
              {onClose && (
                // Back chevron on phones, where the drawer fills the screen
                <ButtonBase
                  onClick={onClose}
                  sx={{ display: { xs: "inline-flex", sm: "none" }, gap: 0.5, mb: 2, ml: -0.5, px: 0.75, py: 0.5, borderRadius: 2, color: ui.muted, fontSize: "0.85rem", fontWeight: 600 }}
                >
                  <ArrowBackIosNewRoundedIcon sx={{ fontSize: 15 }} /> Back
                </ButtonBase>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: ui.gold, fontSize: "0.7rem", fontWeight: 700, letterSpacing: 2.5 }}>
                <AutoAwesomeRoundedIcon sx={{ fontSize: 15 }} /> {editing ? "EDITING LISTING" : "NEW LISTING"}
              </Box>
              <Typography sx={{ fontSize: "1.6rem", fontWeight: 800, mt: 0.75, lineHeight: 1.2, pr: { sm: 5 } }} noWrap={editing}>
                {editing ? `Edit ${initial?.title ?? "event"}` : "Create an event"}
              </Typography>
              <Typography sx={{ color: ui.muted, fontSize: "0.88rem", mt: 0.5 }}>
                {editing ? "Changes go live as soon as you save." : "Fill in the details and it goes on sale straight away."}
              </Typography>
              {onClose && (
                <IconButton aria-label="Close" onClick={onClose} sx={{ display: { xs: "none", sm: "inline-flex" }, position: "absolute", top: 16, right: 16, color: ui.muted, bgcolor: "rgba(255,255,255,0.06)", "&:hover": { bgcolor: "rgba(255,255,255,0.12)", color: "#fff" } }}>
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            {/* Body */}
            <Box sx={{ flex: 1, overflowY: "auto", px: 3.5, py: 3, display: "grid", gap: 4, alignContent: "start" }}>
              <Section step={1} title="The basics">
                <Field name="title">
                  {({ field }: any) => (
                    <TextField {...field} label="Event title" placeholder="e.g. Sunburn Arena Night" fullWidth error={!!show("title")} helperText={show("title")} sx={darkFieldSx} />
                  )}
                </Field>
                <Field name="description">
                  {({ field }: any) => (
                    <TextField
                      {...field}
                      label="Description"
                      placeholder="Line-up, what to expect, entry rules…"
                      multiline
                      minRows={4}
                      fullWidth
                      error={!!show("description")}
                      helperText={show("description") || `${values.description.length} characters`}
                      sx={darkFieldSx}
                    />
                  )}
                </Field>
              </Section>

              <Section step={2} title="Show dates" hint={values.dates.length ? `${values.dates.length} selected` : undefined}>
                <Box onBlur={() => setFieldTouched("dates", true, false)}>
                  <ClientDatePicker
                    label="Add a show date"
                    value={null}
                    onChange={addDate}
                    dark
                    disablePast
                    error={!!show("dates")}
                    helperText={show("dates") || "Pick a date to add it. Add as many as you need."}
                  />
                </Box>
                {values.dates.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {values.dates.map(d => {
                      const day = dayjs(d);
                      return (
                        <Box
                          key={d}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            pl: 0.75,
                            pr: 0.5,
                            py: 0.5,
                            borderRadius: 2.5,
                            border: "1px solid rgba(252,211,77,0.3)",
                            bgcolor: "rgba(252,211,77,0.07)",
                          }}
                        >
                          <Box sx={{ width: 34, textAlign: "center", lineHeight: 1.05, borderRadius: 1.5, py: 0.4, bgcolor: "rgba(252,211,77,0.14)", color: ui.gold }}>
                            <Box sx={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: 0.5 }}>{day.format("MMM").toUpperCase()}</Box>
                            <Box sx={{ fontSize: "0.95rem", fontWeight: 800 }}>{day.format("D")}</Box>
                          </Box>
                          <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{day.format("ddd, YYYY")}</Typography>
                          <IconButton
                            size="small"
                            aria-label={`Remove ${day.format("D MMM")}`}
                            onClick={() => setFieldValue("dates", values.dates.filter(x => x !== d))}
                            sx={{ color: ui.faint, "&:hover": { color: ui.danger } }}
                          >
                            <CloseRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Section>

              <Section step={3} title="Venue & tickets">
                <Field name="location">
                  {({ field }: any) => (
                    <TextField
                      {...field}
                      label="Venue / location"
                      placeholder="e.g. Hilite Mall, Calicut"
                      fullWidth
                      error={!!show("location")}
                      helperText={show("location")}
                      sx={darkFieldSx}
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><PlaceRoundedIcon sx={{ fontSize: 19 }} /></InputAdornment> } }}
                    />
                  )}
                </Field>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <Field name="price">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        label="Ticket price"
                        type="number"
                        fullWidth
                        error={!!show("price")}
                        helperText={show("price") || "Per seat"}
                        sx={darkFieldSx}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> }, htmlInput: { min: 0 } }}
                      />
                    )}
                  </Field>
                  <Field name="ticketsAvailable">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        label="Seats per show"
                        type="number"
                        fullWidth
                        error={!!show("ticketsAvailable")}
                        helperText={show("ticketsAvailable") || (editing ? "Venue size · booked seats stay booked" : `Venue size, max ${MAX_CAPACITY}`)}
                        sx={darkFieldSx}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><EventSeatRoundedIcon sx={{ fontSize: 18 }} /></InputAdornment> }, htmlInput: { min: 1, max: MAX_CAPACITY } }}
                      />
                    )}
                  </Field>
                </Box>
              </Section>

              <Section step={4} title="Poster">
                <PosterDrop
                  file={values.image}
                  existingUrl={initial?.imageUrl}
                  error={show("image") || undefined}
                  onChange={f => {
                    setFieldValue("image", f);
                    setFieldTouched("image", true, false);
                  }}
                />
              </Section>
            </Box>

            {/* Footer */}
            <Box sx={{ px: 3.5, py: 2.25, borderTop: `1px solid ${ui.border}`, bgcolor: "rgba(10,8,15,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.7rem", color: ui.faint, letterSpacing: 1.5 }}>ON SALE</Typography>
                <Typography sx={{ fontSize: "0.88rem", fontWeight: 700 }} noWrap>
                  {values.price !== "" ? `₹${Number(values.price).toLocaleString("en-IN")}` : "₹—"} · {values.dates.length || 0} date{values.dates.length === 1 ? "" : "s"}
                </Typography>
              </Box>
              {onClose && (
                <Button onClick={onClose} disabled={isSubmitting} sx={ghostButtonSx}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting} sx={{ ...primaryButtonSx, minWidth: 140, "&.Mui-disabled": { color: "rgba(255,255,255,0.7)", opacity: 0.7 } }}>
                {isSubmitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : editing ? "Save changes" : "Publish event"}
              </Button>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );

  if (compact) return form;

  // Standalone /events/add page
  return (
    <Box sx={{ minHeight: "100vh", background: ui.pageBg, display: "grid", placeItems: "center", p: { xs: 2, md: 4 } }}>
      <Box sx={{ width: "100%", maxWidth: 620, height: { md: "88vh" }, borderRadius: 5, overflow: "hidden", bgcolor: "#120e1a", border: `1px solid ${ui.border}`, boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
        {form}
      </Box>
    </Box>
  );
};

export default EventForm;

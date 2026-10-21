
"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EventHeader from "./EventHeader";
import EventCard from "./EventCard";
import { Drawer, Box, TextField, Typography, Button } from "@mui/material";
import ClientDatePicker from "./ClientDatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useAuth } from "../context/AuthContext";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import EventForm from "./EventForm";
import UserNavbar from "../components/UserNavbar";
import { primaryButtonSx, ui } from "../components/theme";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { FullPageLoader } from "../components/UserShell";
import { CardSkeleton } from "../components/ui";
import { useToast } from "../components/ToastProvider";
import { eventImageUrl } from "../components/userApi";



interface Event {
  _id: string;
  title: string;
  description: string;
  dates: string[];
  location?: string;
  price?: number;
  ticketsAvailable?: number;
  image?: string;
  seatsPerDate?: Record<string, number>;
  bookedSeats?: Record<string, string[]>;
}

function EventsContent() {
 const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin, loading: authLoading, loggedOutByUser } = useAuth();
  const toast = useToast();
  // UI mode for this page; the role itself comes from AuthContext (1 = admin, 2 = user).
  const role: "user" | "admin" = isAdmin ? "admin" : "user";

  const [filters, setFilters] = useState({ location: "", maxPrice: "", date: "" });
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    title: "",
    description: "",
    dates: [] as string[],
    location: "",
    price: 0,
    ticketsAvailable: 0,
    image: null as File | null,
  });
  const [newDate, setNewDate] = useState<Dayjs | null>(null);

  // Fetch events
  const fetchEvents = async (appliedFilters?: Partial<typeof filters>) => {
    setLoading(true);
    try {
      const f = appliedFilters || filters;
      const queryObj: Record<string, string> = {};
      if (f.location) queryObj.location = f.location;
      if (f.maxPrice) queryObj.maxPrice = f.maxPrice;
      if (f.date) queryObj.date = f.date;

      const res = await fetch(`${API_URL}/api/events?${new URLSearchParams(queryObj)}`);
      if (!res.ok) throw new Error("Failed to fetch events");

      const data: Event[] = await res.json();
      const normalized = data.map(ev => ({
  ...ev,
  dates: ev.dates?.map(d => new Date(d).toISOString()) || [],
  image: ev.image ? `${API_URL}/uploads/events/${ev.image}` : undefined, 

  seatsPerDate: ev.seatsPerDate || {},
  bookedSeats: ev.bookedSeats || {},
}));

      // const normalized = data.map(ev => ({
      //   ...ev,
      //   dates: ev.dates?.map(d => new Date(d).toISOString()) || [],
      //   image: ev.image ? `${API_URL}/uploads/${ev.image}` : undefined, 
      //   seatsPerDate: ev.seatsPerDate || {},
      //   bookedSeats: ev.bookedSeats || {},
      // }));
      setEvents(normalized);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    const loc = searchParams.get("location") || "";
    const price = searchParams.get("maxPrice") || "";
    const date = searchParams.get("date") || "";
    setFilters({ location: loc, maxPrice: price, date });
    fetchEvents({ location: loc, maxPrice: price, date });
  }, [searchParams.toString()]);

  const addDate = () => {
    if (newDate) {
      const dateStr = newDate.format("YYYY-MM-DD");
      if (!addForm.dates.includes(dateStr)) setAddForm(prev => ({ ...prev, dates: [...prev.dates, dateStr] }));
      setNewDate(null);
    }
  };

  const removeDate = (date: string) =>
    setAddForm(prev => ({ ...prev, dates: prev.dates.filter(d => d !== date) }));

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "image" && files) setAddForm(prev => ({ ...prev, image: files[0] }));
    else
      setAddForm(prev => ({
        ...prev,
        [name]: name === "price" || name === "ticketsAvailable" ? Number(value) : value,
      }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newDate) addDate();
    if (addForm.dates.length === 0) return alert("Please select at least one date");

    const formData = new FormData();
    formData.append("title", addForm.title);
    formData.append("description", addForm.description);
    addForm.dates.forEach(d => formData.append("dates", d));
    formData.append("location", addForm.location);
    formData.append("price", addForm.price.toString());
    formData.append("ticketsAvailable", addForm.ticketsAvailable.toString());
    if (addForm.image) formData.append("image", addForm.image);

    try {
      const token = JSON.parse(localStorage.getItem("user") || "{}").token || "";
      const res = await fetch(`${API_URL}/api/events`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to add event");
      }

      const savedEvent: Event = await res.json();
      savedEvent.dates = savedEvent.dates?.map(d => new Date(d).toISOString()) || [];
      savedEvent.seatsPerDate = savedEvent.seatsPerDate || {};
      savedEvent.bookedSeats = savedEvent.bookedSeats || {};
      if (savedEvent.image && !savedEvent.image.startsWith("http")) 
        savedEvent.image = `${API_URL}/uploads/${savedEvent.image}`; 

      setEvents(prev => [...prev, savedEvent]);
      setAddDrawerOpen(false);
      setAddForm({ title: "", description: "", dates: [], location: "", price: 0, ticketsAvailable: 0, image: null });
      setNewDate(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to add event");
    }
  };



  const [currentPage, setCurrentPage] = useState(1);
const eventsPerPage = 8;

const indexOfLastEvent = currentPage * eventsPerPage;
const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
  setCurrentPage(value);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

  // Booking needs an account, so send signed-out visitors to login first.
  useEffect(() => {
    if (!authLoading && !user) router.replace(loggedOutByUser ? "/" : "/?next=/events");
  }, [authLoading, user, loggedOutByUser, router]);

  // Don't render the user UI before we know whether this is an admin.
  if (authLoading || !user) return <FullPageLoader />;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: ui.pageBg,
        color: "white",
      }}
    >
      <UserNavbar />

      <EventHeader title="Upcoming Events" />

      {role === "admin" && (
        <>   
          {/* Title lines up with the card grid's left edge; button sits in the centre */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr auto 1fr" },
              alignItems: "center",
              justifyItems: { xs: "center", md: "start" },
              gap: 2,
              px: { xs: "20px", md: "40px" },
              pt: 4,
            }}
          >
            <Box>
              {/* <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: 2.5, color: ui.accentSoft }}>ADMIN</Typography> */}
              <Typography sx={{ fontWeight: 800, fontSize: "1.4rem" }}>Manage events</Typography>
            </Box>
            <Button startIcon={<AddRoundedIcon />} onClick={() => setAddDrawerOpen(true)} sx={{ ...primaryButtonSx, justifySelf: "center" }}>
              Add event
            </Button>
          </Box>
          <Drawer
            anchor="right"
            open={addDrawerOpen}
            onClose={() => setAddDrawerOpen(false)}
            slotProps={{
              paper: {
                sx: {
                  width: { xs: "100%", sm: 500 },
                  bgcolor: "#120e1a",
                  backgroundImage: "none",
                  borderLeft: `1px solid ${ui.border}`,
                  boxShadow: "-30px 0 80px rgba(0,0,0,0.5)",
                },
              },
              backdrop: { sx: { bgcolor: "rgba(5,3,10,0.6)", backdropFilter: "blur(4px)" } },
            }}
          >
            <EventForm
              compact
              onClose={() => setAddDrawerOpen(false)}
              onSuccess={() => {
                setAddDrawerOpen(false);
                fetchEvents();
              }}
            />
          </Drawer>

{/* <Drawer
  anchor="right"
  open={addDrawerOpen}
  onClose={() => setAddDrawerOpen(false)}
  PaperProps={{
    sx: { width: 450, p: 4, bgcolor: "#f5f5f5" } 
  }}
>
  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
    <Typography variant="h5" fontWeight="bold" color="primary">
      Add New Event
    </Typography>

    <EventForm
      onSuccess={() => {
        setAddDrawerOpen(false); // Close drawer on success
        fetchEvents(); // Refresh events list
      }}
    />
  </Box>
</Drawer> */}



          {/* <Drawer
            anchor="right"
            open={addDrawerOpen}
            onClose={() => setAddDrawerOpen(false)}
          >
            <Box sx={{ width: 400, p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Add Event
              </Typography>
              <form onSubmit={handleAddSubmit}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={addForm.title}
                  onChange={handleAddChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={addForm.description}
                  onChange={handleAddChange}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
                  <ClientDatePicker
                    label="Select Date"
                    value={newDate}
                    onChange={setNewDate}
                  />
                  <Button variant="contained" onClick={addDate}>
                    Add Date
                  </Button>
                </Box>
                <Box sx={{ mb: 2 }}>
                  {addForm.dates.map((d) => (
                    <Box
                      key={d}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Typography>{dayjs(d).format("DD/MM/YYYY")}</Typography>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => removeDate(d)}
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                </Box>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={addForm.location}
                  onChange={handleAddChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  name="price"
                  value={addForm.price}
                  onChange={handleAddChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Tickets Available"
                  type="number"
                  name="ticketsAvailable"
                  value={addForm.ticketsAvailable}
                  onChange={handleAddChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  type="file"
                  name="image"
                  onChange={handleAddChange}
                  sx={{ mb: 2 }}
                />
                <Button variant="contained" type="submit">
                  Add Event
                </Button>
              </form>
            </Box>
          </Drawer> */}
        </>
      )}

      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            padding: "40px",
          }}
        >
          {Array.from({ length: 4 }, (_, i) => (
            <CardSkeleton key={i} height={420} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <p style={{ textAlign: "center", padding: "60px 20px", color: ui.muted }}>No events found.</p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
              padding: "40px",
            }}
          >
            {currentEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                role={role}
                seatsPerDate={event.seatsPerDate}
                bookedSeats={event.bookedSeats}
                onEdit={async (id, data) => {
                  try {
                    const token =
                      JSON.parse(localStorage.getItem("user") || "{}").token || "";
                    const res = await fetch(`${API_URL}/api/events/${id}`, {
                      method: "PUT",
                      headers: { Authorization: `Bearer ${token}` },
                      body: data,
                    });
                    if (!res.ok) {
                      const errData = await res.json().catch(() => ({}));
                      throw new Error(errData.message || "Please try again.");
                    }
                    const raw: Event = await res.json();
                    // Same shape as fetchEvents, so the card can show the new image right away.
                    const updatedEvent: Event = {
                      ...raw,
                      dates: raw.dates?.map((d) => new Date(d).toISOString()) || [],
                      seatsPerDate: raw.seatsPerDate || {},
                      bookedSeats: raw.bookedSeats || {},
                      image: eventImageUrl(raw.image),
                    };
                    setEvents((prev) =>
                      prev.map((e) =>
                        e._id === updatedEvent._id ? updatedEvent : e
                      )
                    );
                    toast.success("Event updated successfully", `"${updatedEvent.title}" has been saved.`);
                    return updatedEvent;
                  } catch (err: any) {
                    console.error(err);
                    toast.error("Couldn't update event", err.message);
                    return null;
                  }
                }}
                onDelete={async (id) => {
                  try {
                    const token =
                      JSON.parse(localStorage.getItem("user") || "{}").token || "";
                    const res = await fetch(`${API_URL}/api/events/${id}`, {
                      method: "DELETE",
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) throw new Error("Failed to delete event");
                    setEvents((prev) => prev.filter((e) => e._id !== id));
                    toast.success("Event deleted", `"${event.title}" has been removed.`);
                  } catch (err) {
                    console.error(err);
                    toast.error("Couldn't delete event", "Please try again.");
                  }
                }}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <Stack spacing={2} alignItems="center" sx={{ pb: 5 }}>
            <Pagination
              count={Math.ceil(events.length / eventsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              shape="rounded"
              variant="outlined"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "white",
                  borderColor: "white",
                },
                "& .Mui-selected": {
                  backgroundColor: "#6a11cb !important",
                  color: "white",
                },
              }}
            />
          </Stack>
        </>
      )}
    </div>
  );
}

// useSearchParams needs a Suspense boundary for production builds.
export default function Events() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <EventsContent />
    </Suspense>
  );
}

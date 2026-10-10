
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EventHeader from "./EventHeader";
import EventCard from "./EventCard";
import { Drawer, Box, TextField, Typography, Button } from "@mui/material";
import ClientDatePicker from "./ClientDatePicker";
import dayjs, { Dayjs } from "dayjs";
import {jwtDecode} from "jwt-decode";
import Link from "next/link";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import EventForm from "./EventForm";



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

interface DecodedToken {
  id: string;
  role: "user" | "admin";
  exp: number;
}

export default function Events() {
 const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"user" | "admin">("user");

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

  // Fetch user role
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const decoded = jwtDecode(JSON.parse(userStr).token) as DecodedToken;
        setRole(decoded.role);
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, []);

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

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #2b0f35 0%, #31212f 50%, #0d0d0d 100%)",
        color: "white",
      }}
    >
      <nav
        style={{
          background: "linear-gradient(90deg, #2c003e, #3d0075)",
          color: "white",
          padding: "15px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
          Evenza
        </h2>
        <ul
          style={{
            display: "flex",
            listStyle: "none",
            gap: "20px",
            margin: 0,
          }}
        >
          {/* <li style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
            Home
          </li> */}
          {role === "admin" && (
            <li
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/admin/bookings")}
            >
              Bookings
            </li>
          )}

          {role === "user" && (
            <>
              <li
                style={{ cursor: "pointer" }}
                onClick={() => router.push("/profile")}
              >
                Profile
              </li>
              <li
                style={{ cursor: "pointer" }}
                onClick={() => router.push("/mybookings")}
              >
                My Bookings
              </li>
            </>
          )}
          <Link href="/" style={{}}>
            Logout
          </Link>
        </ul>
      </nav>

      <EventHeader title="Upcoming Events" />

      {role === "admin" && (
        <>   
<Button
  variant="contained"
  sx={{ bgcolor: "#6a11cb", color: "white", fontWeight: "bold", marginLeft: "700px", marginBottom: "20px", marginTop: "20px" }}
  onClick={() => setAddDrawerOpen(true)} // ← Open drawer instead
>
  Add Event
</Button>
<Drawer
  anchor="right"
  open={addDrawerOpen}
  onClose={() => setAddDrawerOpen(false)}
  PaperProps={{ sx: { width: 450, p: 4, bgcolor: "#f5f5f5" } }}
>
  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
    {/* <Typography variant="h5" fontWeight="bold" color="primary">
      Add New Event
    </Typography> */}

    <EventForm
      compact // <-- important!
      onSuccess={() => {
        setAddDrawerOpen(false);
        fetchEvents();
      }}
    />
  </Box>
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

      {events.length === 0 ? (
        <p>No events found.</p>
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
                    if (!res.ok) throw new Error("Failed to update event");
                    const updatedEvent: Event = await res.json();
                    updatedEvent.dates =
                      updatedEvent.dates?.map((d) => new Date(d).toISOString()) || [];
                    updatedEvent.seatsPerDate = updatedEvent.seatsPerDate || {};
                    updatedEvent.bookedSeats = updatedEvent.bookedSeats || {};
                    if (
                      updatedEvent.image &&
                      !updatedEvent.image.startsWith("http")
                    )
                      updatedEvent.image = `${API_URL}/uploads/${updatedEvent.image}`;
                    setEvents((prev) =>
                      prev.map((e) =>
                        e._id === updatedEvent._id ? updatedEvent : e
                      )
                    );
                  } catch (err) {
                    console.error(err);
                    alert("Failed to update event");
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
                  } catch (err) {
                    console.error(err);
                    alert("Failed to delete event");
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



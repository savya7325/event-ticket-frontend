"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createEvent } from "../auth/api";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TextField, Button, Box, Typography, Chip } from "@mui/material";
import ClientDatePicker from "../events/ClientDatePicker"; 
import dayjs, { Dayjs } from "dayjs";

// Validation Schema
const eventValidationSchema = Yup.object({
  title: Yup.string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters"),
  dates: Yup.array()
    .of(Yup.date())
    .min(1, "Please select at least one date")
    .required("At least one date is required"),
  location: Yup.string().required("Location is required"),
  price: Yup.number()
    .transform(value => (value === "" ? undefined : Number(value)))
    .required("Price is required")
    .min(0, "Price must be positive"),
  ticketsAvailable: Yup.number()
    .transform(value => (value === "" ? undefined : Number(value)))
    .required("Number of tickets is required")
    .min(1, "At least 1 ticket must be available")
    .integer("Must be a whole number"),
  image: Yup.mixed().required("Event image is required"),
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

interface EventFormProps {
  onSuccess?: () => void;
  compact?: boolean;
}


const EventForm = ({ onSuccess, compact }: EventFormProps = {}) => {
  // const { user } = useAuth();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  console.log(" EventForm Component Loaded");
  console.log(" Validation Schema:", eventValidationSchema);

  const initialValues: EventFormValues = {
    title: "",
    description: "",
    dates: [],
    location: "",
    price: "",
    ticketsAvailable: "",
    image: null,
  };

  // Handle Submit
  const handleSubmit = async (
    values: EventFormValues,
    { setSubmitting, resetForm, setErrors }: any
  ) => {
      console.log(" Form Submitted with values:", values);
  console.log(" Dates:", values.dates);
    try {
      const userData = localStorage.getItem("user");
      const token = userData ? JSON.parse(userData).token : null;

      if (!token) {
        alert("You must be logged in as admin to create events");
        router.push("/auth");
        return;
      }

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      
      // Append multiple dates
      values.dates.forEach((date) => {
        formData.append("dates[]", date);
      });
      
      formData.append("location", values.location);
      formData.append("price", values.price.toString());
      formData.append("ticketsAvailable", values.ticketsAvailable.toString());
      if (values.image) formData.append("image", values.image);

      await createEvent(formData, token);
      alert("Event created successfully!");
      resetForm();
      setSelectedDates([]);
      if (onSuccess) {
    onSuccess(); // Close drawer and refresh
  } else 
      router.push("/events");
    } catch (error: any) {
      console.error("Error creating event:", error);
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const formikErrors: any = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.field) formikErrors[err.field] = err.message;
        });
        setErrors(formikErrors);
      } else {
        alert(error.response?.data?.message || "Failed to create event");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle date selection
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
    const date = e.target.value;
    if (date && !selectedDates.includes(date)) {
      const newDates = [...selectedDates, date];
      setSelectedDates(newDates);
      setFieldValue("dates", newDates);
    }
  };

  // Remove date
  const removeDate = (dateToRemove: string, setFieldValue: any) => {
    const newDates = selectedDates.filter(d => d !== dateToRemove);
    setSelectedDates(newDates);
    setFieldValue("dates", newDates);
  };

  // Restrict to Admins
  if (loading) return null;
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You must be logged in as an admin to create events.
          </p>
          <button
            onClick={() => router.push("/auth")}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

const wrapperClasses = compact
  ? "w-full" // compact: just take full width of container
  : "min-h-screen bg-gray-50 py-8"; // default full-page style

  return (
    // <div className="min-h-screen bg-gray-50 py-8">
    //   <div className="max-w-2xl mx-auto px-4">
    //     <div className="bg-white rounded-lg shadow-md p-8">
    //       {/* <h2 className="text-2xl font-bold mb-6">Create New Event</h2> */}
      <div className={wrapperClasses}>
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-8">
        
<Formik
  initialValues={initialValues}
  validationSchema={eventValidationSchema}
  onSubmit={handleSubmit}
>
  {({ setFieldValue, errors, touched, isSubmitting }) => (
    <Form>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="primary">
          Create New Event
        </Typography>

        {/* Title */}
        <Field name="title">
          {({ field, meta }: any) => (
            <TextField
              {...field}
              label="Event Title"
              fullWidth
              variant="outlined"
              error={meta.touched && Boolean(meta.error)}
              helperText={meta.touched && meta.error}
              sx={{ bgcolor: "background.default" }}
            />
          )}
        </Field>

        {/* Description */}
        <Field name="description">
          {({ field, meta }: any) => (
            <TextField
              {...field}
              label="Description"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              error={meta.touched && Boolean(meta.error)}
              helperText={meta.touched && meta.error}
            />
          )}
        </Field>

        {/* Dates */}
       <ClientDatePicker
  label="Event Dates"
  value={selectedDates.length > 0 ? dayjs(selectedDates[0]) : null}
  onChange={(newValue: Dayjs | null) => {
    if (newValue) {
      const dateStr = newValue.format("YYYY-MM-DD");
      if (!selectedDates.includes(dateStr)) {
        const newDates = [...selectedDates, dateStr];
        setSelectedDates(newDates);
        setFieldValue("dates", newDates);
      }
    }
  }}
/>

<Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
  {selectedDates.map((date) => (
    <Chip
      key={date}
      label={dayjs(date).format("DD-MM-YYYY")}
      onDelete={() => removeDate(date, setFieldValue)}
      color="primary"
    />
  ))}
</Box>

{errors.dates && touched.dates && (
  <Typography color="error" variant="body2">
    {errors.dates}
  </Typography>
)}

        {/* Location */}
        <Field name="location">
          {({ field, meta }: any) => (
            <TextField
              {...field}
              label="Location"
              fullWidth
              variant="outlined"
              error={meta.touched && Boolean(meta.error)}
              helperText={meta.touched && meta.error}
            />
          )}
        </Field>

        {/* Price and Tickets */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Field name="price">
            {({ field, meta }: any) => (
              <TextField
                {...field}
                label="Price (₹)"
                type="number"
                fullWidth
                variant="outlined"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
              />
            )}
          </Field>

          <Field name="ticketsAvailable">
            {({ field, meta }: any) => (
              <TextField
                {...field}
                label="Tickets"
                type="number"
                fullWidth
                variant="outlined"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
              />
            )}
          </Field>
        </Box>

        {/* Image */}
        <Button
          variant="outlined"
          component="label"
          fullWidth
          sx={{ textTransform: "none" }}
        >
          Upload Event Image
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) =>
              setFieldValue("image", e.currentTarget.files?.[0] || null)
            }
          />
        </Button>
        {errors.image && touched.image && (
          <Typography color="error" variant="body2">
            {errors.image}
          </Typography>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isSubmitting}
          sx={{ py: 1.5, fontWeight: "bold" }}
        >
          {isSubmitting ? "Creating Event..." : "Add Event"}
        </Button>
      </Box>
    </Form>
  )}
</Formik>


        </div>
      </div>
    </div>
  );
};

export default EventForm;
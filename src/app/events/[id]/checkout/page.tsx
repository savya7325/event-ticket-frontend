// "use client";

// import { useSearchParams, useRouter } from "next/navigation";
// import { Box, Typography, Button } from "@mui/material";

// export default function CheckoutPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   // Get query params safely
//   const seatsParam = searchParams.get("seats");
//   const dateParam = searchParams.get("date");

//   const seats: string[] = seatsParam ? seatsParam.split(",") : [];
//   const selectedDate: Date | null = dateParam ? new Date(dateParam) : null;

//   const handleConfirm = () => {
//     alert("Booking confirmed!");
//     router.push("/events"); // redirect to events list
//   };

//   return (
//     <Box sx={{ p: 4 }}>
//       <Typography
//         variant="h4"
//         sx={{ mb: 2, color: "#6a11cb", fontWeight: "bold" }}
//       >
//         Booking Summary
//       </Typography>

//       <Typography sx={{ mb: 1 }}>
//         Selected Date:{" "}
//         {selectedDate ? selectedDate.toLocaleDateString() : "N/A"}
//       </Typography>

//       <Typography sx={{ mb: 2 }}>
//         Selected Seats: {seats.length > 0 ? seats.join(", ") : "None"}
//       </Typography>

//       <Button
//         variant="contained"
//         color="primary"
//         onClick={handleConfirm}
//         disabled={seats.length === 0 || !selectedDate}
//       >
//         Confirm Booking
//       </Button>
//     </Box>
//   );
// }


// "use client";

// import { useSearchParams, useRouter } from "next/navigation";
// import { useState } from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   TextField,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
//   Card,
//   CardContent,
//   Divider,
// } from "@mui/material";

// export default function CheckoutPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   // Get query params
//   const seatsParam = searchParams.get("seats");
//   const dateParam = searchParams.get("date");
//   const priceParam = searchParams.get("price"); 
//    const eventId = searchParams.get("eventId"); 

//   const seats: string[] = seatsParam ? seatsParam.split(",") : [];
//   const selectedDate: Date | null = dateParam ? new Date(dateParam) : null;
//   const price: number = priceParam ? Number(priceParam) : 500; // default 

//   const [paymentMethod, setPaymentMethod] = useState("card");
//   const [cardNumber, setCardNumber] = useState("");
//   const [cardExpiry, setCardExpiry] = useState("");
//   const [cardCVC, setCardCVC] = useState("");

//   const handlePayment = () => {
//     if (!paymentMethod) {
//       alert("Select a payment method");
//       return;
//     }
//     if (paymentMethod === "card" && (!cardNumber || !cardExpiry || !cardCVC)) {
//       alert("Enter valid card details");
//       return;
//     }

//     // i can integrate real payment gateway (Stripe, Razorpay, etc.)
//     alert("Payment successful! Booking confirmed.");
//     router.push("/events"); // redirect to events list or thank you page
//   };

//   return (
//     <Box sx={{ maxWidth: 500, mx: "auto", p: 4 }}>
//       <Typography variant="h4" sx={{ mb: 3, color: "#6a11cb", fontWeight: "bold" }}>
//         Checkout
//       </Typography>

//       <Card sx={{ mb: 3, bgcolor: "#1e1e2f", color: "white" }}>
//         <CardContent>
//           <Typography variant="h6" sx={{ mb: 1 }}>
//             Booking Summary
//           </Typography>
//           <Divider sx={{ mb: 2, bgcolor: "#6a11cb" }} />
//           <Typography>Selected Date: {selectedDate ? selectedDate.toLocaleDateString() : "N/A"}</Typography>
//           <Typography>Seats: {seats.join(", ")}</Typography>
//           <Typography sx={{ mt: 1, fontWeight: "bold" }}>Total: ₹{seats.length * price}</Typography>
//         </CardContent>
//       </Card>

//       <Card sx={{ mb: 3, bgcolor: "#1e1e2f", color: "white" }}>
//         <CardContent>
//           <Typography variant="h6" sx={{ mb: 1 }}>
//             Payment Method
//           </Typography>
//           <Divider sx={{ mb: 2, bgcolor: "#6a11cb" }} />

//           <RadioGroup
//             value={paymentMethod}
//             onChange={(e) => setPaymentMethod(e.target.value)}
//           >
//             <FormControlLabel value="card" control={<Radio />} label="Credit/Debit Card" />
//             <FormControlLabel value="upi" control={<Radio />} label="UPI / Wallet" />
//           </RadioGroup>

//           {paymentMethod === "card" && (
//             <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
//               <TextField
//                 label="Card Number"
//                 variant="filled"
//                 value={cardNumber}
//                 onChange={(e) => setCardNumber(e.target.value)}
//                 fullWidth
//                 InputProps={{ sx: { bgcolor: "#2e2e3e", color: "white" } }}
//               />
//               <TextField
//                 label="Expiry (MM/YY)"
//                 variant="filled"
//                 value={cardExpiry}
//                 onChange={(e) => setCardExpiry(e.target.value)}
//                 fullWidth
//                 InputProps={{ sx: { bgcolor: "#2e2e3e", color: "white" } }}
//               />
//               <TextField
//                 label="CVC"
//                 variant="filled"
//                 value={cardCVC}
//                 onChange={(e) => setCardCVC(e.target.value)}
//                 fullWidth
//                 InputProps={{ sx: { bgcolor: "#2e2e3e", color: "white" } }}
//               />
//             </Box>
//           )}
//         </CardContent>
//       </Card>

//       <Button
//         variant="contained"
//         color="primary"
//         fullWidth
//         sx={{ fontWeight: "bold" }}
//         onClick={handlePayment}
//       >
//         Confirm & Pay
//       </Button>
//     </Box>
//   );
// }

"use client";

import { Suspense } from "react";
import { FullPageLoader } from "../../../components/UserShell";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();

  const seatsParam = searchParams.get("seats");
  const dateParam = searchParams.get("date");
  const priceParam = searchParams.get("price"); 
  const eventId = searchParams.get("eventId") || params.id; 

  const seats: string[] = seatsParam ? seatsParam.split(",") : [];
  const selectedDate: string | null = dateParam ? dateParam : null;
  const price: number = priceParam ? Number(priceParam) : 500;

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert("Select a payment method");
      return;
    }
    if (paymentMethod === "card" && (!cardNumber || !cardExpiry || !cardCVC)) {
      alert("Enter valid card details");
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem("user") || "{}").token || "";
      if (!token) return alert("Please login to book tickets");

      const totalPrice = seats.length * price;

      const res = await fetch(`${API_URL}/api/events/${eventId}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          seats,
          date: selectedDate,
          totalPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      setOpen(true);
      setTimeout(() => {
        // Pass the booking details as URL parameters
        router.push(`/success?seats=${seats.join(",")}&date=${selectedDate}&price=${totalPrice}`);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Booking failed");
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, color: "#6a11cb", fontWeight: "bold" }}>
        Checkout
      </Typography>

      <Card sx={{ mb: 3, bgcolor: "#1e1e2f", color: "white" }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Booking Summary
          </Typography>
          <Divider sx={{ mb: 2, bgcolor: "#6a11cb" }} />
          <Typography>Selected Date: {selectedDate ? new Date(selectedDate).toLocaleDateString() : "N/A"}</Typography>
          <Typography>Seats: {seats.join(", ")}</Typography>
          <Typography sx={{ mt: 1, fontWeight: "bold" }}>Total: ₹{seats.length * price}</Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3, bgcolor: "#1e1e2f", color: "white" }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Payment Method
          </Typography>
          <Divider sx={{ mb: 2, bgcolor: "#6a11cb" }} />

          <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <FormControlLabel value="card" control={<Radio />} label="Credit/Debit Card" />
            <FormControlLabel value="upi" control={<Radio />} label="UPI / Wallet" />
          </RadioGroup>

          {paymentMethod === "card" && (
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Card Number"
                variant="filled"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                fullWidth
                InputProps={{ sx: { bgcolor: "#2e2e3e", color: "white" } }}
              />
              <TextField
                label="Expiry (MM/YY)"
                variant="filled"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                fullWidth
                InputProps={{ sx: { bgcolor: "#2e2e3e", color: "white" } }}
              />
              <TextField
                label="CVC"
                variant="filled"
                value={cardCVC}
                onChange={(e) => setCardCVC(e.target.value)}
                fullWidth
                InputProps={{ sx: { bgcolor: "#2e2e3e", color: "white" } }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ fontWeight: "bold" }}
        onClick={handlePayment}
      >
        Confirm & Pay
      </Button>

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: "100%" }}>
          Booking successful!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// useSearchParams needs a Suspense boundary for production builds.
export default function CheckoutPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <CheckoutPageContent />
    </Suspense>
  );
}

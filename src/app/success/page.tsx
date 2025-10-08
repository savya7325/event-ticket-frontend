

// "use client";

// import { Box, Typography, Button } from "@mui/material";
// import { useRouter } from "next/navigation";

// export default function SuccessPage() {
//   const router = useRouter();

//   return (
//     <Box sx={{ textAlign: "center", mt: 10 }}>
//       <Typography variant="h4" sx={{ color: "green", mb: 2 }}>
//         ✅ Booking Successful!
//       </Typography>
//       <Typography variant="body1" sx={{ mb: 4 }}>
//         Your booking has been confirmed. Thank you!
//       </Typography>
//       <Button variant="contained" onClick={() => router.push("/events")}>
//         Go Back
//       </Button>
//     </Box>
//   );
// }

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Box, Typography, Button } from "@mui/material";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [bookingDetails, setBookingDetails] = useState({
    seats: "",
    date: "",
    price: "",
  });

  useEffect(() => {
    const seats = searchParams.get("seats") || "";
    const date = searchParams.get("date") || "";
    const price = searchParams.get("price") || "";

    console.log("URL Params:", { seats, date, price }); // Debug log

    setBookingDetails({ seats, date, price });
  }, [searchParams]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #2b0f35 0%, #31212f 50%, #0d0d0d 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Box sx={{ textAlign: "center", color: "white", maxWidth: 600 }}>
        <Typography variant="h4" sx={{ mb: 3, color: "#ffb703" }}>
          Booking Successful!
        </Typography>
        
        {bookingDetails.date ? (
          <>
            <Typography sx={{ mb: 1, fontSize: "18px" }}>
              Date: {new Date(bookingDetails.date).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
            <Typography sx={{ mb: 1, fontSize: "18px" }}>
              Seats: {bookingDetails.seats}
            </Typography>
            <Typography sx={{ mb: 3, fontSize: "18px" }}>
              Total Price: ₹{bookingDetails.price}
            </Typography>
          </>
        ) : (
          <Typography sx={{ mb: 3, fontSize: "16px", color: "#999" }}>
            Loading booking details...
          </Typography>
        )}
        
        <Button
          variant="contained"
          sx={{ bgcolor: "#6a11cb", "&:hover": { bgcolor: "#5a0fb0" } }}
          onClick={() => router.push("/events")}
        >
          BACK TO EVENTS
        </Button>
      </Box>
    </Box>
  );
}
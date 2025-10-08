// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Box, Typography } from "@mui/material";

// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   role: "user" | "admin";
// }

// export default function ProfilePage() {
//   const router = useRouter();
//   const [user, setUser] = useState<User | null>(null);

//   useEffect(() => {
//     const userStr = localStorage.getItem("user");
//     if (!userStr) {
//       router.push("/"); // redirect if not logged in
//       return;
//     }

//     const token = JSON.parse(userStr).token;

//     fetch("http://localhost:5000/api/users/profile", {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then(res => {
//         if (!res.ok) throw new Error("Failed to fetch profile");
//         return res.json();
//       })
//       .then(data => {
//         // your backend returns { message, user }
//         setUser(data.user);
//         if (data.user.role !== "user") {
//           router.push("/"); // only users can access profile
//         }
//       })
//       .catch(err => {
//         console.error(err);
//         router.push("/"); // redirect if error
//       });
//   }, [router]);

//   if (!user) return <p>Loading profile...</p>;

//   return (
//     <Box sx={{ padding: 4, color: "white" }}>
//       <Typography variant="h4" sx={{ mb: 2 }}>
//         Profile
//       </Typography>
//       <Typography>Name: {user.name}</Typography>
//       <Typography>Email: {user.email}</Typography>
//       <Typography>Role: {user.role}</Typography>
//     </Box>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Paper, Divider ,Button } from "@mui/material";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/"); // redirect if not logged in
      return;
    }

    const token = JSON.parse(userStr).token;

    fetch("http://localhost:5000/api/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then(data => {
        setUser(data.user);
        if (data.user.role !== "user") router.push("/"); // only users
      })
      .catch(err => {
        console.error(err);
        router.push("/"); // redirect if error
      });
  }, [router]);

  if (!user) return <p style={{ color: "#fff" }}>Loading profile...</p>;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #3d0b33ff 0%, #062806ff 50%, #2c0532ff 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
        color: "#fff",
      }}
    >
      <Paper
        elevation={12}
        sx={{
          padding: 4,
          maxWidth: 500,
          width: "100%",
          borderRadius: 3,
          background: "linear-gradient(135deg, #004d00 0%, #007700 100%)",
          color: "#fff",
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, color: "#ff4d4d", fontWeight: "bold", textAlign: "center" }}>
          My Profile
        </Typography>
        <Divider sx={{ mb: 3, borderColor: "#ff4d4d" }} />

        <Typography variant="h6" sx={{ mb: 1 }}>
          Name:
          <Typography component="span" sx={{ color: "#ffcccc", ml: 1, fontWeight: "medium" }}>
            {user.name}
          </Typography>
        </Typography>

        <Typography variant="h6" sx={{ mb: 1 }}>
          Email:
          <Typography component="span" sx={{ color: "#ffcccc", ml: 1, fontWeight: "medium" }}>
            {user.email}
          </Typography>
        </Typography>

         <Button
          variant="contained"
          onClick={() => router.push("/events")}
          sx={{
            bgcolor: "#ff4d4d",
            color: "#fff",
            "&:hover": { bgcolor: "#e60000" },
            fontWeight: "bold",
            marginLeft:"120px",
            marginTop:"10px",
          }}
        >
          Go Back to events
        </Button>



      </Paper>
    </Box>
  );
}

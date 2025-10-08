// "use client";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { jwtDecode } from "jwt-decode";

// interface DecodedToken {
//   id: string;
//   role: "user" | "admin";
//   exp: number;
//   name?: string;
// }

// export default function Navbar() {
//   const [role, setRole] = useState<"user" | "admin">("user");
//   const [name, setName] = useState<string>("");

//  useEffect(() => {
//   const userStr = localStorage.getItem("user");
//   if (userStr) {
//     try {
//       const user = JSON.parse(userStr); // Parse first
//       if (user.token) {
//         const decoded = jwtDecode<DecodedToken>(user.token); // Decode the token, NOT the whole JSON
//         setRole(decoded.role);
//         setName(decoded.name || "User");
//       }
//     } catch (err) {
//       console.error("Invalid token", err);
//     }
//   }
// }, []);


//   const handleLogout = () => {
//     localStorage.removeItem("user");
//     window.location.href = "/";
//   };

//   return (
//     <nav
//       style={{
//         background: "linear-gradient(90deg, #2c003e, #3d0075)",
//         color: "white",
//         padding: "15px 30px",
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "center",
//         position: "sticky",
//         top: 0,
//         zIndex: 1000,
//       }}
//     >
//       <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
//         Evenza
//       </h2>
//       <ul style={{ display: "flex", listStyle: "none", gap: "20px", margin: 0 }}>
//         <li style={{ cursor: "pointer" }} onClick={() => (window.location.href = "/")}>
//           Home
//         </li>
//         <li style={{ cursor: "pointer" }} onClick={() => (window.location.href = "/events")}>
//           Events
//         </li>

//         {role === "admin" && (
//           <>
//             <li style={{ cursor: "pointer" }} onClick={() => (window.location.href = "/AdminBookings")}>
//               Bookings
//             </li>
//             <li style={{ cursor: "pointer" }} onClick={() => (window.location.href = "/admin/events")}>
//               Manage Events
//             </li>
//             <li style={{ cursor: "pointer" }} onClick={() => (window.location.href = "/admin/dashboard")}>
//               Dashboard
//             </li>
//           </>
//         )}

//         {role === "user" && (
//           <>
//             <li style={{ cursor: "pointer" }} onClick={() => (window.location.href = "/profile")}>
//               Profile
//             </li>
//             <li style={{ cursor: "pointer" }} onClick={() => (window.location.href = "/mybookings")}>
//               My Bookings
//             </li>
//           </>
//         )}

//         <li style={{ cursor: "pointer" }} onClick={handleLogout}>
//           Logout
//         </li>
//       </ul>
//     </nav>
//   );
// }

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminNavbar() {
  const [user, setUser] = useState<{ role?: string } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setUser(JSON.parse(userStr));
  }, []);

  if (!user || user.role !== "admin") return null; // Only admin sees navbar

  return (
    <nav style={{ display: "flex", gap: "20px", padding: "10px", background: "#f0f0f0" }}>
      <Link href="/admin/dashboard">Dashboard</Link>
      <Link href="/admin/events">Manage Events</Link>
      <Link href="/admin/bookings">Bookings</Link>
    </nav>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [current, setCurrent] = useState(0);

  const router = useRouter();

  const videos = [
    "https://www.pexels.com/download/video/2845487/",
    "https://www.pexels.com/download/video/31580002/",
    "https://images.pexels.com/photos/2101488/pexels-photo-2101488.jpeg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % videos.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        setMessage("Registered successfully");
        router.push("/events");
      } else {
        await login({ email: formData.email, password: formData.password });
        setMessage("Logged in");
        router.push("/events");
      }
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    }
  };


  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden", fontFamily: "'Roboto', sans-serif" }}>
      {/* Background Video Slider */}
      {videos.map((video, index) => (
        <video
          key={index}
          src={video}
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: index === current ? 1 : 0,
            transition: "opacity 1.5s ease-in-out",
            filter: "brightness(30%) contrast(120%)",
            zIndex: 0,
          }}
        />
      ))}

      {/* Dark Red-Violet Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          // background: "linear-gradient(to bottom right, rgba(138,43,226,0.6), rgba(128,0,0,0.7))",
          zIndex: 1,
        }}
      />

      {/* Navbar */}
      <nav
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 50px",
          color: "#fff",
          background: "rgba(129, 4, 4, 0.4)",
          borderRadius: "10px",
          margin: "20px",
        }}
      >
        <h2 style={{ fontSize: "2rem", fontWeight: "bold", letterSpacing: "2px" }}>EVENZA</h2>
        <div style={{ display: "flex", gap: "25px", fontSize: "1.1rem" }}>
          <Link href="/events" style={navLinkStyle}>Contact Us</Link>
          <Link href="/about" style={navLinkStyle}>About Us</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          color: "#fff",
          zIndex: 2,
          maxWidth: "750px",
          padding: "10px 20px",
        }}
      >
        <h1 style={{ fontSize: "3.5rem", fontWeight: "bold", textShadow: "2px 2px 10px rgba(0,0,0,0.7)" }}>
          Experience Events Like Never Before
        </h1>
        <p style={{ fontSize: "1.3rem", lineHeight: "1.8", color: "#ffccd5", marginTop: "15px" }}>
          Book tickets, explore events, and manage your experience seamlessly with <b>EVENZA</b>.
        </p>
      </div>

      {/* Login/Register Form */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "150vh",
          padding: "20px",
          paddingTop: "25px",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            width: "380px",
            maxWidth: "90%",
            padding: "40px",
            borderRadius: "15px",
            background: "rgba(20,0,20,0.6)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.7)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
            {isRegister ? "Register" : "Login"}
          </h2>

        {isRegister && (
  <input
    type="text"
    name="username"
    placeholder="Username"
    value={formData.username}
    onChange={handleChange}
    required
    style={inputStyle}
  />
)}

<input
  type="email"
  name="email"
  placeholder="Email"
  autoComplete="off"
  value={formData.email}
  onChange={handleChange}
  required
  style={inputStyle}
/>
<input
  type="password"
  name="password"
  placeholder="Password"
  autoComplete="new-password"
  value={formData.password}
  onChange={handleChange}
  required
  style={inputStyle}
/>

          <button type="submit" style={buttonStyle}>
            {isRegister ? "Register" : "Login"}
          </button>

          <p style={{ textAlign: "center", fontSize: "0.95rem" }}>
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <span
              style={{ color: "#f4325cff", cursor: "pointer", fontWeight: "bold" }}
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Login here" : "Register here"}
            </span>
          </p>

          {message && (
            <p
              style={{
                marginTop: "10px",
                color: message.startsWith("Error") ? "#ff4d4d" : "#00ff7f",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {message}
            </p>
          )}
        </form>
      </div>
{/* Event Highlights Section  */}
<div
  style={{
    position: "relative",
    zIndex: 2,
    background: "rgba(30,0,20,0.85)",
    padding: "60px 20px",
  }}
>
  <h2 style={{ color: "#ff3399", fontSize: "2.2rem", marginBottom: "30px", textAlign: "center" }}>
    Event Highlights
  </h2>

  <div
    style={{
      display: "flex",
      gap: "20px",
      overflowX: "auto",
      scrollSnapType: "x mandatory",
      paddingBottom: "20px",
      paddingLeft: "20px",
      paddingRight: "20px",
      scrollbarWidth: "thin",
      scrollbarColor: "#ff3399 rgba(0,0,0,0.2)",
    }}
  >
    {[
       "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg",
 "https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg",
  "https://images.pexels.com/photos/269140/pexels-photo-269140.jpeg",

  "https://images.pexels.com/photos/5475779/pexels-photo-5475779.jpeg",
 "https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg",
  "https://images.pexels.com/photos/2814828/pexels-photo-2814828.jpeg",
    ].map((img, i) => (
      <div
        key={i}
        style={{
          flex: "0 0 auto",
          width: "280px",
          height: "160px",
          borderRadius: "12px",
          backgroundImage: `url(${img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          scrollSnapAlign: "start",
          boxShadow: "0 6px 15px rgba(255,0,150,0.5)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease, rotate 0.3s ease",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1) rotateY(3deg)";
          e.currentTarget.style.boxShadow = "0 12px 30px rgba(255,0,150,0.8)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1) rotateY(0deg)";
          e.currentTarget.style.boxShadow = "0 6px 15px rgba(255,0,150,0.5)";
        }}
      />
    ))}
  </div>

<div
  style={{
    position: "relative",
    zIndex: 2,
    background: "#120020",
    color: "#fff",
    textAlign: "center",
    padding: "30px 20px",
    marginTop: "50px",
  }}
>
  <h3 style={{ margin: "0 0 10px 0", fontSize: "1.5rem" }}>EVENZA</h3>
  <p style={{ margin: 0, fontSize: "0.9rem" }}>&copy; 2025 EVENZA. All rights reserved.</p>
  <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "15px" }}>
  </div>
</div>
</div>
    </div>

    
  );
}

// Styles
const navLinkStyle: React.CSSProperties = {
  color: "#ff99ff",
  textDecoration: "none",
  fontWeight: "500",
  transition: "color 0.3s",
};

const inputStyle: React.CSSProperties = {
  padding: "14px",
  borderRadius: "8px",
  border: "none",
  outline: "none",
  fontSize: "1rem",
  background: "rgba(255,255,255,0.1)",
  color: "#fff",
};

const buttonStyle: React.CSSProperties = {
  padding: "14px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(90deg, #ff0066 0%, #9900ff 100%)",
  color: "#fff",
  fontWeight: "bold",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  boxShadow: "0 8px 20px rgba(255,0,150,0.5)",
};


const footerLinkStyle: React.CSSProperties = {
  color: "#ff99ff",
  textDecoration: "none",
  fontWeight: "500",
  transition: "color 0.3s",
};

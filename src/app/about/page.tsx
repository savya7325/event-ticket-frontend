"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getCurrentYear } from "@/utils/date"; 

export default function AboutPage() {
  const images = [
    "https://images.pexels.com/photos/167491/pexels-photo-167491.jpeg",
    "https://images.pexels.com/photos/2952834/pexels-photo-2952834.jpeg",
    "https://images.pexels.com/photos/1114425/pexels-photo-1114425.jpeg",
    "https://images.pexels.com/photos/2608516/pexels-photo-2608516.jpeg",
  ];

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#fff" }}>

      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", letterSpacing: "2px", color: "#ff0066" }}>
          EVENZA
        </h2>
        <div style={{ display: "flex", gap: "25px", fontSize: "1.1rem" }}>
          <Link href="/" style={navLinkStyle}>Home</Link>
          <Link href="/profile" style={navLinkStyle}>Profile</Link>
          <Link href="/about" style={navLinkStyle}>Contact Us</Link>
        </div>
      </nav>

   
      <section
        style={{
          textAlign: "center",
          padding: "100px 20px 60px",
          background: "linear-gradient(135deg, #1a001f, #0a0a0a)",
        }}
      >
        <h1 style={{ fontSize: "3.2rem", fontWeight: "bold", marginBottom: "20px", textTransform: "uppercase" }}>
          About EVENZA
        </h1>
        <p
          style={{
            maxWidth: "850px",
            margin: "0 auto",
            fontSize: "1.2rem",
            lineHeight: "1.8",
            color: "#ddd",
          }}
        >
        EVENZA is your ultimate destination to explore, and experience events of every kind. From concerts and workshops to community
         gatherings, we connect passionate organizers with enthusiastic attendees.
         With our simple yet powerful booking system, discovering and enjoying events has never been this seamless.
        </p>

        {/* <Link href="/events" passHref>
  <button style={glowButtonStyle}>Explore Events</button>
</Link> */}
      </section>

      <div style={categoryContainer}>
        {["Concerts", "Workshops", "Festivals", "Meetups", "Expos"].map((cat) => (
          <span key={cat} style={categoryTabStyle}>{cat}</span>
        ))}
      </div>

      <section style={{ padding: "60px 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", marginBottom: "30px" }}>Our Mission</h2>
        <p
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            fontSize: "1.1rem",
            lineHeight: "1.9",
            color: "#ccc",
          }}
        >
       We believe booking an event should be as exciting as attending it. That's why EVENZA is built to make the process seamless, fun, and
        stress-free. Whether you're joining a concert, a workshop, a conference, or a local gathering, our platform ensures
         attendees enjoy a smooth experience while organizers 
       get the tools they need to bring their events to life.
        </p>
      </section>

      <section style={{ padding: "60px 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "30px" }}>Memorable Moments</h2>
        <Swiper
          spaceBetween={20}
          slidesPerView={3}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={true}
          navigation
          pagination={{ clickable: true }}
          modules={[Autoplay, Navigation, Pagination]}
          style={{ maxWidth: "1200px", margin: "0 auto" }}
        >
          {images.map((img, i) => (
            <SwiperSlide key={i}>
              <div style={imageCardStyle}>
                <img src={img} alt={`Event ${i + 1}`} style={imageStyle} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "30px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          fontSize: "0.9rem",
          color: "#bbb",
          marginTop: "40px",
        }}
      >
        © {getCurrentYear()} EVENZA. All rights reserved.
      </footer>
    </div>
  );
}

const navLinkStyle: React.CSSProperties = {
  color: "#e0c3fc",
  textDecoration: "none",
  fontWeight: "500",
  transition: "color 0.3s",
};

const glowButtonStyle: React.CSSProperties = {
  marginTop: "30px",
  background: "linear-gradient(90deg, #ff0066, #9900ff)",
  border: "none",
  padding: "14px 32px",
  borderRadius: "30px",
  color: "#fff",
  fontWeight: "600",
  cursor: "pointer",
  fontSize: "1rem",
  boxShadow: "0 0 20px rgba(255,0,120,0.6)",
  transition: "all 0.3s",
};

const categoryContainer: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: "25px",
  margin: "30px 0",
  flexWrap: "wrap",
};

const categoryTabStyle: React.CSSProperties = {
  cursor: "pointer",
  padding: "8px 18px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.05)",
  color: "#bbb",
  transition: "all 0.3s",
};

const imageCardStyle: React.CSSProperties = {
  borderRadius: "14px",
  overflow: "hidden",
  boxShadow: "0 8px 25px rgba(255,0,120,0.3)",
  transition: "transform 0.3s, box-shadow 0.3s",
};

const imageStyle: React.CSSProperties = {
  width: "100%",
  height: "220px",
  objectFit: "cover",
};


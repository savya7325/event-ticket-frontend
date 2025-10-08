"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Event {
  _id: string;
  title: string;
  description: string;
  dates: string[];
  location?: string;
  price?: number;
  ticketsAvailable?: number;
  image?: string;
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      const id = params?.id;
      if (!id) return;
      
      try {
        const res = await fetch(`http://localhost:5000/api/events/${id}`);
        if (!res.ok) throw new Error("Failed to fetch event");
        const data = await res.json();
        console.log("Event data:", data);
        setEvent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (params?.id) fetchEvent();
  }, [params?.id]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a0000 0%, #330000 50%, #0d0d0d 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: "20px"
      }}>
        Loading event...
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a0000 0%, #330000 50%, #0d0d0d 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff"
      }}>
        Event not found
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a0000 0%, #330000 50%, #0d0d0d 100%)",
      padding: "40px 20px"
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Back Button */}
               <button
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            color: "#ff4444",
            fontSize: "16px",
            cursor: "pointer",
            marginBottom: "30px",
            padding: "10px 0",
            outline: "none"
          }}
        >
          ← Back
        </button>


        {/* Event Image */}
        <div style={{
          border: "2px solid #ff4444",
          borderRadius: "12px",
          overflow: "hidden",
          marginBottom: "40px",
          boxShadow: "0 8px 32px rgba(255, 68, 68, 0.2)",
          backgroundColor: "#1e1e1e"
        }}>
          <img
            src={event.image ? `http://localhost:5000/uploads/${event.image}` : "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=900&q=80"}
            alt={event.title}
            style={{
              width: "100%",
              height: "450px",
              objectFit: "cover",
              display: "block"
            }}
            onLoad={() => console.log("Image loaded successfully")}
            onError={(e) => {
              console.log("Image failed to load, using fallback");
              e.currentTarget.src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80";
            }}
          />
        </div>

        {/* Event Title */}
        <h1 style={{
          color: "#ff4444",
          fontSize: "2.5rem",
          fontWeight: "bold",
          marginBottom: "30px",
          lineHeight: "1.2"
        }}>
          {event.title}
        </h1>

        {/* Description */}
        <div style={{ marginBottom: "40px" }}>
          <p style={{
            color: "#f5f5f5",
            fontSize: "1.1rem",
            lineHeight: "1.9",
            marginBottom: "20px"
          }}>
            🎵 {event.title} is a breathtaking multi-band concert that brings energy, rhythm, and passion together in one electrifying night.
          </p>
          
          <p style={{
            color: "#f5f5f5",
            fontSize: "1.1rem",
            lineHeight: "1.9",
            marginBottom: "20px"
          }}>
            ✨ Join us for an unforgettable evening filled with incredible performances, stunning visuals, and an electric atmosphere that will leave you mesmerized. This is more than just a concert—it's an experience that celebrates the power of live music and the magic of being part of something extraordinary.
          </p>

         
          
          {/* <ul style={{
            color: "#f5f5f5",
            fontSize: "1.05rem",
            lineHeight: "1.8",
            marginBottom: "20px",
            paddingLeft: "25px"
          }}>
            <li style={{ marginBottom: "8px" }}>Live performances by talented musicians and bands</li>
            <li style={{ marginBottom: "8px" }}>State-of-the-art sound system and lighting effects</li>
            <li style={{ marginBottom: "8px" }}>Immersive stage production and visual displays</li>
            <li style={{ marginBottom: "8px" }}>High-energy performances across multiple genres</li>
            <li style={{ marginBottom: "8px" }}>Unforgettable atmosphere with passionate music lovers</li>
            <li style={{ marginBottom: "8px" }}>Professional photography and video coverage</li>
            <li style={{ marginBottom: "8px" }}>Premium venue with excellent acoustics</li>
            <li style={{ marginBottom: "8px" }}>Food and beverage stalls available</li>
          </ul> */}
{/* 
          <p style={{
            color: "#f5f5f5",
            fontSize: "1.1rem",
            lineHeight: "1.9",
            marginBottom: "20px"
          }}>
            Whether you're a die-hard music fan or simply looking for an amazing night out, this event promises to deliver an experience you won't forget. Get ready to dance, sing along, and create memories that will last a lifetime!
          </p> */}

          <p style={{
            color: "#f5f5f5",
            fontSize: "1.1rem",
            lineHeight: "1.9"
          }}>
            Don't miss this opportunity to be part of something spectacular. Join us for a night where music comes alive!
          </p>
        </div>

        {/* Divider */}
        <hr style={{
          border: "none",
          borderTop: "1px solid rgba(255, 68, 68, 0.3)",
          margin: "30px 0"
        }} />

        {/* Event Details */}
        <div>
          <h2 style={{
            color: "#ff4444",
            fontSize: "1.3rem",
            fontWeight: "bold",
            marginBottom: "20px"
          }}>
            Event Details
          </h2>

          {/* Event Dates */}
          {event.dates && event.dates.length > 0 && (
            <div style={{ marginBottom: "25px" }}>
              <p style={{
                color: "#aaa",
                fontSize: "0.95rem",
                marginBottom: "10px",
                fontWeight: "500"
              }}>
                📅 Event Dates:
              </p>
              <div style={{ paddingLeft: "20px" }}>
                {event.dates.map((date, index) => (
                  <p key={date} style={{
                    color: "#e0e0e0",
                    fontSize: "1rem",
                    marginBottom: "8px"
                  }}>
                    {index + 1}. {new Date(date).toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          {event.location && (
            <div style={{ marginBottom: "25px" }}>
              <p style={{
                color: "#aaa",
                fontSize: "0.95rem",
                marginBottom: "10px",
                fontWeight: "500"
              }}>
                📍 Location:
              </p>
              <p style={{
                color: "#e0e0e0",
                fontSize: "1rem",
                paddingLeft: "20px",
                margin: 0
              }}>
                {event.location}
              </p>
            </div>
          )}

          {/* Price */}
          {event.price && (
            <div style={{ marginBottom: "20px" }}>
              <p style={{
                color: "#aaa",
                fontSize: "0.95rem",
                marginBottom: "10px",
                fontWeight: "500"
              }}>
                💰 Ticket Price:
              </p>
              <p style={{
                color: "#e0e0e0",
                fontSize: "1rem",
                paddingLeft: "20px",
                margin: 0
              }}>
                ₹{event.price}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// "use client";

// interface Props {
//   title: string;
//   backgroundUrl?: string;
// }

// export default function EventHeader({
//   title,
//   backgroundUrl = "https://i.pinimg.com/736x/9c/96/b2/9c96b28af6e015157d268547d924ea11.jpg",
// }: Props) {
//   return (
//     <div
//       style={{
//         backgroundImage: `url('${backgroundUrl}')`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         height: "250px",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         color: "white",
//         fontSize: "2rem",
//         fontWeight: "bold",
//         textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
//       }}
//     >
//       {title}
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";

interface Props {
  title: string;
  images?: string[];
}

export default function EventHeader({
  title,
  images = [
    "https://images.pexels.com/photos/1047940/pexels-photo-1047940.jpeg",
    "https://images.pexels.com/photos/2102416/pexels-photo-2102416.jpeg",
    "https://images.pexels.com/photos/167491/pexels-photo-167491.jpeg",
    "https://images.pexels.com/photos/7991486/pexels-photo-7991486.jpeg",
    "https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg",
  ],
}: Props) {
  const [currentImage, setCurrentImage] = useState(0);
  const [currentTagline, setCurrentTagline] = useState(0);

  const taglines = [
    "Your gateway to unforgettable experiences.",
    "Book. Enjoy. Repeat.",
    "Find the best events happening around you.",
    "Don't just watch, be part of it.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [taglines.length]);

  return (
    <div
      style={{
        position: "relative",
        height: "70vh",
        minHeight: "450px",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {images.map((img, index) => (
        <div
          key={index}
          style={{
            backgroundImage: `url('${img}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "absolute",
            inset: 0,
            opacity: index === currentImage ? 1 : 0,
            transition: "opacity 1.5s ease-in-out",
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.8))",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          textAlign: "center",
          padding: "0 20px",
        }}
      >
        <h1
          style={{
            fontSize: "3.5rem",
            fontWeight: "bold",
            marginBottom: "15px",
            textTransform: "uppercase",
            letterSpacing: "3px",
            textShadow: "0px 4px 15px rgba(0,0,0,0.7)",
          }}
        >
          {title}
        </h1>
        <p
          key={currentTagline} 
          style={{
            fontSize: "1.2rem",
            fontWeight: "300",
            maxWidth: "700px",
            lineHeight: "1.5",
            textShadow: "0px 3px 10px rgba(0,0,0,0.7)",
            transition: "opacity 1s ease-in-out",
          }}
        >
          {taglines[currentTagline]}
        </p>
      </div>
    </div>
  );
}

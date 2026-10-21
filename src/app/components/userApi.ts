const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Thrown on 401 so pages can end the session and send the user to login.
export class AuthError extends Error {}

export interface BookingEvent {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  price?: number;
  image?: string;
  dates?: string[];
}

export interface Booking {
  _id: string;
  event: BookingEvent | null; // null when the event was deleted
  date: string;
  seats: string[];
  totalPrice?: number;
  createdAt?: string;
}

export interface Profile {
  _id: string;
  username: string;
  email: string;
  role: number;
  avatar?: string;
  createdAt?: string;
}

const request = async <T>(path: string, token: string, init: RequestInit = {}): Promise<T> => {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init.headers || {}) },
  });
  if (res.status === 401) throw new AuthError("Your session has expired. Please log in again.");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong. Please try again.");
  return data as T;
};

export const getMyBookings = (token: string) => request<Booking[]>("/api/bookings/mybookings", token);

export const getProfile = (token: string) =>
  request<{ user: Profile }>("/api/users/profile", token).then(d => d.user);

export const updateUsername = (token: string, username: string) =>
  request<{ user: Profile }>("/api/users/profile", token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  }).then(d => d.user);

export const uploadAvatar = (token: string, file: File) => {
  const body = new FormData();
  body.append("avatar", file);
  return request<{ avatarUrl: string }>("/api/users/profile/avatar", token, { method: "PUT", body });
};

export const removeAvatar = (token: string) =>
  request<{ message: string }>("/api/users/profile/avatar", token, { method: "DELETE" });

export const getEvents = async (): Promise<BookingEvent[]> => {
  const res = await fetch(`${API_URL}/api/events`);
  if (!res.ok) throw new Error("Failed to load events");
  return res.json();
};

export const eventImageUrl = (image?: string) => {
  if (!image) return undefined;
  if (image.startsWith("http")) return image;
  if (image.startsWith("/")) return `${API_URL}${image}`;
  return `${API_URL}/uploads/events/${image}`;
};

export const avatarUrlOf = (avatar?: string | null) => {
  if (!avatar || avatar === "default-avatar.png") return undefined;
  if (avatar.startsWith("http")) return avatar;
  if (avatar.startsWith("/")) return `${API_URL}${avatar}`;
  return `${API_URL}/uploads/avatars/${avatar}`;
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const isUpcoming = (b: Booking) => new Date(b.date) >= startOfToday();

export const bookingTotal = (b: Booking) => b.totalPrice ?? b.seats.length * (b.event?.price ?? 0);

export const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// "Today", "Tomorrow", "In 5 days", "3 days ago"
export const relativeDay = (date: string) => {
  const days = Math.round((new Date(date).setHours(0, 0, 0, 0) - startOfToday().getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  return days > 0 ? `In ${days} days` : `${-days} days ago`;
};

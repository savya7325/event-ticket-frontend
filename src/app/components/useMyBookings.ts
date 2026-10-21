"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useExpireSession } from "./UserShell";
import { AuthError, Booking, getMyBookings } from "./userApi";

// Loads the signed-in user's bookings, newest event date first.
export function useMyBookings() {
  const { user } = useAuth();
  const expireSession = useExpireSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = user?.token;

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMyBookings(token);
      setBookings([...data].sort((a, b) => +new Date(b.date) - +new Date(a.date)));
    } catch (err) {
      if (err instanceof AuthError) return expireSession();
      setError(err instanceof Error ? err.message : "Could not load bookings.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return { bookings, loading, error, reload: load };
}

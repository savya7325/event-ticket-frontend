// Seat maths shared by the seat map, event cards and dashboard. Mirrors Node/ticket/utils/seatLayout.js.

// Rows are lettered A–Z with up to 10 seats each.
export const MAX_CAPACITY = 260;

interface SeatInfo {
  capacity?: number;
  ticketsAvailable?: number;
  bookedSeats?: Record<string, string[]>;
  dates?: string[];
}

// Fixed seats per show. `ticketsAvailable` is only a fallback for responses from older backends.
export const capacityOf = (e: SeatInfo) => e.capacity || e.ticketsAvailable || 50;

// Show dates are keyed "YYYY-MM-DD" (they're stored at midnight UTC).
export const dayKey = (d: string | Date) => new Date(d).toISOString().slice(0, 10);

export const bookedOn = (e: SeatInfo, date: string) => e.bookedSeats?.[dayKey(date)] ?? [];

export const seatsLeftOn = (e: SeatInfo, date: string) => Math.max(capacityOf(e) - bookedOn(e, date).length, 0);

// The next date that hasn't passed yet (or the last date if they all have).
export const nextShowDate = (e: SeatInfo) => {
  const today = dayKey(new Date());
  const sorted = [...(e.dates ?? [])].sort();
  return sorted.find(d => dayKey(d) >= today) ?? sorted[sorted.length - 1];
};

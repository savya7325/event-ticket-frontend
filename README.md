#  Evenza: Event Ticket Booking

Discover events, pick your exact seats on a live seat map and book in seconds. Admins get a dashboard with charts and full control over events and bookings.

**🔗 Live demo: [evenza-tickets.vercel.app](https://evenza-tickets.vercel.app)**

> The API runs on Render's free plan, so the very first request after a quiet spell can take up to ~50 seconds while the server wakes up. After that it's fast.

## Try it

Use the **"Try a demo"** buttons on the login page, or sign in manually:

| Role | Email | Password | What you can do |
|---|---|---|---|
|  User | `savyaak07+demouser@gmail.com` | `Demo@1234` | Browse events, book seats, see My Bookings and your profile |
| 🛠️ Admin | `savyaak07+demoadmin@gmail.com` | `Demo@1234` | Dashboard, add / edit / delete events, manage bookings |

You can also register your own account (users only). Demo data is reset from time to time, so feel free to explore.

## Features

**For users**
- Event listing with posters, dates, venue and seats left per show
- Interactive seat map: pick seats per show date; booked seats are blocked
- Checkout and an email confirmation for every booking
- Home dashboard with your next event, stats and recent bookings
- Booking history with upcoming / past tabs, ticket-style cards
- Profile with photo upload and name editing

**For admins**
- Dashboard: KPIs, sign-ups / bookings / new-event activity chart, seat share donut, upcoming shows with occupancy, live activity feed
- Create, edit and delete events (poster upload, multiple show dates, seats per show)
- Search, filter and cancel bookings (seats go back on sale)

**Everywhere**
- Contact form that emails the team and auto-replies to the sender
- Dark, event-themed UI that works on phones, with toasts, confirm dialogs and loading states
- Role-based access (user / admin) with JWT auth

## Tech stack

| Frontend (this repo) | Backend ([ticket-booking-server](https://github.com/savya7325/ticket-booking-server)) |
|---|---|
| Next.js 15 (App Router), React 19, TypeScript | Node.js, Express 5 |
| MUI 7, MUI X Date Pickers, Swiper | MongoDB Atlas with Mongoose |
| Formik + Yup, Axios, dayjs | JWT auth, bcrypt, Multer uploads, Nodemailer |
| Deployed on **Vercel** | Deployed on **Render** |

## Run it locally

You'll need Node.js 20+ and the [backend](https://github.com/savya7325/ticket-booking-server) running (by default on port 5000).

```bash
git clone https://github.com/savya7325/event-ticket-frontend.git
cd event-ticket-frontend
npm install
```

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Then start the dev server and open http://localhost:3000:

```bash
npm run dev
```

## Project structure

```
src/app/
├── page.tsx               # Landing + login / sign-up
├── home/                  # User dashboard
├── events/                # Event list, seat map, checkout, add/edit form
├── mybookings/            # Booking history
├── profile/               # Profile & photo
├── admin/                 # Admin dashboard, events, bookings
├── about/ contact/        # Public pages
├── components/            # Shared UI, theme, navbar, toasts, API helpers
└── context/AuthContext.tsx
```

## Notes

- Event posters uploaded on the live demo may disappear when the free server restarts (Render's free plan has no persistent disk).
- Built as a personal portfolio project.

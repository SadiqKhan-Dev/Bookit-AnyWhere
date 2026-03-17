# BookIt — Complete Project Guide

> Airbnb-inspired multi-vertical booking platform for Salons, Hotels & Doctors

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Environment Setup](#4-environment-setup)
5. [Database Setup](#5-database-setup)
6. [Running the Project](#6-running-the-project)
7. [Authentication (Clerk)](#7-authentication-clerk)
8. [Payments (Stripe)](#8-payments-stripe)
9. [File Uploads (UploadThing)](#9-file-uploads-uploadthing)
10. [Maps (Mapbox)](#10-maps-mapbox)
11. [User Roles & Permissions](#11-user-roles--permissions)
12. [Platform Features](#12-platform-features)
13. [API Routes & Webhooks](#13-api-routes--webhooks)
14. [Server Actions Reference](#14-server-actions-reference)
15. [Adding a New Listing](#15-adding-a-new-listing)
16. [Booking Flow (Step by Step)](#16-booking-flow-step-by-step)
17. [Dashboard Guide](#17-dashboard-guide)
18. [Deployment (Vercel)](#18-deployment-vercel)
19. [Common Issues & Fixes](#19-common-issues--fixes)

---

## 1. Project Overview

**BookIt** is a production-ready SaaS booking platform that supports three business verticals:

| Vertical | Description | Booking Type |
|---|---|---|
| 💇 **Salon** | Hair, beauty & wellness | Time-slot appointments |
| 🏨 **Hotel** | Rooms, suites & stays | Check-in / Check-out dates |
| 🩺 **Medical** | Doctors & clinics | Appointment slots + telemedicine |

### Key Capabilities
- Multi-role system: Customers, Providers, and Admins
- Real-time availability checking
- Stripe payment integration with refund support
- Automatic email notifications via Clerk
- Provider dashboard with revenue analytics
- Review system (verified bookings only)
- Mapbox-powered map view
- Image uploads via UploadThing

---

## 2. Tech Stack

```
Frontend
├── Next.js 14          (App Router, Server Components)
├── TypeScript          (strict mode)
├── Tailwind CSS        (utility-first styling)
├── ShadCN UI           (accessible component library)
├── Framer Motion       (animations)
└── Lucide React        (icons)

Backend
├── Next.js Server Actions   (mutations, no REST API needed)
├── Prisma ORM               (type-safe DB client)
└── PostgreSQL               (relational database)

Services
├── Clerk           (authentication + RBAC)
├── Stripe          (payments + webhooks)
├── UploadThing     (image uploads)
└── Mapbox          (interactive maps)

State Management
├── Zustand         (client-side global state)
└── TanStack Query  (server state + caching)

Forms & Validation
├── React Hook Form (form management)
└── Zod             (schema validation)
```

---

## 3. Project Structure

```
booking/
├── prisma/
│   ├── schema.prisma          # Database schema (10 models)
│   └── seed.ts                # Sample data seeder
│
├── src/
│   ├── app/
│   │   ├── (auth)/            # Sign-in / Sign-up pages
│   │   ├── (public)/          # Browse + detail pages
│   │   │   ├── salons/
│   │   │   ├── hotels/
│   │   │   └── doctors/
│   │   ├── (dashboard)/       # Protected pages
│   │   │   ├── dashboard/     # Provider + customer dashboard
│   │   │   ├── bookings/      # Booking management
│   │   │   ├── onboarding/    # Role selection
│   │   │   └── settings/      # Account settings
│   │   ├── api/
│   │   │   ├── webhooks/clerk/   # Clerk user sync webhook
│   │   │   ├── webhooks/stripe/  # Stripe payment webhook
│   │   │   └── uploadthing/      # File upload handler
│   │   ├── layout.tsx         # Root layout with ClerkProvider
│   │   └── page.tsx           # Landing page
│   │
│   ├── actions/               # Server Actions (backend logic)
│   │   ├── booking.ts         # Create, cancel, confirm bookings
│   │   ├── listing.ts         # CRUD for listings, search
│   │   ├── review.ts          # Create reviews, respond
│   │   └── user.ts            # Sync, profile, dashboard stats
│   │
│   ├── components/
│   │   ├── ui/                # ShadCN base components
│   │   ├── shared/            # Navbar, Footer, Providers
│   │   ├── listings/          # ListingCard, SearchBar, Filter, ReviewList
│   │   ├── bookings/          # SalonWidget, HotelWidget, MedicalWidget
│   │   ├── maps/              # Mapbox ListingsMap
│   │   └── dashboard/         # Sidebar, Charts, Forms
│   │
│   ├── hooks/
│   │   └── use-toast.ts       # Toast notification hook
│   │
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── stripe.ts          # Stripe client + helpers
│   │   ├── uploadthing.ts     # UploadThing helpers
│   │   └── utils.ts           # formatCurrency, dates, slugify, etc.
│   │
│   ├── store/
│   │   ├── search-store.ts    # Search filters (Zustand)
│   │   └── booking-store.ts   # Booking selection state (Zustand)
│   │
│   ├── types/
│   │   └── index.ts           # TypeScript types & enriched Prisma types
│   │
│   └── validations/
│       └── index.ts           # All Zod schemas
│
├── middleware.ts               # Clerk route protection
├── .env.example                # Environment variable template
├── next.config.mjs
├── tailwind.config.ts
└── components.json             # ShadCN config
```

---

## 4. Environment Setup

### Step 1 — Copy the example file

```bash
cp .env.example .env.local
```

### Step 2 — Fill in all required values

```env
# ── DATABASE ──────────────────────────────────────────────
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME"

# ── CLERK AUTH ────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
CLERK_WEBHOOK_SECRET=whsec_...

# ── STRIPE ────────────────────────────────────────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ── UPLOADTHING ───────────────────────────────────────────
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...

# ── MAPBOX ────────────────────────────────────────────────
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1...

# ── APP ───────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Where to get each key

| Service | URL |
|---|---|
| PostgreSQL | [neon.tech](https://neon.tech) (free) or local Docker |
| Clerk | [clerk.com](https://clerk.com) → Create application |
| Stripe | [stripe.com](https://stripe.com) → Developers → API keys |
| UploadThing | [uploadthing.com](https://uploadthing.com) → Create app |
| Mapbox | [mapbox.com](https://mapbox.com) → Tokens |

---

## 5. Database Setup

### Push schema to database

```bash
npm run db:push
```

This creates all tables in your PostgreSQL database based on `prisma/schema.prisma`.

### Run migrations (production-safe)

```bash
npm run db:migrate
```

### Seed with sample data

```bash
npm run db:seed
```

This creates:
- ✅ 6 sample amenities
- ✅ 1 demo provider user
- ✅ 1 salon listing (NYC) with 5 services
- ✅ 1 hotel listing (Miami) with 3 room types
- ✅ 1 medical clinic (Chicago) with 2 doctors + 4 services

### Open Prisma Studio (visual DB editor)

```bash
npm run db:studio
```

Opens at `http://localhost:5555`

---

## 6. Running the Project

### Development server

```bash
npm run dev
```

App runs at: **http://localhost:3000**

### Production build

```bash
npm run build
npm run start
```

### Type checking

```bash
npx tsc --noEmit
```

---

## 7. Authentication (Clerk)

### Setup Clerk

1. Go to [clerk.com](https://clerk.com) and create a new application
2. Choose **Email + Password** and **Google OAuth**
3. Copy your keys to `.env.local`

### Setup Webhook (sync users to DB)

1. In Clerk Dashboard → **Webhooks** → Add Endpoint
2. URL: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`
4. Copy the **Signing Secret** → paste as `CLERK_WEBHOOK_SECRET`

**Why needed?** When a user signs up via Clerk, the webhook fires and creates the user record in your PostgreSQL database so Prisma can reference it.

### Route Protection

Routes protected by `middleware.ts`:
```
/dashboard/**
/bookings/**
/onboarding/**
/settings/**
```

---

## 8. Payments (Stripe)

### Setup Stripe

1. Create account at [stripe.com](https://stripe.com)
2. Go to **Developers → API Keys** → copy test keys

### Setup Webhook (confirm payments)

1. In Stripe Dashboard → **Developers → Webhooks** → Add Endpoint
2. URL: `https://your-domain.com/api/webhooks/stripe`
3. Events to listen for:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy **Signing Secret** → paste as `STRIPE_WEBHOOK_SECRET`

### Local Webhook Testing

Use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Payment Flow

```
Customer selects service/room
        ↓
Server Action creates Booking (status: PENDING)
        ↓
Stripe Checkout Session created
        ↓
Customer completes payment on Stripe
        ↓
Stripe fires webhook → booking status = CONFIRMED
        ↓
Customer redirected to /bookings/[id]/confirmation
        ↓
Both customer & provider get notifications
```

### Fee Structure

| Fee | Rate |
|---|---|
| Platform fee | 10% of subtotal |
| Taxes | 8% of subtotal |

Modify in `src/lib/stripe.ts`:
```typescript
export const PLATFORM_FEE_PERCENT = 0.1; // Change this
```

---

## 9. File Uploads (UploadThing)

### Setup

1. Create app at [uploadthing.com](https://uploadthing.com)
2. Copy `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` to `.env.local`

### Available upload routes

| Route | Use Case | Max Size |
|---|---|---|
| `listingCoverImage` | Listing cover photo | 8MB |
| `listingImages` | Listing gallery (up to 10) | 8MB each |
| `doctorImage` | Doctor profile photo | 4MB |

Defined in `src/app/api/uploadthing/core.ts`

### Usage in components

```tsx
import { UploadButton } from "@/lib/uploadthing";

<UploadButton
  endpoint="listingCoverImage"
  onClientUploadComplete={(res) => {
    console.log(res[0].url); // uploaded image URL
  }}
/>
```

---

## 10. Maps (Mapbox)

### Setup

1. Create account at [mapbox.com](https://mapbox.com)
2. Go to **Tokens** → Copy your default public token
3. Paste as `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

### Using the Map Component

```tsx
import { ListingsMap } from "@/components/maps/listings-map";

<ListingsMap
  markers={[
    {
      id: "listing-id",
      latitude: 40.7128,
      longitude: -74.0060,
      title: "My Salon",
      price: 5000,   // in cents
      type: "SALON",
    }
  ]}
  center={{ lat: 40.7128, lng: -74.0060 }}
  zoom={12}
/>
```

---

## 11. User Roles & Permissions

| Role | Can Do |
|---|---|
| **CUSTOMER** | Browse listings, make bookings, leave reviews, manage own bookings |
| **PROVIDER** | Everything above + create/manage listings, confirm/decline bookings, view analytics |
| **ADMIN** | Everything above + manage all users and listings |

### Become a Provider

After signing up, users go through `/onboarding` and select **"I'm a provider"**. This calls `becomeProvider()` which updates their role to `PROVIDER`.

### Change Role Manually (via Prisma Studio)

```
Open Prisma Studio → users table → change role field
```

---

## 12. Platform Features

### For Customers

| Feature | Location |
|---|---|
| Browse salons | `/salons` |
| Browse hotels | `/hotels` |
| Browse doctors | `/doctors` |
| Search & filter | Any browse page (sidebar filters) |
| Book a salon | `/salons/[slug]` → Booking widget |
| Book a hotel room | `/hotels/[slug]` → Booking widget |
| Book a doctor | `/doctors/[slug]` → Booking widget |
| View my bookings | `/bookings` |
| Booking confirmation | `/bookings/[id]/confirmation` |
| Leave a review | `/bookings` → after status = COMPLETED |
| Manage account | `/settings` |

### For Providers

| Feature | Location |
|---|---|
| Create listing | `/dashboard/listings/new` |
| View dashboard | `/dashboard` |
| Manage bookings | `/dashboard/bookings` |
| Confirm booking | `/dashboard/bookings` → Confirm button |
| View revenue | `/dashboard` → Revenue chart |

---

## 13. API Routes & Webhooks

| Route | Method | Description |
|---|---|---|
| `/api/webhooks/clerk` | POST | Syncs Clerk users to PostgreSQL |
| `/api/webhooks/stripe` | POST | Handles payment confirmations & refunds |
| `/api/uploadthing` | GET, POST | Handles file uploads |

All other data operations use **Server Actions** (no REST API).

---

## 14. Server Actions Reference

### Listing Actions (`src/actions/listing.ts`)

```typescript
createListing(data)           // Create a new listing
updateListing(id, data)       // Update listing details
deleteListing(id)             // Delete listing (provider only)
getListingBySlug(slug)        // Fetch listing with all relations
searchListings(filters)       // Search/filter/paginate listings
getProviderListings()         // Get all listings by logged-in provider
toggleListingStatus(id)       // Enable/disable listing
```

### Booking Actions (`src/actions/booking.ts`)

```typescript
createHotelBooking(data)      // Create hotel booking + Stripe session
createSalonBooking(data)      // Create salon booking + Stripe session
createMedicalBooking(data)    // Create medical booking + Stripe session
getUserBookings(status?)      // Customer's booking history
getProviderBookings(status?)  // Provider's incoming bookings
getBookingById(id)            // Single booking with all relations
cancelBooking(id)             // Cancel + auto-refund if paid
confirmBooking(id)            // Provider confirms booking
getAvailableSlots(id, date)   // Get free time slots for a date
```

### User Actions (`src/actions/user.ts`)

```typescript
syncUser()                    // Sync Clerk user to DB
getCurrentUser()              // Get current user with counts
updateProfile(data)           // Update name, phone
becomeProvider()              // Upgrade role to PROVIDER
getNotifications()            // Get user notifications
markNotificationsRead()       // Mark all as read
getDashboardStats()           // Stats for dashboard cards
```

### Review Actions (`src/actions/review.ts`)

```typescript
createReview(data)            // Create review (completed bookings only)
respondToReview(id, response) // Provider response to review
```

---

## 15. Adding a New Listing

### Via the UI

1. Sign up / Sign in
2. Go to `/onboarding` → select **"I'm a provider"**
3. Click **"List your space"** in the navbar (or go to `/dashboard/listings/new`)
4. Fill in the form:
   - Select listing type (Salon / Hotel / Medical)
   - Enter business name, description
   - Set starting price
   - Enter full address + coordinates
   - Add cover image URL
5. Click **"Create Listing"**
6. After creation, add services/rooms via Prisma Studio or extend the form

### Via Seed (for testing)

Edit `prisma/seed.ts` and add your listing data, then:

```bash
npm run db:seed
```

### Getting Coordinates

Use [mapbox.com/playground](https://docs.mapbox.com/playground/geocoding/) or Google Maps → right-click → copy coordinates.

---

## 16. Booking Flow (Step by Step)

### Salon Booking

```
1. Browse /salons → click listing
2. Widget: Select a service (haircut, color, etc.)
3. Widget: Pick date → available time slots load
4. Widget: Enter guest details (name, email, phone)
5. Click "Book & Pay" → redirect to Stripe checkout
6. Complete payment on Stripe
7. Webhook fires → booking status = CONFIRMED
8. Redirect to /bookings/[id]/confirmation
```

### Hotel Booking

```
1. Browse /hotels → click listing
2. Widget: Enter check-in, check-out, guests
3. Widget: Available rooms shown with pricing
4. Widget: Select a room
5. Widget: Enter guest details
6. Click "Reserve Now" → Stripe checkout
7. Payment → webhook → CONFIRMED
8. Confirmation page
```

### Medical Booking

```
1. Browse /doctors → click listing
2. Widget: Select appointment type (In-Person / Telemedicine)
3. Widget: Optionally select a specific doctor
4. Widget: Select service (consultation type)
5. Widget: Pick date + time slot
6. Widget: Enter patient details
7. Click "Book Appointment" → Stripe checkout
8. Payment → webhook → CONFIRMED
9. Confirmation page
```

---

## 17. Dashboard Guide

### Customer Dashboard (`/dashboard`)

- **Total Bookings** — all-time booking count
- **Confirmed** — active upcoming bookings
- **Completed** — past finished bookings
- **Total Spent** — all-time payment total
- **Recent Bookings** — last 5 bookings with status

### Provider Dashboard (`/dashboard`)

- **Total Revenue** — all-time earnings
- **Monthly Revenue** — this month's earnings
- **Total Bookings** — bookings received
- **Avg. Rating** — across all listings
- **Revenue Chart** — last 7 days bar chart
- **Recent Bookings** — latest 5 with amounts

### Managing Bookings (`/dashboard/bookings`)

Bookings are tabbed: **Pending → Confirmed → Completed → All**

- **Confirm** button → changes status to CONFIRMED, notifies customer
- **Decline** button → cancels booking, triggers refund if paid

---

## 18. Deployment (Vercel)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your/repo.git
git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import repo
2. Framework: **Next.js** (auto-detected)
3. Add all environment variables from `.env.local`
4. Change `NEXT_PUBLIC_APP_URL` to your Vercel URL
5. Deploy

### Step 3 — Update Webhook URLs

After deployment, update:
- **Clerk Webhook** → `https://your-app.vercel.app/api/webhooks/clerk`
- **Stripe Webhook** → `https://your-app.vercel.app/api/webhooks/stripe`

### Recommended Database for Production

Use [Neon](https://neon.tech) (serverless PostgreSQL):

```bash
# Connection string format:
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

---

## 19. Common Issues & Fixes

### ❌ `PrismaClientInitializationError`

**Cause:** DATABASE_URL is wrong or DB is not running.

**Fix:**
```bash
# Check your .env.local
echo $DATABASE_URL

# Test connection
npx prisma db push
```

---

### ❌ `Clerk webhook signature verification failed`

**Cause:** Wrong `CLERK_WEBHOOK_SECRET` or webhook not configured.

**Fix:**
1. Check Clerk dashboard → Webhooks → copy the signing secret
2. Paste it as `CLERK_WEBHOOK_SECRET` in `.env.local`
3. For local testing, use [ngrok](https://ngrok.com):
```bash
ngrok http 3000
# Use the https URL in Clerk webhook settings
```

---

### ❌ Stripe payments not confirming bookings

**Cause:** Stripe webhook not receiving events.

**Fix:**
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the webhook signing secret printed in terminal
# Set it as STRIPE_WEBHOOK_SECRET
```

---

### ❌ Images not loading (next/image error)

**Cause:** Image hostname not in `next.config.mjs` whitelist.

**Fix:** Add the hostname to `remotePatterns` in `next.config.mjs`:
```javascript
{ protocol: "https", hostname: "your-image-domain.com" }
```

---

### ❌ `Cannot find module 'autoprefixer'`

**Fix:**
```bash
npm install autoprefixer --save-dev --legacy-peer-deps
```

---

### ❌ Map not showing / blank map

**Cause:** Missing or invalid Mapbox token.

**Fix:**
1. Check `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is set
2. Make sure the token has `styles:read` and `tiles:read` scopes

---

## Quick Reference

```bash

npm run dev          # Start development server
npm run build        # Production build
npm run db:push      # Apply schema changes to DB
npm run db:migrate   # Create migration files
npm run db:studio    # Open Prisma Studio at :5555
npm run db:seed      # Seed sample data
npm run db:generate  # Regenerate Prisma client
npx tsc --noEmit     # Check TypeScript errors

```


---

*Built with ❤️ using Next.js 14, Prisma, Clerk, and Stripe.*

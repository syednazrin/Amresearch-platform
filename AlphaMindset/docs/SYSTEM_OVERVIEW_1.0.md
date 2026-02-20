# 1.0 System Overview Document

**AmResearch Platform (AMINVEST)**  
**Version:** 1.0  
**Last Updated:** February 2025

---

## 1. Introduction

### 1.1 Purpose

This document describes the high-level architecture, components, and capabilities of the **AmResearch Platform** (also referred to as AMINVEST or AlphaMindset in the codebase). The platform delivers institutional-grade investment research, analyst engagement, company visits (trips), and thought leadership to clients.

### 1.2 Scope

The system includes:

- **Public-facing website**: Landing page, research reports, Alpha Mindset content, company trips, analyst booking, and legal pages.
- **Admin panel**: Dashboard analytics, document management, trip management, bookings, analysts, social media embeds, and (for super admins) user management.
- **APIs**: REST-style API routes for auth, documents, feedback, trips, bookings, analysts, and analytics.

---

## 2. Technology Stack

| Layer | Technology |
|--------|------------|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Database** | MongoDB (e.g. Atlas), database name: `aminvest` |
| **File storage** | Cloudflare R2 (S3-compatible) for PDFs and trip images |
| **Auth** | Session-based (HTTP-only cookie, server-side session validation) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Deployment** | Vercel-ready (Node, serverless functions) |

---

## 3. System Architecture (High-Level)

```
                    ┌─────────────────────────────────────────────────┐
                    │                  Clients (Browser)                │
                    └─────────────────────┬───────────────────────────┘
                                          │
                    ┌─────────────────────▼───────────────────────────┐
                    │           Next.js Application (Vercel)            │
                    │  ┌──────────────┐  ┌──────────────┐             │
                    │  │  Public App  │  │  Admin App   │             │
                    │  │  (pages)     │  │  (layout +   │             │
                    │  │              │  │   pages)      │             │
                    │  └──────┬───────┘  └──────┬───────┘             │
                    │         │                 │                      │
                    │  ┌──────▼─────────────────▼───────┐             │
                    │  │     API Routes (App Router)     │             │
                    │  │  /api/auth, /api/documents,    │             │
                    │  │  /api/trips, /api/bookings,    │             │
                    │  │  /api/analysts, /api/admin/*   │             │
                    │  └──────┬─────────────────┬───────┘             │
                    └────────│─────────────────│──────────────────────┘
                             │                 │
              ┌──────────────▼──────┐  ┌───────▼────────────┐
              │     MongoDB          │  │  Cloudflare R2     │
              │  (aminvest DB)      │  │  (PDFs, images)   │
              └─────────────────────┘  └───────────────────┘
```

- **Public routes**: `/`, `/documents`, `/documents/[id]`, `/alpha-mindset`, `/trips`, `/trips/calendar`, `/trips/join/[id]`, `/book`, `/login`, `/privacy-policy`, `/terms-of-service`, `/branding`.
- **Admin routes** (protected): `/admin`, `/admin/documents`, `/admin/alpha-mindset`, `/admin/trips`, `/admin/bookings`, `/admin/analysts`, `/admin/social-media`, `/admin/users` (super admin only).
- **API**: All under `/api/*`; admin-only routes enforce `getSession()` and `isAdmin` (or `isSuperAdmin` for user management).

---

## 4. User Roles and Access Control

| Role | Description | Access |
|------|--------------|--------|
| **Public** | Unauthenticated visitor | Landing, research reports, document view, Alpha Mindset, trips, booking form, legal pages |
| **Admin** | Staff/analyst | All admin pages except User Management; dashboard, documents, trips, bookings, analysts, social media, Alpha Mindset CMS |
| **Super Admin** | Full control | All admin features + User Management (`/admin/users`) |

- **Authentication**: Login via `/api/auth/login` (email + password); session stored in HTTP-only cookie; validated by `getSession()` in `lib/auth.ts`.
- **Authorization**: API routes and admin layout check `session.isAdmin` or `session.isSuperAdmin`; unauthenticated or non-admin users are redirected or receive 401.

---

## 5. Core Modules and Features

### 5.1 Research Reports (Documents)

- **Public**: List at `/documents` with search (company/title), filters (industry, date, analyst, theme). Documents grouped by date; “Today’s reports” section can be targeted via `#today-reports`. Click-through to `/documents/[id]` for PDF viewer and feedback (agree/disagree, rating, comment).
- **Admin**: `/admin/documents` — table (title, company, industry, theme, analyst, file, uploaded, views, status); upload (PDF, title, description, company, industry, theme, analyst, published); view details modal (tabs: details, feedback); edit modal (title, description, company, industry, theme, analyst, published); delete; toggle publish/draft.
- **Data**: Documents stored in MongoDB with metadata; PDFs in R2; view count and feedback in `document_feedback` collection.
- **APIs**: `GET/PATCH/DELETE /api/documents/[id]`, `GET /api/documents`, `POST /api/documents/upload`, `GET /api/documents/[id]/feedback`, `POST /api/documents/[id]/view` (increment view).

### 5.2 Dashboard and Analytics

- **Admin**: `/admin` — KPIs (total reports, views, today’s views, average rating, agree %); view modes: **Daily** (today’s reports, views-by-hour chart), **General** (views over time, 7/30/all days), **Analyst** (select analyst → summary stats + list of reports; optional demo data).
- **APIs**: `GET /api/admin/stats`, `GET /api/admin/analytics/today-reports`, `GET /api/admin/analytics/views-today-by-hour`, `GET /api/admin/analytics/views-over-time`, `GET /api/admin/analytics/analyst-reports?analystId=`, `GET /api/admin/analytics/report/[id]` (per-report analytics).

### 5.3 Alpha Mindset (Thought Leadership)

- **Public**: `/alpha-mindset` — list of Alpha Mindset articles/entries (from API).
- **Admin**: `/admin/alpha-mindset` — manage Alpha Mindset content (CRUD).
- **APIs**: `GET/POST /api/alpha-mindset`, `GET/PUT/DELETE /api/alpha-mindset/[id]`.

### 5.4 Company Trips

- **Public**: `/trips` — list of trips; `/trips/calendar` — calendar view; `/trips/join/[id]` — trip detail and registration.
- **Admin**: `/admin/trips` — create/edit/delete trips; upload images (R2).
- **APIs**: `GET/POST /api/trips`, `GET/PUT/DELETE /api/trips/[id]`, `POST /api/trips/upload-image`, `GET/POST /api/trip-registrations`.

### 5.5 Analyst Booking

- **Public**: `/book` — book a meeting with an analyst; select analyst, date, time (availability-driven).
- **Admin**: `/admin/bookings` — view/manage bookings; `/admin/analysts` — CRUD analysts; `/admin/availability` — manage availability.
- **APIs**: `GET /api/analysts`, `GET/POST/PUT/DELETE /api/analysts/[id]`, `GET /api/availability`, `GET /api/admin/availability`, `GET/POST /api/bookings`, `GET/PATCH/DELETE /api/bookings/[id]`.

### 5.6 Social Media

- **Public**: Landing page includes Instagram embed section (configurable).
- **Admin**: `/admin/social-media` — manage Instagram (or other) embed codes.
- **APIs**: `GET /api/social-media`, `GET/POST/PUT/DELETE /api/social-media/[id]`.

### 5.7 User Management (Super Admin)

- **Admin**: `/admin/users` — list/create/edit admin users (super admin only).
- **APIs**: `GET/POST /api/admin/users`, `GET/PUT/DELETE /api/admin/users/[id]`.

### 5.8 Other

- **Analysis types**: Used in analysis/classification; APIs at `/api/analysis-types` and `/api/analysis-types/[id]`.
- **Branding**: Public `/branding` page.

---

## 6. Data Storage

### 6.1 MongoDB (Database: `aminvest`)

| Collection | Purpose |
|------------|--------|
| **users** | Admin/super-admin accounts (email, hashed password, isAdmin, isSuperAdmin, name, createdAt) |
| **documents** | Research reports (title, description, company, industry, theme, fileUrl, fileName, fileSize, analystId, viewCount, isPublished, uploadedAt, uploadedBy) |
| **document_feedback** | Per-document feedback (documentId, agreedWithThesis, rating, feedback, submittedAt) |
| **analysts** | Analysts (name, title, bio, photoUrl, availabilitySlots, order, sectors, isActive) |
| **bookings** | Analyst meeting bookings (name, email, phone, date, time, duration, notes, analystId) |
| **trips** | Company visits (companyName, date, location, description, imageUrl, etc.) |
| **trip_registrations** | Sign-ups for trips |
| **alpha_mindset** or similar | Alpha Mindset articles/entries |
| **social_media** | Social media embed configs (embedCode, order) |
| **availability** | Analyst availability slots |

(Specific collection names may vary slightly; the code uses `getCollection('...')` with names such as `documents`, `document_feedback`, `analysts`, `bookings`, `trips`, `users`.)

### 6.2 Cloudflare R2

- **Purpose**: Object storage for uploaded PDFs (research reports) and trip/other images.
- **Configuration**: Via `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ACCESS_KEY_ID`, `CLOUDFLARE_SECRET_ACCESS_KEY`, `CLOUDFLARE_BUCKET_NAME`, and optional `CLOUDFLARE_PUBLIC_DOMAIN`.
- **Usage**: Upload and delete via `lib/r2.ts` (uploadFile, deleteFile, extractKeyFromUrl); public URLs used in app for viewing PDFs and images.

---

## 7. API Overview (Summary)

| Area | Methods | Route Pattern | Auth |
|------|---------|----------------|------|
| Auth | GET, POST | `/api/auth/session`, `/api/auth/login`, `/api/auth/logout` | Session for protected |
| Documents | GET | `/api/documents` | Public (published) or Admin (all + analystId filter) |
| Documents | GET, PATCH, DELETE | `/api/documents/[id]` | Admin for PATCH/DELETE |
| Documents | POST | `/api/documents/upload` | Admin |
| Documents | GET, POST | `/api/documents/[id]/feedback`, `/api/documents/[id]/view` | As implemented |
| Admin analytics | GET | `/api/admin/stats`, `/api/admin/analytics/*` | Admin |
| Trips | GET, POST, etc. | `/api/trips`, `/api/trips/[id]`, `/api/trips/upload-image` | Mixed |
| Bookings | GET, POST, etc. | `/api/bookings`, `/api/bookings/[id]` | As implemented |
| Analysts | GET, POST, etc. | `/api/analysts`, `/api/analysts/[id]` | Admin for write |
| Alpha Mindset | GET, POST, etc. | `/api/alpha-mindset`, `/api/alpha-mindset/[id]` | Admin for write |
| Social media | GET, POST, etc. | `/api/social-media`, `/api/social-media/[id]` | Admin for write |
| Users | GET, POST, etc. | `/api/admin/users`, `/api/admin/users/[id]` | Super Admin |

---

## 8. Security Considerations

- **Session**: Stored in HTTP-only cookie; server-side validation on each protected request.
- **Passwords**: Hashed with bcrypt (e.g. 10 rounds) via `lib/auth.ts`.
- **Admin APIs**: Protected by `getSession()` and `session.isAdmin` (or `isSuperAdmin` for user management).
- **File uploads**: Admin-only upload; PDF type/size checks on document upload; R2 access via server-side credentials only.
- **Environment**: Secrets (MongoDB URI, R2 credentials, etc.) in environment variables (e.g. `.env.local`); not committed.

---

## 9. Deployment and Environment

- **Runtime**: Node.js; Next.js build (`next build`) and start (`next start`) or Vercel serverless.
- **Root for app**: Next.js application lives under the `AlphaMindset` directory; when deploying, root directory in Vercel should be set to `AlphaMindset` (or the repo root if it is the app root).
- **Environment variables (representative)**:
  - `MONGODB_URI` — MongoDB connection string.
  - `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ACCESS_KEY_ID`, `CLOUDFLARE_SECRET_ACCESS_KEY`, `CLOUDFLARE_BUCKET_NAME`, `CLOUDFLARE_PUBLIC_DOMAIN` — R2 storage.
- **Build**: `npm run build` (or equivalent) from the app directory; no special build steps beyond Next.js.

---

## 10. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 2025 | — | Initial system overview from codebase |

---

*This document is derived from the AmResearch Platform codebase and is intended to provide a single point of reference for system overview and onboarding.*

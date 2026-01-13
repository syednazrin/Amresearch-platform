# 4-Step Booking System with Analysts

## Overview

The booking system has been completely refactored to a **4-step flow** where users:
1. **Step 1**: Choose an analyst
2. **Step 2**: Select a date
3. **Step 3**: Select a time slot
4. **Step 4**: Enter full name, email, company, and reason for meeting

## What Changed

### Previous System
- Analysis types (Basic Review, Comprehensive Analysis, etc.)
- Each analysis type had different prices and durations
- 3-step flow: Choose analysis → Date/Time → Info

### New System
- **Analysts** (team members)
- Each analyst has their own availability schedule
- 4-step flow: Choose analyst → Date → Time → Info
- Form includes: Name, Email, Company, and Reason for meeting

## Database Structure

### `analysts` Collection
```javascript
{
  name: String,              // e.g., "Sarah Johnson"
  title: String,             // e.g., "Senior Investment Analyst"
  bio: String,               // Brief description
  photoUrl: String,          // Profile photo URL
  availabilitySlots: [       // Array of availability slots
    {
      dayOfWeek: Number,     // 0=Sunday, 1=Monday, etc.
      startTime: String,     // "09:00"
      endTime: String        // "17:00"
    }
  ],
  isActive: Boolean,         // Whether visible to users
  order: Number,             // Display order
  createdAt: Date,
  updatedAt: Date
}
```

### Updated `bookings` Collection
- Changed from `analysisTypeId` to `analystId`
- `phone` field now stores company name
- `notes` field stores reason for meeting

## Seeded Analysts

The database has been seeded with 4 sample analysts:

1. **Sarah Johnson** - Senior Investment Analyst
   - Available: Mon/Wed/Fri mornings and Mon/Wed afternoons
   - Specializes in technology and healthcare sectors

2. **Michael Chen** - Chief Market Strategist
   - Available: Tue/Thu (9am-12pm, 2pm-4pm)
   - Expert in macroeconomic analysis

3. **Emily Rodriguez** - ESG & Sustainable Investment Specialist
   - Available: Mon/Wed/Fri (various times)
   - Focused on environmental, social, and governance investing

4. **David Park** - Emerging Markets Analyst
   - Available: Tue/Thu afternoons, Fri (2pm-4pm)
   - Specializes in Asian and Latin American markets

## API Endpoints

### Analysts
- `GET /api/analysts` - Get all active analysts
- `POST /api/analysts` - Create new analyst (admin)
- `GET /api/analysts/[id]` - Get specific analyst
- `PUT /api/analysts/[id]` - Update analyst (admin)
- `DELETE /api/analysts/[id]` - Delete analyst (admin)

### Updated Availability API
- `GET /api/availability?date=YYYY-MM-DD&analystId=xxx`
  - Now accepts `analystId` instead of `analysisTypeId`
  - Returns available time slots for the specified analyst on that date

### Updated Bookings API
- `POST /api/bookings` - Now accepts `analystId` instead of `analysisTypeId`
- `GET /api/bookings` - Returns bookings with populated analyst info

## Admin Features

### New Page: `/admin/analysts`
- Full CRUD interface for managing analysts
- Add/edit analyst profile with:
  - Name and title
  - Bio and photo URL
  - Availability slots (by day of week and time range)
  - Active/inactive status
  - Display order
- Visual card layout showing analyst info and availability

### Updated Bookings Page
- Shows which analyst each booking is with
- Displays company name (stored in phone field)
- Shows analyst's name with sparkle icon

### Updated Dashboard
- Quick action card now says "Manage Analysts"
- Links to `/admin/analysts`

## User Booking Flow

### Step 1: Choose Analyst
- Browse all available analysts
- See analyst photo, name, title, and bio
- Click to select an analyst

### Step 2: Select Date
- Calendar shows dates when selected analyst is available
- Based on analyst's configured availability slots
- Continue button appears after selecting date

### Step 3: Select Time
- Grid of available time slots for that date
- Times filtered based on existing bookings
- 15-minute time slot intervals
- Continue button appears after selecting time

### Step 4: Enter Information
- Booking summary shown at top
- Form fields:
  - **Full Name** (required)
  - **Email Address** (required)
  - **Company** (optional)
  - **Reason for Meeting** (optional)
- Confirm booking button

### Confirmation
- Success message with booking details
- Shows analyst name, date, and time
- Return to home button

## Testing the System

1. **Start dev server**: Already running at `http://localhost:3000`

2. **Test public booking**:
   - Visit `/book`
   - Select an analyst (e.g., Sarah Johnson)
   - Choose a date (select a Monday)
   - Pick a time slot (morning slots available)
   - Fill in name, email, company, reason
   - Submit booking

3. **View as admin**:
   - Login at `/login` (admin@aminvest.com / admin123)
   - Go to `/admin/bookings` to see the new booking
   - See analyst name displayed with booking

4. **Manage analysts**:
   - Go to `/admin/analysts`
   - Add a new analyst with custom availability
   - Edit existing analysts
   - Test booking with the new analyst

## Files Created/Modified

### New Files
- `/app/api/analysts/route.ts`
- `/app/api/analysts/[id]/route.ts`
- `/app/admin/analysts/page.tsx`

### Modified Files
- `/app/book/page.tsx` - Complete rewrite for 4-step flow
- `/app/api/availability/route.ts` - Changed to use analystId
- `/app/api/bookings/route.ts` - Changed to use analystId and populate analyst info
- `/app/admin/bookings/page.tsx` - Display analyst info instead of analysis type
- `/app/admin/layout.tsx` - Menu changed from "Analysis Types" to "Analysts"
- `/app/admin/page.tsx` - Quick action changed to "Manage Analysts"
- `/scripts/seed.js` - Removed analysis types, added analysts

### Files to Delete (optional)
- `/app/api/analysis-types/` - No longer needed
- `/app/admin/analysis-types/` - No longer needed

## Summary

✅ Analyst-based booking system implemented
✅ 4-step booking flow: Analyst → Date → Time → Info
✅ Each analyst has unique availability schedule
✅ Admin can manage analyst profiles
✅ Form includes company and reason fields
✅ Database seeded with 4 sample analysts
✅ All APIs updated to use analysts instead of analysis types
✅ Bookings show analyst information

# Multi-Step Booking System with Analysis Types

## Overview

The booking system has been refactored into a multi-step flow where users:
1. **Step 1**: Choose an analysis type
2. **Step 2**: Select date and time
3. **Step 3**: Enter their contact information

Each analysis type has its own availability slots and pricing.

## What's New

### 1. Analysis Types Management

- **Admin Page**: `/admin/analysis-types`
  - Create, edit, and delete analysis types
  - Configure unique availability slots for each analysis type
  - Set duration, price, and descriptions
  - Control active/inactive status

### 2. Multi-Step Booking Flow

- **Public Booking Page**: `/book`
  - Step 1: Select from available analysis types
  - Step 2: Choose date and time based on the selected analysis type's availability
  - Step 3: Fill in contact information and review booking summary

### 3. Database Collections

#### `analysis_types` Collection
```javascript
{
  name: String,              // e.g., "Basic Portfolio Review"
  description: String,       // Description of the analysis
  duration: Number,          // Duration in minutes
  price: Number,             // Price in USD
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

#### Updated `bookings` Collection
Now includes `analysisTypeId` field to link bookings to analysis types.

### 4. Seeded Analysis Types

The database has been seeded with 4 sample analysis types:

1. **Quick Q&A Session** (15 min, Free)
   - Available Monday-Friday
   - For quick questions

2. **Basic Portfolio Review** (30 min, Free)
   - Available Mon/Wed/Fri
   - Quick portfolio review

3. **Comprehensive Financial Analysis** (60 min, $150)
   - Available Tue/Thu
   - In-depth financial analysis

4. **Premium Investment Strategy Session** (90 min, $300)
   - Available Tue/Wed/Thu
   - Advanced strategies with senior advisors

## API Endpoints

### Analysis Types
- `GET /api/analysis-types` - Get all active analysis types
- `POST /api/analysis-types` - Create new analysis type (admin)
- `GET /api/analysis-types/[id]` - Get specific analysis type
- `PUT /api/analysis-types/[id]` - Update analysis type (admin)
- `DELETE /api/analysis-types/[id]` - Delete analysis type (admin)

### Updated Availability API
- `GET /api/availability?date=YYYY-MM-DD&analysisTypeId=xxx`
  - Now accepts `analysisTypeId` to filter slots by analysis type
  - Falls back to global `availability_slots` if no `analysisTypeId` provided

### Updated Bookings API
- `POST /api/bookings` - Now accepts `analysisTypeId` field
- `GET /api/bookings` - Returns bookings with populated analysis type info

## Admin Features

### New Menu Item
- **Analysis Types** added to admin sidebar navigation
- Quick action card on dashboard

### Bookings Management
- Admin bookings page now displays the analysis type for each booking
- Shows analysis type name with a sparkle icon

## How to Use

### For Admins

1. **Login**: Visit `/login` with `admin@aminvest.com` / `admin123`

2. **Manage Analysis Types**: Go to `/admin/analysis-types`
   - Click "Add Analysis Type"
   - Fill in name, description, duration, and price
   - Add availability slots by selecting day, start time, and end time
   - Click "Add Slot" for each slot
   - Set display order and active status
   - Click "Create"

3. **View Bookings**: Go to `/admin/bookings`
   - See which analysis type each booking is for
   - Confirm or cancel bookings

### For Users

1. **Book a Meeting**: Visit `/book`

2. **Step 1 - Choose Analysis**: 
   - Browse available analysis types
   - See duration, price, and description
   - Click on desired analysis type

3. **Step 2 - Select Time**:
   - View calendar with available dates (based on analysis type slots)
   - Select a date
   - Choose from available time slots
   - Click "Continue to Your Information"

4. **Step 3 - Enter Details**:
   - Review booking summary
   - Fill in name, email, phone (optional), and notes
   - Click "Confirm Booking"

5. **Confirmation**: Receive confirmation message with booking details

## Testing

To test the system:

1. Start the dev server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Book a Meeting" in the navigation
4. Go through the 3-step booking flow
5. Login as admin to see the booking in `/admin/bookings`

## Notes

- Each analysis type can have different availability schedules
- The system prevents double-booking for the same time slot
- Availability is checked in real-time based on existing bookings
- The old `availability_slots` collection is still supported as a fallback

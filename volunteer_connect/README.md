# Volunteer Connect — Full-Stack Web Application

**Volunteer Connect** is a college Computer Science project web application designed to connect Volunteers, NGO Representatives, Sponsors, and System Administrators on a unified, role-based platform.

Built using **Next.js (App Router)**, **TypeScript**, **React**, **Tailwind CSS**, and **Supabase** (PostgreSQL, Supabase Auth, Supabase Realtime, and Row Level Security).

---

## Technical Features Overview

- **Authentication & Authorization**: Email/Password authentication powered by Supabase Auth with session persistence, role selection (`Volunteer`, `NGO Representative`, `Sponsor`), and pending profile status workflows.
- **Role-Based Protected Routes**: Middleware enforcing role segregation for `/volunteer/*`, `/ngo/*`, `/sponsor/*`, and `/admin/*`.
- **Database Architecture**: PostgreSQL schema with foreign key cascades, triggers, unique application constraints, and Row Level Security (RLS) policies.
- **Supabase Realtime Chat**: Instant bidirectional messaging between NGOs and volunteers who have been **selected** for events.
- **Sponsor Campaign & Funding**: Mock donation system updating event accumulated funds, funding progress bars, and donation history tracking.
- **Admin Supervision**: Complete administrative management to review pending registrations (Approve/Reject), view all active users, monitor events, and analyze platform metrics.

---

## Setup & Installation Instructions

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- A Supabase account and project (or local Supabase setup)

### 2. Install Dependencies
Run the following command in the project directory:
```bash
npm install
```

### 3. Environment Variables Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Update `.env.local` with your Supabase project URL and Publishable Anon Key:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

---

## Database Configuration (Supabase SQL)

### How to Apply `schema.sql`
1. Log in to your [Supabase Dashboard](https://app.supabase.com/).
2. Navigate to your project's **SQL Editor**.
3. Open the file `schema.sql` from this codebase, copy all contents, paste it into the SQL Editor, and click **Run**.
4. This script creates all 5 tables (`profiles`, `ngo_events`, `event_applications`, `donations`, `messages`), indexes, trigger functions, RLS policies, and enables Realtime on the `messages` table.

---

## How to Create an Admin Account

Since public registration prevents selecting the Admin role, create an Admin account using the following steps:

1. **Register a user** via the `/register` page with email `admin@volunteerconnect.com` and role `Volunteer` or `NGO`.
2. Open the **SQL Editor** in Supabase and execute:
```sql
UPDATE profiles
SET role = 'admin', status = 'approved'
WHERE email = 'admin@volunteerconnect.com';
```
3. Sign out and log in again with `admin@volunteerconnect.com`. You will be automatically redirected to `/admin/dashboard` with full privileges.

---

## How to Run the Project Locally

To start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

To build the project for production:
```bash
npm run build
```

---

## Role Testing Workflows

### 1. Volunteer Workflow
1. Navigate to `/register` -> Select **Volunteer** -> Enter details and submit.
2. Log in as **Admin** in another tab and navigate to `/admin/profiles` -> Click **Approve**.
3. Log in as the Volunteer -> Navigate to `/volunteer/events` -> Click **Send Request** on an active event.
4. Verify status appears under `/volunteer/applications`.
5. Once selected by an NGO, check `/volunteer/my-events` and open `/volunteer/chat` to message the NGO.

### 2. NGO Representative Workflow
1. Navigate to `/register` -> Select **NGO Rep** -> Enter organization details and submit.
2. Approve profile via Admin Dashboard (`/admin/profiles`).
3. Log in as NGO -> Navigate to `/ngo/events` -> Click **Create New Event** (fill details and enable funding).
4. Navigate to `/ngo/applications` -> Click **Select** on a volunteer applicant.
5. Open `/ngo/chat` to communicate with the selected volunteer in real-time.
6. Use `/ngo/volunteers` to search approved volunteers by skill and schedule.

### 3. Sponsor Workflow
1. Navigate to `/register` -> Select **Sponsor** -> Enter details and submit.
2. Approve profile via Admin Dashboard.
3. Log in as Sponsor -> Navigate to `/sponsor/events` -> View active funding campaigns with progress bars.
4. Click **Make a Donation** -> Enter mock donation amount -> Submit.
5. Verify accumulated funds update on progress bar and check `/sponsor/history`.

### 4. Admin Workflow
1. Log in with an Admin account -> View `/admin/dashboard` metrics.
2. Navigate to `/admin/profiles` to **Approve** or **Reject** pending users.
3. View `/admin/users` to list all system users.
4. View `/admin/events` to monitor created events.
5. View `/admin/reports` for platform statistics.

---

## Summary of Completed Deliverables

### Files Created
- **Database & Types**: `schema.sql`, `types/database.ts`, `.env.example`
- **Supabase Utilities**: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `middleware.ts`
- **UI Components**:
  - `components/ui/Badge.tsx`
  - `components/ui/Button.tsx`
  - `components/ui/DashboardCard.tsx`
  - `components/ui/Modal.tsx`
  - `components/ui/ProgressBar.tsx`
  - `components/ui/EmptyState.tsx`
  - `components/ui/Toast.tsx`
- **Layout Components**: `Navbar.tsx`, `Sidebar.tsx`, `DashboardLayout.tsx`
- **Chat System**: `components/chat/ChatWindow.tsx`
- **Auth & System Pages**:
  - `app/page.tsx` (Landing Page)
  - `app/login/page.tsx`
  - `app/register/page.tsx`
  - `app/pending/page.tsx`
  - `app/rejected/page.tsx`
- **Admin Dashboard Pages**:
  - `app/admin/layout.tsx`
  - `app/admin/dashboard/page.tsx`
  - `app/admin/profiles/page.tsx`
  - `app/admin/users/page.tsx`
  - `app/admin/events/page.tsx`
  - `app/admin/reports/page.tsx`
- **Volunteer Dashboard Pages**:
  - `app/volunteer/layout.tsx`
  - `app/volunteer/dashboard/page.tsx`
  - `app/volunteer/events/page.tsx`
  - `app/volunteer/applications/page.tsx`
  - `app/volunteer/my-events/page.tsx`
  - `app/volunteer/profile/page.tsx`
  - `app/volunteer/chat/page.tsx`
- **NGO Dashboard Pages**:
  - `app/ngo/layout.tsx`
  - `app/ngo/dashboard/page.tsx`
  - `app/ngo/profile/page.tsx`
  - `app/ngo/events/page.tsx`
  - `app/ngo/applications/page.tsx`
  - `app/ngo/volunteers/page.tsx`
  - `app/ngo/chat/page.tsx`
- **Sponsor Dashboard Pages**:
  - `app/sponsor/layout.tsx`
  - `app/sponsor/dashboard/page.tsx`
  - `app/sponsor/events/page.tsx`
  - `app/sponsor/history/page.tsx`

### Database Tables
- `profiles`
- `ngo_events`
- `event_applications`
- `donations`
- `messages`

### RLS Security Policies
Row level security rules configured for all tables restricting access by role, owner ID, and application selection status.

### System Routes
- `/` (Public Landing Page)
- `/login` & `/register`
- `/pending` & `/rejected`
- `/admin/*` (`/dashboard`, `/profiles`, `/users`, `/events`, `/reports`)
- `/volunteer/*` (`/dashboard`, `/events`, `/applications`, `/my-events`, `/profile`, `/chat`)
- `/ngo/*` (`/dashboard`, `/profile`, `/events`, `/applications`, `/volunteers`, `/chat`)
- `/sponsor/*` (`/dashboard`, `/events`, `/history`)

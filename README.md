# HostelTrack - Student Attendance Management System

A Progressive Web App (PWA) for hostel wardens to efficiently manage and track student attendance across multi-floor hostel buildings.

## Project info

**URL**: https://lovable.dev/projects/4fe2bfab-d715-473d-b803-f69b4ac236ff

## Features

### Core Features ✅
- Multi-floor navigation system (8 floors)
- Room-wise attendance marking with tap-to-mark interface
- Real-time data synchronization with Supabase
- Offline support with automatic sync when reconnected
- Excel report generation and download
- Attendance history with date filtering
- PWA capabilities (installable on mobile devices)
- Network status monitoring

### Security Features ✅
- Supabase authentication with email/password
- Row Level Security (RLS) policies on all tables
- Role-based access control (warden/admin roles)
- Secure session management
- Protected routes

### Performance Features ✅
- Optimistic UI updates for instant feedback
- Database query optimization with indexes
- React Query caching (1-5 minute stale times)
- Error boundaries for graceful error handling
- Loading states and skeleton screens

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time subscriptions)
- **State Management**: Zustand, TanStack React Query
- **PWA**: vite-plugin-pwa, Workbox
- **Excel Generation**: SheetJS (xlsx)
- **Offline Storage**: IndexedDB (idb)
- **Form Validation**: Zod, React Hook Form

## Database Schema

### Tables
- `profiles` - User profile information (linked to auth.users)
- `user_roles` - User role assignments (warden/admin)
- `floors` - Floor configuration (8 floors, 10 rooms each)
- `rooms` - Room details with bed types and capacity
- `students` - Student information with room assignments
- `attendance_records` - Daily attendance records with status

### Security
All tables have Row Level Security (RLS) enabled with appropriate policies using security definer functions.

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Supabase account (already configured)

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm install

# Step 4: Start development server
npm run dev
```

### Supabase Configuration

⚠️ **Important Security Settings**:

1. **Enable Leaked Password Protection**:
   - Go to Supabase Dashboard → Authentication → Providers → Email
   - Enable "Leaked Password Protection"
   - [Learn more](https://supabase.com/docs/guides/auth/password-security)

2. **Configure Authentication URLs**:
   - Go to Authentication → URL Configuration
   - Set **Site URL** to your deployed app URL
   - Add your preview and production URLs to **Redirect URLs**

### Environment Variables

The `.env` file is already configured with Supabase credentials:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## How to Use

### First-Time Setup
1. Sign up with email and password at `/auth`
2. A profile and warden role are automatically created
3. Access the dashboard to start marking attendance

### Marking Attendance
1. Navigate to Floors from dashboard
2. Select a floor to view rooms
3. Select a room to see students
4. Tap students who are **absent** (all others marked present)
5. Add optional notes and submit

### Generating Reports
1. Go to Reports tab
2. Select date range and report type (Daily/Weekly/Monthly)
3. Generate and download Excel file

### Viewing History
1. Go to History tab
2. Use date picker and filters
3. View detailed attendance records

## PWA Features

### Installation
Users can install the app on their devices:
- **iOS**: Safari → Share → Add to Home Screen
- **Android**: Chrome → Menu → Install App
- **Desktop**: Click install prompt in browser

### Offline Support
- Attendance data cached locally using IndexedDB
- Automatic queue management for offline submissions
- Syncs automatically when connection restored
- Visual offline indicator in UI

## User Roles

### Warden (Default)
- Mark attendance for any room
- View attendance history
- Generate reports
- Update their own profile

### Admin
- All warden permissions
- View all user roles
- Manage student data

## How can I edit this code?

There are several ways of editing your application:

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4fe2bfab-d715-473d-b803-f69b4ac236ff) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Development

### Key Commands
```bash
npm run dev          # Start dev server (port 8080)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Project Structure
```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── error/         # Error boundary
│   ├── layout/        # Layout components (Header, Nav)
│   └── ui/            # shadcn/ui components
├── hooks/             # Custom React hooks
│   ├── useAuth.ts           # Authentication hook
│   ├── useAttendance.ts     # Local attendance state
│   ├── useAttendanceData.ts # Supabase attendance queries
│   ├── useStudents.ts       # Student data queries
│   ├── useRooms.ts          # Room and floor queries
│   ├── useOfflineSync.ts    # Offline queue management
│   └── useRealtimeAttendance.ts # Real-time subscriptions
├── integrations/
│   └── supabase/      # Supabase client and types
├── pages/             # Page components
│   ├── Dashboard.tsx         # Main dashboard
│   ├── Floors.tsx           # Floor selection
│   ├── RoomLayout.tsx       # Room grid view
│   ├── AttendanceMarking.tsx # Attendance interface
│   ├── AttendanceHistory.tsx # History view
│   ├── Reports.tsx          # Report generation
│   ├── Settings.tsx         # User settings
│   └── Auth.tsx             # Login/signup
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
│   └── excelExport.ts # Excel generation
└── data/              # Mock data for development
```

## Performance Optimizations

- Database indexes on attendance_records, students, and rooms
- React Query with intelligent caching strategies
- Optimistic UI updates for instant feedback
- Lazy loading and code splitting
- Service worker caching for assets and API calls

## Deployment

Simply open [Lovable](https://lovable.dev/projects/4fe2bfab-d715-473d-b803-f69b4ac236ff) and click on Share -> Publish.

## Custom Domain

Yes, you can connect a custom domain!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Testing Checklist

### Authentication
- [x] Sign up with email
- [x] Login with credentials
- [x] Session persistence
- [x] Logout functionality

### Attendance Flow
- [x] Navigate floors
- [x] View room layouts
- [x] Mark student attendance
- [x] Submit to database
- [x] Real-time updates

### Offline Mode
- [x] Network status indicator
- [x] Offline queue management
- [x] Auto-sync on reconnect

### Reports
- [x] Generate Excel files
- [x] Download functionality
- [x] Date filtering

### Security
- [x] RLS policies active
- [x] Role-based access
- [x] Protected routes

## Support

For issues or questions:
- [Lovable Documentation](https://docs.lovable.dev)
- [Supabase Documentation](https://supabase.com/docs)

## License

MIT License - feel free to use this project for your needs.

# ExamCraft Frontend

A modern Next.js application for AI-powered exam preparation with Supabase authentication.

## Features

- 🔐 **Complete Authentication System** - Sign up, sign in, and user management
- 🎨 **Modern UI Components** - Built with Tailwind CSS and Radix UI
- 📱 **Responsive Design** - Works perfectly on all devices
- 🔒 **Secure** - Integrated with Supabase Auth and PostgreSQL
- ⚡ **Fast** - Built with Next.js 14 and App Router

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Setup

Make sure you have run the SQL scripts from the parent directory:

1. `database-schema.sql` - Creates all the necessary tables
2. `supabase-integration.sql` - Sets up triggers and RLS policies

## Authentication Flow

### Sign Up Process

1. User fills out the registration form
2. Supabase creates the auth user
3. Database trigger automatically creates user profile
4. Email verification sent (if enabled)
5. User redirected to sign in

### Sign In Process

1. User enters credentials
2. Supabase validates authentication
3. User profile fetched from database
4. Redirected to dashboard

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard
│   └── page.tsx           # Home page
├── components/
│   ├── ui/                # Reusable UI components
│   └── features/
│       └── auth/          # Authentication components
├── hooks/
│   └── useAuth.ts         # Authentication hook
├── lib/
│   ├── supabase.ts        # Supabase client
│   └── utils.ts           # Utility functions
└── types/                 # TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Technologies Used

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **TypeScript**: Full type safety
- **Icons**: Lucide React

## Authentication Features

✅ User registration with profile data  
✅ Email/password sign in  
✅ Protected routes  
✅ User profile management  
✅ Automatic session handling  
✅ Password visibility toggle  
✅ Form validation  
✅ Error handling  
✅ Loading states  
✅ Responsive design

## Next Steps

The authentication system is complete and ready for use. You can now:

1. **Add Quiz Features** - Create quiz generation and taking functionality
2. **Add Exam System** - Implement timed mock exams
3. **Add Flashcards** - Build spaced repetition system
4. **Add Analytics** - Create performance tracking dashboard
5. **Add File Upload** - Allow users to upload study materials

## Support

If you encounter any issues with the authentication system, check:

1. Environment variables are correctly set
2. Supabase project is properly configured
3. Database tables and triggers are created
4. RLS policies are enabled

## License

This project is part of the ExamCraft platform.

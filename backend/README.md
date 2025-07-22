# ExamCraft Backend

A powerful NestJS backend API for ExamCraft - an AI-powered quiz and flashcard platform that helps users create, manage, and take interactive quizzes and flashcards.

## Features

- 🔐 **Authentication & Authorization** - JWT-based user authentication
- 📝 **Quiz Management** - Create, update, and manage quizzes
- 🎯 **Flashcard System** - Interactive flashcard creation and study sessions
- 🤖 **AI Integration** - OpenRouter AI for intelligent content generation
- 📊 **Analytics Dashboard** - Track progress and performance metrics
- 🗄️ **Supabase Integration** - Real-time database with PostgreSQL
- 📖 **API Documentation** - Auto-generated Swagger documentation
- 🚀 **Modern Stack** - Built with NestJS, TypeScript, and modern best practices

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (for cloning the repository)

## Required External Services

You'll need accounts and API keys for:

1. **Supabase** - Database and authentication
   - Create a free account at [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and API keys

2. **OpenRouter** - AI content generation
   - Create an account at [openrouter.ai](https://openrouter.ai)
   - Get your API key from the dashboard

## Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd examcraft/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend root directory:

```bash
# Copy the example environment file
cp .env.example .env
```

If `.env.example` doesn't exist, create `.env` with the following variables:

```env
# Application Configuration
NODE_ENV=development
PORT=5001
VERSION=1.0.0

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Alternative Supabase keys (if using shared frontend config)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter AI Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# JWT Configuration
SUPABASE_JWT_SECRET=your_supabase_jwt_secret_here
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Cookie Configuration (Production - Optional)
# Only needed if you have a custom domain in production
# COOKIE_DOMAIN=your_domain.com

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

### 4. Database Setup

#### Configure Supabase:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select an existing one
3. Go to **Settings** → **API** to find your keys:
   - `Project URL` → Use for `SUPABASE_URL`
   - `anon public` key → Use for `SUPABASE_ANON_KEY`
   - `service_role secret` key → Use for `SUPABASE_SERVICE_ROLE_KEY`

#### Set up Database Schema:

If schema files exist in the project:
```bash
# Check if schema files exist
ls ../frontend/info/
```

Run the schema files in your Supabase SQL editor:
1. Go to **SQL Editor** in your Supabase dashboard
2. Run the contents of `database-schema.sql` and `supabase-integration.sql`

### 5. Get OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai)
2. Create an account and sign in
3. Go to **API Keys** section
4. Generate a new API key
5. Add it to your `.env` file as `OPENROUTER_API_KEY`

## Running the Application

### Development Mode

```bash
npm run start:dev
```

The server will start with hot-reload enabled at `http://localhost:5001`

### Production Mode

```bash
# Build the application
npm run build

# Start in production mode
npm run start:prod
```

### Debug Mode

```bash
npm run start:debug
```

## API Documentation

Once the server is running, you can access:

- **API Base URL**: `http://localhost:5001/api/v1`
- **Swagger Documentation**: `http://localhost:5001/api/docs`
- **Health Check**: `http://localhost:5001/api/v1/health`

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Start the application |
| `npm run start:dev` | Start in development mode with hot-reload |
| `npm run start:debug` | Start in debug mode |
| `npm run start:prod` | Start in production mode |
| `npm run build` | Build the application |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Lint and fix code |
| `npm run format` | Format code with Prettier |

## Project Structure

```
src/
├── app.module.ts              # Main application module
├── main.ts                    # Application entry point
├── answers/                   # Answer management
├── auth/                      # Authentication & authorization
├── config/                    # Configuration files
├── dashboard/                 # Analytics dashboard
├── database/                  # Database service & connection
├── exams/                     # Exam management
├── flashcards/               # Flashcard functionality
├── health/                    # Health check endpoints
├── questions/                # Question management
├── quiz/                     # Quiz functionality
├── topics/                   # Topic management
├── types/                    # TypeScript type definitions
└── users/                    # User management
```

## API Endpoints

The API provides the following main endpoints:

- `/api/v1/auth/*` - Authentication (login, register, refresh)
- `/api/v1/health` - Health check
- `/api/v1/users/*` - User management
- `/api/v1/quiz/*` - Quiz operations
- `/api/v1/flashcards/*` - Flashcard operations
- `/api/v1/dashboard/*` - Analytics and dashboard
- `/api/v1/topics/*` - Topic management
- `/api/v1/questions/*` - Question management

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Application environment |
| `PORT` | No | `5001` | Server port |
| `SUPABASE_URL` | **Yes** | - | Supabase project URL |
| `SUPABASE_ANON_KEY` | **Yes** | - | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | - | Supabase service role key |
| `OPENROUTER_API_KEY` | **Yes** | - | OpenRouter AI API key |
| `JWT_SECRET` | **Yes** | - | JWT signing secret |
| `JWT_EXPIRES_IN` | No | `24h` | JWT expiration time |
| `FRONTEND_URL` | No | `http://localhost:3000` | Frontend URL for CORS |
| `THROTTLE_TTL` | No | `60000` | Rate limit window (ms) |
| `THROTTLE_LIMIT` | No | `100` | Requests per window |

## Troubleshooting

### Common Issues

#### 1. "Cannot connect to Supabase"
- Verify your `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check if your Supabase project is active
- Ensure your IP is not blocked by Supabase

#### 2. "OpenRouter API Error"
- Verify your `OPENROUTER_API_KEY` is valid
- Check your OpenRouter account has sufficient credits
- Ensure the API key has the required permissions

#### 3. "Port already in use"
- Change the `PORT` in your `.env` file
- Or stop the process using the port: `npx kill-port 5001`

#### 4. Database connection errors
- Verify all Supabase environment variables
- Check if the database schema is properly set up
- Ensure your Supabase project is not paused

### Logs and Debugging

View application logs:
```bash
# Development logs
npm run start:dev

# Debug mode with detailed logs
npm run start:debug
```

### Getting Help

If you encounter issues:

1. Check the console output for error messages
2. Verify all environment variables are set correctly
3. Ensure external services (Supabase, OpenRouter) are accessible
4. Check the API documentation at `/api/docs`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the UNLICENSED License.

---

**Note**: Make sure to keep your `.env` file secure and never commit it to version control. Add `.env` to your `.gitignore` file if not already present.

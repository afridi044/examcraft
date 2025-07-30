# ExamCraft 🎓

An AI-powered exam preparation platform that helps students create, manage, and take interactive quizzes and flashcards with intelligent analytics.

## 🚀 Features

- **AI-Generated Quizzes** - Transform study materials into practice questions
- **Interactive Flashcards** - Spaced repetition learning system
- **Timed Mock Exams** - Real exam simulation with countdown
- **Performance Analytics** - Track progress with detailed insights
- **Smart Study Sessions** - Personalized learning recommendations
- **Modern UI/UX** - Beautiful, responsive interface

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Radix UI Components
- Framer Motion

**Backend:**
- NestJS
- TypeScript
- Supabase (PostgreSQL)
- OpenRouter AI
- JWT Authentication

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- OpenRouter API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd examcraft
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run start:dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env.local
# Configure your environment variables
npm run dev
```

4. **Database Setup**
- Create a Supabase project
- Run the SQL scripts from `frontend/info/`
- Configure environment variables

## 🔧 Environment Variables

**Backend (.env):**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENROUTER_API_KEY=your_openrouter_api_key
JWT_SECRET=your_jwt_secret
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎯 How to Use

1. **Sign Up/Login** - Create an account or sign in
2. **Create Content** - Upload study materials or create flashcards
3. **Generate Quizzes** - Use AI to create practice questions
4. **Take Exams** - Simulate real exam conditions
5. **Study Flashcards** - Use spaced repetition for retention
6. **Track Progress** - Monitor performance in analytics dashboard

## 📊 Available Scripts

**Backend:**
```bash
npm run start:dev    # Development server
npm run build        # Build for production
npm run test         # Run tests
```

**Frontend:**
```bash
npm run dev          # Development server
npm run build        # Build for production
npm run test         # Run tests
```

## 🚀 Deployment

### Docker Deployment
```bash
# Backend
cd backend
docker-compose up -d

# Frontend
cd frontend
docker-compose up -d
```

### Manual Deployment
```bash
# Build and start production servers
npm run build
npm run start:prod
```

## 📁 Project Structure

```
examcraft/
├── backend/          # NestJS API server
├── frontend/         # Next.js web application
├── deploy.sh         # Deployment scripts
└── README.md         # This file
```

## 🔗 API Documentation

- **Swagger UI**: `http://localhost:5001/api/docs`
- **Health Check**: `http://localhost:5001/api/v1/health`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED License.

---

**Last Updated**: July 30, 2024 
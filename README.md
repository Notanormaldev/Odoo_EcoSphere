# EcoSphere ESG Management Platform

EcoSphere is a full-stack ESG management platform for organizations that want to measure, monitor, and improve environmental, social, and governance performance from one place. The system combines operational data, employee engagement, compliance workflows, and AI-assisted guidance into a unified experience.

## What the platform provides

- Environmental tracking for carbon transactions, emission factors, sustainability goals, and department-level reporting.
- Social engagement features for CSR activities, employee participation, and community-focused initiatives.
- Governance workflows for ESG policies, acknowledgements, audits, and compliance issue management.
- Gamification features such as challenges, XP, badges, rewards, and leaderboards.
- An AI assistant, EcoBot, powered by Google Gemini for ESG-related questions and advisory support.

## Core modules

- Environmental
  - Scope 1, 2, and 3 emissions tracking
  - Carbon transaction management
  - Goal tracking and sustainability targets
  - Department and organizational reporting

- Social
  - CSR activity management
  - Employee participation workflows
  - Community-oriented engagement tracking

- Governance
  - Policy publishing and acknowledgement
  - Audit and compliance issue tracking
  - Governance oversight and reporting

- Gamification
  - Challenges and participation flows
  - XP, badges, and rewards
  - Leaderboards and engagement metrics

## Architecture overview

EcoSphere is built as a modern three-layer application:

- Frontend: React + Vite + React Router + TanStack Query + Zustand
- Backend: Node.js + Express + MongoDB + Mongoose + Redis
- Integrations: Google Gemini, Google OAuth, Brevo email, ImageKit file storage, and BullMQ-based background processing

## Project structure

- root: development runner and high-level project docs
- backend: Express API, database models, routes, services, seed scripts, and tests
- frontend: React application with pages, routing, and UI state management

## Tech stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Redis
- JWT authentication and Passport.js
- Google Gemini API
- Brevo SMTP
- ImageKit upload integration
- Jest for testing

### Frontend
- Vite
- React
- React Router
- TanStack Query
- Zustand
- Recharts
- Lucide icons
- React Hot Toast

## Prerequisites

Before running the project locally, make sure you have:

- Node.js 18+ and npm
- MongoDB running locally or a MongoDB Atlas connection string
- Redis running locally or a reachable Redis instance

## Environment configuration

Create a backend environment file by copying the example file:

```bash
cp backend/.env.example backend/.env
```

Then update the values in backend/.env with your own configuration, including:

- MONGO_URI
- JWT_SECRET and JWT_REFRESH_SECRET
- GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- BREVO_API_KEY
- GOOGLE_GEMINI_API
- REDIS_HOST, REDIS_PORT, and REDIS_PASSWORD
- IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT

## Installation

Install dependencies for both applications:

```bash
cd backend && npm install
cd ../frontend && npm install
```

## Seed demo data

The backend includes a seed script that populates departments, users, policies, challenges, rewards, carbon transactions, and sample ESG data.

```bash
cd backend
npm run seed
```

## Run locally

You can start both apps together from the root:

```bash
node dev.js
```

Or run them separately:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

The frontend will typically run on http://localhost:5173 and the backend API on http://localhost:5000.

## Default demo credentials

After running the seed script, you can use:

- Admin: admin@ecosphere.com / password123
- Employee sample accounts are also created during seeding

## API overview

The backend exposes REST endpoints under these modules:

- /api/auth for authentication and user access
- /api/users for profile management
- /api/environmental for emissions and environmental data
- /api/social for CSR and participation workflows
- /api/governance for policies, audits, and compliance issues
- /api/gamification for challenges, badges, rewards, and points
- /api/reports for reporting and analytics
- /api/chatbot for EcoBot AI interactions
- /health for server health checks

## Testing

Run backend tests:

```bash
cd backend
npm test
```

Build the frontend for production:

```bash
cd frontend
npm run build
```
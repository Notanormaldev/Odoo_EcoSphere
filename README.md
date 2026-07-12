# EcoSphere: ESG Management Platform

EcoSphere is a modern, professional, enterprise-grade ESG (Environmental, Social, and Governance) Management Platform that integrates directly into day-to-day corporate operations.

## Features

- **Environmental (E)**: Scope 1, 2, 3 carbon emissions tracking, goals, and factors.
- **Social (S)**: CSR activity registration, volunteer participation, and gender/departmental diversity.
- **Governance (G)**: Policies publishing, acknowledgement, and compliance audit trail management.
- **Gamification**: XP points, badges, rewards, and leaderboards to drive engagement.
- **AI Chatbot (EcoBot)**: Integrated LangChain & Google Gemini 2.0 assistant for ESG compliance advice.

## Tech Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), Redis (token blacklisting & caching), LangChain, Google Gemini API, Brevo (SMTP mailing).
- **Frontend**: Vite, React, TanStack Query (React Query), Zustand, Recharts, Vanilla CSS.

## Getting Started

1. Set up the environment variables:
   - Copy `backend/.env.example` to `backend/.env` and fill in the values.
2. Install dependencies:
   - Backend: `cd backend && npm install`
   - Frontend: `cd frontend && npm install`
3. Seed the database with mock data:
   - `cd backend && npm run seed`
4. Run development environment concurrently:
   - `node dev.js`

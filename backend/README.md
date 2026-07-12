# EcoSphere Backend

This backend powers the EcoSphere ESG platform through a REST API built with Node.js, Express, MongoDB, and Redis. It handles authentication, ESG data management, reporting, gamification logic, notifications, and AI-assisted chatbot interactions.

## What the backend includes

- Authentication and authorization with JWT and Passport.js
- MongoDB models for departments, users, ESG policies, challenges, rewards, carbon transactions, audits, and compliance issues
- Redis-backed rate limiting and caching support
- Email and notification services
- Gemini-powered chatbot integration
- Seed scripts for demo and test data

## Main folders

- server.js: Express application entry point
- src/config/: environment, database, Redis, Passport, and service configuration
- src/controllers/: request handlers for each domain module
- src/middleware/: auth, validation, error handling, rate limiting, and logging
- src/models/: Mongoose schemas for all major business entities
- src/routes/: API routes grouped by functional module
- src/services/: notification, email, and AI integration logic
- src/scripts/: database seeding and utility scripts
- src/tests/: automated tests for API behavior and utilities

## Main API modules

- /api/auth: login, registration, token refresh, and Google OAuth
- /api/users: user and profile management
- /api/departments: department management
- /api/environmental: emissions, environmental goals, and carbon data
- /api/social: CSR activities and participation workflows
- /api/governance: policies, acknowledgements, audits, and compliance issues
- /api/gamification: challenges, badges, rewards, and points
- /api/reports: reporting endpoints and ESG summaries
- /api/chatbot: EcoBot AI query routes
- /health: health check endpoint

## Environment setup

Copy the example environment file and fill in the required values:

```bash
cp .env.example .env
```

Required settings include MongoDB, JWT secrets, Redis, Google OAuth, Gemini, Brevo SMTP, and ImageKit credentials.

## Install and run

```bash
npm install
npm run seed
npm run dev
```

## Testing

```bash
npm test
```

## Notes

The backend is designed to work with seeded demo content for local development. For full feature availability, configure the external integrations in the environment file.

# EcoSphere Backend

The backend server is powered by Express and Node.js with ES modules.

## Project Structure

- `server.js`: Express entry point.
- `src/config/`: Configuration for DB, Redis, Env vars and Passport Google OAuth.
- `src/controllers/`: Route handlers and controllers.
- `src/middleware/`: Auth verification, error handling, validation.
- `src/models/`: MongoDB Mongoose schemas.
- `src/routes/`: API endpoint definitions.
- `src/services/`: Integration logic for Gemini, Brevo email sending, and notifications.
- `src/scripts/`: Seeding and runner utility scripts.

## API Endpoints

- `/api/auth`: Login, Registration, Google OAuth, Refresh tokens.
- `/api/users`: Profile updates, details.
- `/api/environmental`: Log emissions, goals, carbon transactions.
- `/api/social`: CSR activities, approvals, diversity metrics.
- `/api/governance`: ESG Policies, acknowledgements, audits, compliance issues.
- `/api/gamification`: Challenges, badges, rewards, leaderboards.
- `/api/reports`: Statistics, calculations.
- `/api/chatbot`: EcoBot AI query.

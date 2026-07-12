# EcoSphere Frontend

The frontend is a React-based web application for interacting with the EcoSphere ESG platform. It provides a dashboard-driven experience for environmental, social, governance, gamification, and AI chatbot workflows.

## Main user experience

- Authentication screens for login, registration, and email verification
- Protected dashboard and navigation shell
- Module pages for environmental, social, governance, gamification, reports, profile, and settings
- AI chatbot experience for ESG-related questions
- Responsive layout designed around sustainability-focused visual language

## Main folders

- src/app/: app providers, routing, and state setup
- src/pages/: route-level pages such as Dashboard, Environmental, Social, Governance, Gamification, Reports, Chatbot, Profile, and Settings
- src/shared/: shared UI pieces, layout components, and utilities
- src/assets/: static assets and images

## Key technologies

- Vite for fast development and build tooling
- React Router for navigation
- TanStack Query for API state management
- Zustand for lightweight client state
- Recharts for charts and metrics
- Lucide icons and custom styling for the sustainability theme

## Install and run

```bash
npm install
npm run dev
```

The app will be available at http://localhost:5173 by default.

## Build for production

```bash
npm run build
```

## Project notes

The frontend is designed to work with the backend API running on the configured local server. Most pages rely on the API and seeded demo data to display realistic dashboards and workflows.

# <img src="screenshots/logo.png" alt="EcoSphere Logo" width="36" align="center" style="margin-right: 8px;" /> EcoSphere ESG Management Platform

EcoSphere is a full-stack **ESG (Environmental, Social, and Governance) Management Platform** designed for organizations to measure, monitor, and improve their sustainability performance. The system integrates operational carbon accounting, social engagement workflows, compliance audits, policy acknowledgements, gamified engagement, and AI-assisted ESG advisory into a unified dashboard.

---

## 📸 Platform Interface Showcase

### 🖥️ Desktop Interface
| Dashboard | Environmental Module |
|---|---|
| <img src="screenshots/dashboard_desktop.png" alt="EcoSphere Desktop Dashboard" width="400" /> | <img src="screenshots/environmental_desktop.png" alt="Environmental Carbon Tracking" width="400" /> |

| Reports & Analytics |
|---|
| <img src="screenshots/reports_desktop.png" alt="Reports & Analytics Dashboard" width="820" /> |

### 📱 Mobile Responsiveness
| Mobile Dashboard | Mobile Governance | Mobile Social |
|---|---|---|
| <img src="screenshots/dashboard_mobile.png" alt="Mobile Dashboard View" width="260" /> | <img src="screenshots/governance_mobile.png" alt="Mobile Governance Policies" width="260" /> | <img src="screenshots/social_mobile.png" alt="Mobile Social View" width="260" /> |

---

## ✨ Features & Capabilities

### 🌿 1. Environmental Module
- **Carbon Transactions**: Log emissions under Scope 1 (Direct), Scope 2 (Indirect), and Scope 3 (Value Chain).
- **Goal Management**: Set targets (e.g., target carbon reduction), monitor progress, and classify status (On Track, At Risk).
- **Emissions Factor Engine**: Automatic calculation of CO₂e metrics depending on source type (Electricity, Fuel, Travel, Waste).

### 🤝 2. Social Module
- **CSR Activities**: Design volunteer events (e.g. Beach Cleanups, Blood Donation Drives) where employees can join.
- **Participation Workflows**: Verification queue for managers to approve activity completion.
- **Diversity Analytics**: Monitor gender and department employee distribution.

### 🏛️ 3. Governance Module
- **ESG Policies**: Create, publish, and track employee policy acknowledgements.
- **Audits & Issues**: Create internal compliance reviews and log open issues with severity and remediation status.
- **Audit Trails**: Non-repudiation logging for all compliance actions.

### 🏆 4. Gamification Engine
- **Challenges**: Time-bound challenges with XP and Points rewards.
- **Badges**: Milestones badges (e.g., Carbon Champion, CSR Hero) unlocked automatically.
- **Leaderboards**: Department-wise and individual leaderboards to motivate active participation.

### 💬 5. EcoBot AI Assistant
- Embedded **Gemini AI chatbot** using LangChain.
- Answers questions about ESG frameworks (GRI, SASB, TCFD, UN SDGs).
- **Instant Fallback Engine**: If Gemini is offline or rate-limited, the system falls back to a local ESG database in under 200ms without throwing errors.

---

## 🛠️ Architecture & Tech Stack

### Backend
- **Node.js & Express.js**: REST API server.
- **MongoDB & Mongoose**: Object Data Modeling.
- **Redis Cache**: Session blacklist validation and caching.
- **Passport.js**: Authentication handling.
- **LangChain / Google GenAI**: Powered by `gemini-2.0-flash`.
- **Nodemailer**: SMTP transaction emails.
- **Jest**: Backend test suite.

### Frontend
- **Vite & React**: Single Page Application.
- **React Router**: Client-side SPA routing.
- **Zustand**: Clean state management.
- **TanStack Query (React Query)**: Fetching, caching, and state synchronization.
- **Recharts**: Responsive SVG graphs and pie charts.
- **Lucide Icons**: Crisp vector icons.

---

## 🚀 Quick Start (Local Run)

### 1. Prerequisites
Ensure you have installed:
- Node.js 18+
- MongoDB (local or Atlas)
- Redis Server

### 2. Setup Environment Configuration
Copy the `.env.example` in backend and configure your credentials:
```bash
cp backend/.env.example backend/.env
```
Key configurations include:
- `MONGO_URI`, `JWT_SECRET`, `GOOGLE_GEMINI_API`, `REDIS_HOST`, `REDIS_PORT`

### 3. Installation & Database Seeding
You can install dependencies for both frontend and backend using the root scripts:
```bash
# Install all dependencies
npm run install-all

# Seed initial ESG demo data
cd backend
npm run seed
```

### 4. Running the App
Start both frontend and backend development servers concurrently:
```bash
# In repository root
node dev.js
```
The client runs on [http://localhost:5173](http://localhost:5173) and the backend API on [http://localhost:3000](http://localhost:3000).

---

## 🔐 Demo Credentials
- **Admin**: `admin@ecosphere.com` / `password123`
- **Employee**: `dhruvpanchal0312@gmail.com` / `password123`
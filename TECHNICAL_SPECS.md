# EcoSphere ESG Platform – Technical Specifications & Implementation Guide

Welcome to the comprehensive technical and architectural specification document for the **EcoSphere ESG Management Platform**. This guide details the technologies, architecture, security implementations, database seed states, Redis configurations, and API structures powering the platform.

---

## 📋 Table of Contents
1. [🛠️ Tech Stack & Dependencies](#-tech-stack--dependencies)
2. [🏗️ System Architecture & Data Flow](#-system-architecture--data-flow)
3. [🔒 Security Architecture & API Design](#-security-architecture--api-design)
4. [⚡ Redis Caching, Rate Limiting & Blacklists](#-redis-caching-rate-limiting--blacklists)
5. [🌿 Core ESG Functional Modules](#-core-esg-functional-modules)
6. [🗄️ Database Seeding & Startup Verification](#-database-seeding--startup-verification)
7. [🔑 Demo Credentials & Schema Structures](#-demo-credentials--schema-structures)

---

## 🛠️ Tech Stack & Dependencies

EcoSphere uses a decoupled Client-Server architecture optimized for responsive analytics rendering, high security, and offline fallback capability.

### 💻 Frontend (Vite + React SPA)
* **Vite**: Modern builder providing near-instantaneous Hot Module Replacement (HMR).
* **React 18**: Component-based UI rendering.
* **Zustand**: Lightweight, high-performance state manager used for UI theme switches and session state.
* **TanStack Query (React Query)**: Orchestrates server state synchronization, query caching, and automated refetching.
* **Recharts**: Responsive SVG-based charting library for visualizing Scope 1/2/3 carbon emission trends and diversity ratios.
* **Vanilla CSS + Custom Properties**: CSS-variable-based design system containing custom utility classes and mobile responsive media queries (no Tailwind dependencies to ensure maximum loading performance).

### ⚙️ Backend (Node.js + Express.js API)
* **Express.js**: Lightweight framework managing middleware pipelines and routing.
* **Mongoose & MongoDB Atlas**: Object Data Modeling (ODM) layer for database interactions.
* **Redis**: In-memory data store for caching, session blacklists, and API rate limiting.
* **Passport.js**: Authentication wrapper supporting both standard email/password logins and Google OAuth 2.0.
* **LangChain JS & Google Generative AI**: Drives the intelligent EcoBot advisory chatbot powered by `gemini-2.0-flash`.
* **Nodemailer + SMTP**: Sends verified signup and password-reset transactional emails.

---

## 🏗️ System Architecture & Data Flow

```
+---------------------------------------+
|          Vite/React Client            |
|  (Charts, Zustand state, Forms, Bot)  |
+-------------------+-------+-----------+
                    |       ^
           HTTP API |       | HTTP JSON Responses
                    v       |
+-------------------+-------+-----------+
|          Express API Server           |
| (Rate Limiter, Helmet, Passport, Auth)|
+-----+-----------+-----------+---------+
      |           |           |
      v           v           v
  [MongoDB]    [Redis]    [Gemini API]
 (Users, ESG  (Blacklist, (EcoBot AI
  Records)   Rate Limits) Fallback Database)
```

### Why this architecture is helpful:
1. **Decoupled Performance**: Client-side rendering removes page-load overhead from the Express server.
2. **High Security**: JSON Web Tokens (JWT) are stored and verified with cryptographic signatures, preventing token tampering.
3. **Caching Speed**: Redis reduces queries to MongoDB for blacklisted tokens.
4. **Smart Fallback**: The chatbot fallback intercepts API failures within milliseconds, ensuring zero UI breakage if the Google Gemini API limits are hit.

---

## 🔒 Security Architecture & API Design

### 🔑 Authentication Protocols
* **Password Hashing**: Passwords are encrypted before storing in the database using **bcrypt** with a work factor of **12 rounds**. Raw text passwords are never stored.
* **Dual-Token System**:
  - **Access Tokens**: Short-lived (15 minutes) JWTs used to authenticate API requests.
  - **Refresh Tokens**: Long-lived (7 days) JWTs stored in secure, HttpOnly cookies to request new access tokens.
* **OAuth Integration**: Google OAuth 2.0 allows users to sign in using their Google corporate accounts.

### 🛡️ Core Security Middlewares
1. **Helmet**: Sets various HTTP headers (such as `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`) to mitigate common web vulnerabilities.
2. **CORS (Cross-Origin Resource Sharing)**: Restricts API calls to approved origins (`CLIENT_URL`).
3. **Express Rate Limiters**: Prevents brute-force logins and Denial-of-Service (DoS) attacks.

---

## ⚡ Redis Caching, Rate Limiting & Blacklists

The platform uses a local or cloud Redis instance to manage critical performance and security components:

### 🚫 Token Blacklisting (Logout Flow)
* When a user logs out, their current Access Token and Refresh Token are stored in Redis with a Time-To-Live (TTL) matching the token's remaining expiration time.
* Every authenticated API request passes through a blacklist middleware that queries Redis. If the token is found, access is immediately denied (`401 Unauthorized`), preventing reuse of intercepted tokens.

### ⏱️ API Rate Limiting
* **General Rate Limiter**: Limits general API calls to 100 requests per 15 minutes per IP address.
* **Auth Rate Limiter**: Limits login, registration, and email verification endpoints to 5 requests per 15 minutes per IP address to block credential-stuffing attacks.

---

## 🌿 Core ESG Functional Modules

### 1. Environmental (Carbon Accounting)
* Logs monthly greenhouse gas emissions across Scope 1 (Direct), Scope 2 (Electricity/Indirect), and Scope 3 (Value Chain/Travel).
* Uses an integrated **Emissions Factor Engine** to compute metric tons of carbon dioxide equivalent ($t\text{CO}_2e$).

### 2. Social (CSR & Diversity)
* Tracks CSR volunteering events, employee sign-ups, and hours completed.
* Generates gender and department distribution metrics for ESG reporting.

### 3. Governance (Policies & Audits)
* Tracks corporate ESG policy publications and logs signed employee acknowledgments.
* Coordinates internal compliance audits, logging open issues by severity (Low, Medium, High).

### 4. Gamification (XP & Rewards Leaderboards)
* Computes employee sustainability participation points and XP.
* Unlocks badges (e.g. *Carbon Champion*, *Social Ambassador*) and updates the leaderboard in real time.

---

## 🗄️ Database Seeding & Startup Verification

To ensure zero-config deployments on cloud servers like Render, the startup routine in `server.js` executes an intelligent startup check:

1. **Existence Verification**: Queries Mongoose for the primary accounts `admin@ecosphere.com` and `harsh@ecosphere.com`.
2. **Dynamic Importing**: If either is missing, it dynamically loads `seed.js` and seeds the database collections with fully hydrated metrics, challenges, and user accounts.
3. **Data Integrity**: Clears out stale tokens and rebuilds clean compliance records, ensuring the application is immediately ready for demonstrations.

---

## 🔑 Demo Credentials & Schema Structures

Below are the default credentials configured in the database, including the newly seeded Harsh Patel profile:

### 👑 1. System Administrator
* **Email**: `admin@ecosphere.com`
* **Password**: `password123`
* **Role**: `admin`
* **Permissions**: Access to ESG configurations, compliance issue logging, policy generation, and carbon transaction overrides.

### 👨‍💻 2. Employee Profile (Harsh Patel)
* **Email**: `harsh@ecosphere.com`
* **Password**: `password123`
* **Role**: `employee`
* **Department**: Research & Development
* **Designation**: Chief ESG Strategist
* **Bio**: Chief ESG strategist at EcoSphere, managing corporate sustainability roadmaps and carbon reduction initiatives.
* **Gamification Stats**:
  - **XP**: `2850`
  - **Points**: `1900`
  - **Unlocked Badges**: 4 (Carbon Champion, CSR Hero, Policy Advocate, Eco Specialist)
  - **Verified Email**: `true`

---

*This document is maintained as a technical blueprint. Please do not commit raw security secrets to this file; keep them stored securely in your `.env` configuration.*

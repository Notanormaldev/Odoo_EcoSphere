# EcoSphere ESG Platform – System Documentation & Architecture

Welcome to the comprehensive technical documentation for the **EcoSphere ESG (Environmental, Social, and Governance) Management Platform**. This document covers all the features, structural changes, fixes, and system designs implemented in the codebase.

---

## 📂 System Architecture Overview

EcoSphere is built on a modern full-stack JavaScript environment optimized for fast analytics rendering and AI-assisted insights:

```
  React/Vite Frontend  <───(API HTTP)───>  Node.js/Express Backend  <───>  MongoDB (Atlas)
                                                      │
                                                      ├───>  Redis (Session / Blacklists)
                                                      ├───>  Gemini API (LangChain)
                                                      └───>  Brevo SMTP Service
```

### 🛠️ Technology Stack
- **Frontend**: React 18, Vite (Fast HMR compilation), Recharts (SVG data visualizations), React Query / TanStack (State caching).
- **Backend**: Express.js, Mongoose (MongoDB ODM), Redis (JWT blacklisting and cache management), Passport.js (Google OAuth 2.0).
- **AI Integrations**: LangChain JS, Google Generative AI (`gemini-2.0-flash`).
- **Styling**: Vanilla CSS custom properties (Centralized Design Token System).

---

## 🎨 1. Brand Identity & Logo Integration

To replace emoji-based placeholders, a custom SVG-based corporate identity was designed and integrated across the entire platform.

```
          .-------.
        /   _   _   \      EcoSphere Iconography:
       |   ( ) ( )   |     - Circular Globe Silhouette (Global Impact)
       |   \ \_/ /   |     - 3 Interconnected Leaves (E, S, G Pillars)
        \   \___/   /      - Forest Green to Sage Gradient
          '-------'
```

### ⚙️ Implementation
- **Vector Logo Lockup (`Logo.jsx`)**: Rendered directly using lightweight, high-performance inline SVG paths. Scales crisply at any dimension without introducing image asset HTTP requests.
- **Support for Themes**: Support for `variant="light"` (white text for dark sidebars/branding) and `variant="dark"` (forest green text for light workspaces).
- **Project-wide Placement**:
  - **Main Sidebar**: Full-text lockup on wide screens, collapses automatically to a standalone icon on narrow viewports.
  - **Login Panel**: Highlighted at size 36px in white on the forest green panel.
  - **Registration Page**: Dark-accent logo at size 32px to match the cream card container.
  - **Loading & 404 screens**: Enhanced with custom animations (e.g., spinning globe).
  - **Meta Assets**: Configured `favicon.svg` with the vector mark, and referenced `logo.png` for Apple touch icons.

---

## 💬 2. Chatbot Engine & Quota Fallback Design

### ⚠️ The Core Problem
When the Gemini API free-tier hit a `429 Quota Exceeded` rate limit, the LangChain model wrapper automatically retried requests using exponential backoff. This caused the backend process to freeze for over 30 seconds per request, causing Vite's development proxy to terminate the connection and display a generic **"Connection error"** in the UI.

### 🛡️ The Solution (Instant Fallback Architecture)
1. **Immediate Failure (`maxRetries: 0`)**: Configured the model constructor to fail instantly on auth or quota errors instead of retrying:
   ```javascript
   chatModel = new ChatGoogleGenerativeAI({
     model: 'gemini-2.0-flash',
     apiKey: config.geminiApiKey,
     maxRetries: 0, // Instant response on API failures
   });
   ```
2. **Local ESG Knowledge Base Mapping**: Added a keyword matching dictionary inside `chatbotRoutes.js` mapped to typical user queries (e.g. *Scope 1/2/3, Carbon Footprint, GRI, TCFD, CSR, Gamification, SDGs*).
3. **Seamless UX Execution**: If the AI model fails, the request immediately falls back to the local database, returning a structured guide in less than **200ms**. The frontend hides any "offline warnings," keeping the user experience completely seamless.

---

## 📱 3. Responsive Layout Engine

To support mobile devices and tablet viewports, the entire CSS system was overhauled to support responsive breakpoints:

```
  ┌─────────────────────────────────────────────────────────────┐
  │ Viewports:                                                  │
  │  │ Desktop (>1024px)   : Fixed Sidebar (240px) + Main Grid  │
  │  │ Tablet (768px-1024px): Collapsed Sidebar (210px)         │
  │  │ Mobile (<768px)    : Slide-in Drawer + 16px Padding      │
  └─────────────────────────────────────────────────────────────┘
```

### 🔧 Key Responsive CSS Additions
- **Flexbox min-width Fix**: Fixed a classic flexbox bug where non-wrapping child elements (like tab rows) stretched their parent containers. Added `min-width: 0;` to `.app-main` and `.app-content` to force components to stay inside screen boundaries.
- **No-Shrink Tab Scrolling**: Added `flex-shrink: 0;` to `.tab` elements. On small viewports, the text (e.g. *Diversity*) no longer truncates; instead, the entire tab bar scrolls horizontally.
- **KPI Card Grid**: Optimized the `.kpi-grid` to display in **2 columns (`1fr 1fr`)** instead of stacking vertically, reducing vertical scrolling on small screens.
- **Layout Helpers**:
  - `.grid-chart-pie`: Stacks a 2fr/1fr chart layout into a single column on tablets.
  - `.grid-2col` and `.grid-3col`: Stack grid containers on mobile (≤768px).
  - `.grid-auto`: Arranges content using `repeat(auto-fill, minmax(280px, 1fr))`.

---

## 👤 4. Profile & Settings Expansion

```
   ┌─────────────────────────────────────────────────────┐
   │                  SETTINGS PAGE                      │
   │  [My Profile]   [Notifications]   [Security & Pw]   │
   │  ┌────────────────────────────────────────────────┐ │
   │  │ Name: EcoSphere Admin                          │ │
   │  │ Bio : Sustainability officer focused on carbon │ │
   │  │       offsets and GRI disclosures...           │ │
   │  └────────────────────────────────────────────────┘ │
   └─────────────────────────────────────────────────────┘
```

### ⚙️ Feature Specifications
1. **User Description Bio**:
   - Added a `bio` string property (max length 250 characters) to the MongoDB User Schema.
   - Built a real-time character remaining counter on form fields.
2. **Profile Page Statistics Card**:
   - Displays organization details (Employee ID, Work Email, Assigned Department) in a read-only layout.
   - Displays real-time gamification parameters (Accumulated XP, Score Points, unlocked Badges).
3. **Change Password Tab**:
   - Configured secure validation calling `/users/me/password` to verify the current password before writing a new one.
4. **Log Out Popup Modal**:
   - Replaced immediate redirects with a confirmation popup modal. When clicked, it dims the screen with a backdrop and requests confirmation before clearing JWT tokens.

---

## 🔒 5. Verification System & Dev Tools

### ⚙️ Controller Security Upgrades
- **State Check**: The backend route `/verify-email/:token` now checks if the user is already verified. If they click the verification link a second time, it generates fresh session tokens and logs them in instead of throwing a `400 Bad Request` error.
- **Resend Request Interface**: In case of token expiration (24 hours), the `VerifyEmail` component renders a **"Resend Verification Link"** form directly in the error view.
- **Local Dev Utility Script (`verifyUser.js`)**:
  Allows manual verification of users during local testing:
  ```bash
  node src/scripts/verifyUser.js user@company.com
  ```

---

## 🚀 6. Configuration & Local Execution

To start the development servers:

### Backend Setup
1. Configure env parameters in `backend/.env`:
   ```ini
   PORT=3000
   MONGO_URI=your_mongodb_connection_uri
   JWT_SECRET=your_auth_jwt_secret
   CLIENT_URL=http://localhost:5173
   ```
2. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

### Frontend Setup
1. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```
2. Open [http://localhost:5173](http://localhost:5173) in your browser.

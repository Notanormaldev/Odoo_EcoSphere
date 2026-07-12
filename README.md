<div align="center">

```
███████╗ ██████╗ ██████╗ ███████╗██████╗ ██╗  ██╗███████╗██████╗ ███████╗
██╔════╝██╔════╝██╔═══██╗██╔════╝██╔══██╗██║  ██║██╔════╝██╔══██╗██╔════╝
█████╗  ██║     ██║   ██║███████╗██████╔╝███████║█████╗  ██████╔╝█████╗  
██╔══╝  ██║     ██║   ██║╚════██║██╔═══╝ ██╔══██║██╔══╝  ██╔══██╗██╔══╝  
███████╗╚██████╗╚██████╔╝███████║██║     ██║  ██║███████╗██║  ██║███████╗
╚══════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝
```

### 🌍 the planet filed a support ticket. we shipped the fix.

**an ESG platform that turns "we care about sustainability" from a LinkedIn caption into an actual audit trail**

[![Live Demo](https://img.shields.io/badge/🚀_LIVE-odoo--ecosphere.onrender.com-1a7f37?style=for-the-badge)](https://odoo-ecosphere.onrender.com/)
[![Repo](https://img.shields.io/badge/📦_SOURCE-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/Notanormaldev/Odoo_EcoSphere)
[![Made By](https://img.shields.io/badge/made%20by-Team%20Clickjack-critical?style=for-the-badge)](#-team-clickjack)

</div>

<br>

> ### *"Built by Team Clickjack — for the ones who ship, not just talk."*

<br>

---

## 🫡 what even is this

Most companies have an ESG policy. It lives in a PDF. In some forgotten Google Drive folder. Nobody reads it.

**EcoSphere** turns that PDF into a living, breathing dashboard — where carbon emissions get logged, CSR activities get tracked, audits sit in a queue waiting to be closed, and employees get genuinely competitive over badges (yes, sustainability runs on gamification now, fight us).

Environmental + Social + Governance — all three pillars, one login.

<br>

## ⚡ live in 10 seconds

| | |
|---|---|
| 🔗 **Live App** | [odoo-ecosphere.onrender.com](https://odoo-ecosphere.onrender.com/) |
| 📂 **Repo** | [github.com/Notanormaldev/Odoo_EcoSphere](https://github.com/Notanormaldev/Odoo_EcoSphere) |
| 👑 **Admin login** | `admin@ecosphere.com` / `password123` |
| 👨‍💻 **Employee login** | `harsh@ecosphere.com` / `password123` |

*(hosted on a spin-down server, so the first request might wake up a little groggy — patience, it's warming up like a Monday morning ☕)*

<br>

---

## 🧩 what's actually inside

```
┌──────────────────────────────────────────────────────────────────┐
│                        E C O S P H E R E                         │
│                                                                    │
│   🌿 ENVIRONMENTAL          🤝 SOCIAL             🏛️ GOVERNANCE   │
│   ─────────────────         ──────────────         ───────────── │
│   Scope 1/2/3 logging       CSR event workflows     Policy pub +  │
│   Emission factor engine    Volunteer verification  acknowledge   │
│   Goal tracking             Diversity analytics     Audit trails │
│   On-Track / At-Risk tags   Manager approvals       Issue severity│
│                                                                    │
│              🏆 GAMIFICATION        💬 ECOBOT AI                  │
│              ─────────────         ──────────────                 │
│              XP + Points           Gemini 2.0 Flash               │
│              Auto-unlock badges    LangChain powered               │
│              Live leaderboards     <200ms local fallback          │
└──────────────────────────────────────────────────────────────────┘
```

- **Carbon accounting that doesn't require a spreadsheet PhD** — log Scope 1 (direct), Scope 2 (electricity), Scope 3 (value chain), auto-computed into CO₂e.
- **CSR that isn't just a poster in the break room** — beach cleanups, blood drives, real sign-ups, real manager verification.
- **Governance that has receipts** — every policy acknowledgement and audit action is logged in a non-repudiation trail. No "I never saw that email" excuses.
- **Gamification because humans respond to dopamine, not spreadsheets** — badges like *Carbon Champion* and *CSR Hero* unlock automatically.
- **EcoBot, the assistant that refuses to go down** — ask it about GRI, SASB, TCFD, or UN SDGs. Gemini answers live; if Gemini gets rate-limited (free-tier problems, we've all been there), a local knowledge base catches the fall in under 200ms. Zero "connection error" screens, zero drama.

<br>

## 🛠️ the stack (no glassmorphism, no gradient soup, just engineering)

<div align="center">

| Layer | Tech |
|---|---|
| **Frontend** | React 18 · Vite · Zustand · TanStack Query · Recharts · Vanilla CSS design tokens |
| **Backend** | Node.js · Express.js · Mongoose (MongoDB Atlas) · Redis · Passport.js |
| **AI Layer** | LangChain JS + Google Generative AI (`gemini-2.0-flash`) |
| **Mail** | Nodemailer / Brevo SMTP |
| **Auth** | JWT (15-min access / 7-day refresh) · bcrypt (12 rounds) · Redis blacklist on logout |
| **Testing** | Jest |

</div>

### 🔐 security, taken seriously (not just a Helmet import for show)

- Dual-token JWT system — short-lived access tokens, HttpOnly refresh cookies
- Redis-backed token blacklist — logout actually logs you out, everywhere, instantly
- Helmet + CORS + rate limiting — 100 req/15min general, 5 req/15min on auth routes (credential-stuffing can go cry somewhere else)
- bcrypt @ 12 rounds — no plaintext passwords, ever

<br>

## 🏗️ how the pieces talk

```
      React / Vite Client
   (Charts · Zustand · Forms · EcoBot UI)
                 │  HTTP JSON
                 ▼
      Express API Gateway
   (Helmet · Rate Limiter · Passport Auth)
        │         │           │
        ▼         ▼           ▼
    MongoDB     Redis      Gemini API
   (ESG data)  (Blacklist   (LangChain
              + Rate Caps)   + Fallback DB)
```

Client-side rendering keeps the server lean. Redis keeps auth fast. The AI layer never leaves the user hanging — even when Google's servers are having a bad day.

<br>

## 🚀 run it yourself

```bash
# clone the crime scene
git clone https://github.com/Notanormaldev/Odoo_EcoSphere.git
cd Odoo_EcoSphere

# environment setup
cp backend/.env.example backend/.env
# fill in: MONGO_URI, JWT_SECRET, GOOGLE_GEMINI_API, REDIS_HOST, REDIS_PORT

# install everything, both sides
npm run install-all

# seed some demo ESG chaos
cd backend && npm run seed

# fire it up (frontend + backend together)
cd ..
node dev.js
```

Open `http://localhost:5173` and pretend you're the Chief ESG Strategist. (Spoiler: the seeded employee literally has that title.)

<br>

## 📱 it doesn't break on your phone either

Desktop gets the full sidebar + grid experience. Tablet collapses gracefully. Mobile gets a slide-in drawer, horizontally-scrolling tabs, and a 2-column KPI grid — because nobody should have to pinch-zoom to check their carbon footprint.

<br>

---

## 👾 Team Clickjack

We don't do vaporware. We don't do "coming soon." We ship, we seed the database, we deploy to Render, and we write READMEs with ASCII banners at 2 AM.

<div align="center">

### *Built by Team Clickjack — for the ones who ship, not just talk.*

**[🌐 Live Demo](https://odoo-ecosphere.onrender.com/) · [💻 Source Code](https://github.com/Notanormaldev/Odoo_EcoSphere)**

</div>

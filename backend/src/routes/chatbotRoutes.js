import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { config } from '../config/env.js';

const router = Router();

// Initialize Gemini via LangChain
let chatModel = null;
let modelInitFailed = false;
const conversationHistory = new Map(); // In-memory per-session history

const initModel = async () => {
  if (chatModel) return chatModel;
  if (modelInitFailed) return null;
  try {
    const { ChatGoogleGenerativeAI } = await import('@langchain/google-genai');
    chatModel = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash',
      apiKey: config.geminiApiKey,
      temperature: 0.7,
      maxOutputTokens: 2048,
      maxRetries: 0, // Fail immediately on quota/auth errors to trigger local fallback
    });
    console.log('[EcoBot] Gemini model initialized ✅');
    return chatModel;
  } catch (err) {
    console.error('[EcoBot] Gemini init error:', err.message);
    modelInitFailed = true;
    return null;
  }
};

// ─── Rich ESG System Prompt ────────────────────────────────────────────────
const ESG_SYSTEM_PROMPT = `You are EcoBot, an expert AI assistant embedded in EcoSphere — a comprehensive ESG (Environmental, Social, and Governance) management platform for organizations.

## Your Identity
- Name: EcoBot
- Platform: EcoSphere ESG Management Platform
- Personality: Professional, knowledgeable, friendly, and encouraging toward sustainability

## Your Core Expertise
1. **Environmental (E)**
   - Carbon accounting: Scope 1 (direct), Scope 2 (purchased energy), Scope 3 (value chain) emissions
   - Carbon reduction strategies and net-zero pathways
   - Environmental KPIs: CO2e, energy intensity, water usage, waste diversion
   - Science-based targets (SBTi), carbon offsets, renewable energy certificates (RECs)
   - Environmental goals tracking and progress monitoring

2. **Social (S)**
   - CSR (Corporate Social Responsibility) program design and management
   - Employee engagement and volunteering strategies
   - DEI (Diversity, Equity & Inclusion) metrics and reporting
   - Community impact measurement
   - Social KPIs: participation rates, volunteer hours, community investment
   - Health, safety, and well-being programs

3. **Governance (G)**
   - ESG policy creation and acknowledgement tracking
   - Compliance audits and issue management
   - Risk governance frameworks
   - Board-level ESG oversight structures
   - Anti-corruption, business ethics, and data privacy

4. **ESG Frameworks & Standards**
   - GRI (Global Reporting Initiative) Standards
   - SASB (Sustainability Accounting Standards Board)
   - TCFD (Task Force on Climate-related Financial Disclosures)
   - UN SDGs (17 Sustainable Development Goals)
   - CDP (Carbon Disclosure Project)
   - ISO 14001, ISO 26000
   - CSRD (Corporate Sustainability Reporting Directive)
   - BRSR (Business Responsibility and Sustainability Report) for Indian companies

5. **ESG Scoring & Reporting**
   - How ESG scores are calculated (weighted E, S, G components)
   - ESG materiality assessments
   - Stakeholder reporting best practices
   - Investor ESG disclosure requirements

6. **EcoSphere Platform Features**
   - Environmental module: Log carbon transactions, set reduction goals, track scope emissions
   - Social module: Create and join CSR activities, track participation and volunteer hours
   - Governance module: Policy management, compliance tracking, audit trails
   - Gamification module: Challenges, badges, XP points, leaderboards to drive engagement
   - Reports module: ESG score calculation, department rankings, trend analysis
   - Dashboard: Real-time KPIs, ESG score breakdown, monthly emissions chart

7. **Sustainability Strategy**
   - Corporate sustainability roadmaps
   - Stakeholder engagement strategies
   - Green procurement and supply chain sustainability
   - Circular economy principles
   - Life cycle assessment (LCA)
   - ESG integration in business strategy

## Response Guidelines
- Be concise but comprehensive — use bullet points and numbered lists for clarity
- Always provide actionable, practical advice
- When referencing EcoSphere features, be specific about where users can find them
- Use data and statistics when relevant to support recommendations
- Encourage and motivate users in their sustainability journey
- If unsure about specific numbers, say so and provide ranges or general guidance
- Format responses with clear headers for longer answers
- Keep tone warm and encouraging — sustainability is a journey, not a destination

## Important Context
- Users are sustainability managers, ESG officers, employees, and company admins
- They are working to track, improve, and report their organization's ESG performance
- Help them make the most of EcoSphere's features to achieve their sustainability goals`;

// ─── Local Knowledge Base Fallback ────────────────────────────────────────
const LOCAL_KNOWLEDGE = {
  'scope 1': `**Scope 1 Emissions** are direct greenhouse gas emissions from sources owned or controlled by your organization:
• Combustion in owned/controlled boilers, furnaces, vehicles
• Emissions from owned industrial processes
• Fugitive emissions (AC leaks, gas pipelines)

**To track in EcoSphere:** Go to Environmental → Log Emission → select "Scope 1" and source type (Natural Gas, Fuel, etc.)`,

  'scope 2': `**Scope 2 Emissions** are indirect emissions from purchased electricity, heat, steam, or cooling:
• Electricity consumed at your facilities
• District heating/cooling purchased
• Steam purchased from utilities

**To track in EcoSphere:** Go to Environmental → Log Emission → select "Scope 2" and "Electricity" as source type`,

  'scope 3': `**Scope 3 Emissions** are all other indirect emissions in your value chain:
• **Upstream:** Purchased goods, business travel, employee commuting, capital goods
• **Downstream:** Use of sold products, end-of-life treatment, leased assets

Scope 3 typically accounts for 70-90% of total corporate emissions. Use EcoSphere's Environmental module to log "Scope 3" transactions.`,

  'gri': `**GRI (Global Reporting Initiative)** is the world's most widely used sustainability reporting framework:
• **GRI Universal Standards:** Apply to all organizations
• **GRI Topic Standards:** Specific disclosures (GRI 305 for Emissions, GRI 401 for Employment)
• Used by 10,000+ organizations in 100+ countries

EcoSphere's Reports module generates data aligned with GRI standards for your disclosures.`,

  'esg score': `**ESG Scores** measure your organization's performance on Environmental, Social, and Governance factors:

**EcoSphere Score Calculation:**
- **Environmental (E):** Carbon reduction progress, goal completion, emission intensity
- **Social (S):** CSR participation rate, volunteer hours, employee engagement
- **Governance (G):** Policy compliance, audit completion, issue resolution rate
- Total score is weighted average (0-100 scale)

**To calculate:** Go to Reports → Calculate ESG Score → view department rankings`,

  'carbon footprint': `**Reducing Carbon Footprint — Top Strategies:**

**Energy:**
• Switch to renewable energy (solar, wind)
• Improve building energy efficiency (LED, insulation)
• Implement energy management systems

**Transportation:**
• Promote remote work and virtual meetings
• EV fleet transition
• Incentivize public transport/cycling

**Operations:**
• Optimize supply chain logistics
• Reduce waste and increase recycling
• Implement circular economy practices

**Track your progress** in EcoSphere's Environmental module with monthly emission goals!`,

  'csr': `**CSR (Corporate Social Responsibility) Best Practices:**

**High-Impact Activities:**
• Community volunteering programs
• Educational partnerships and scholarships
• Environmental cleanup drives
• Healthcare camps and wellness programs
• Local supplier development

**Employee Engagement Tips:**
• Let employees choose causes they care about
• Create team CSR challenges (great for Gamification!)
• Recognize and reward participation with badges and XP
• Share impact stories internally

**Track in EcoSphere:** Social module → Create CSR Activity → employees join and log participation`,

  'sdg': `**UN Sustainable Development Goals (SDGs) most relevant to corporate ESG:**

• **SDG 7:** Affordable and Clean Energy
• **SDG 8:** Decent Work and Economic Growth
• **SDG 12:** Responsible Consumption and Production
• **SDG 13:** Climate Action ⭐ Most common corporate commitment
• **SDG 15:** Life on Land
• **SDG 16:** Peace, Justice and Strong Institutions
• **SDG 17:** Partnerships for the Goals

Map your EcoSphere activities to specific SDGs for your sustainability report!`,

  'tcfd': `**TCFD (Task Force on Climate-related Financial Disclosures)** framework covers:

• **Governance:** Board oversight of climate risks
• **Strategy:** Climate risks/opportunities impact on business
• **Risk Management:** Identifying and managing climate risks
• **Metrics & Targets:** Carbon emissions, climate KPIs, reduction targets

EcoSphere's Reports module provides the emissions data you need for TCFD disclosures.`,

  'gamification': `**Gamification for Sustainability Engagement:**

**EcoSphere Gamification Features:**
• **Challenges:** Time-bound sustainability tasks (reduce energy use, join CSR events)
• **Badges:** Awards for achievements (Carbon Champion, CSR Hero, Compliance Star)
• **XP Points:** Earned for every eco-friendly action logged
• **Leaderboards:** Department and individual rankings

**Best Practices:**
• Set clear, achievable challenge targets
• Make leaderboards visible to all employees
• Celebrate badge earners in team meetings
• Align challenges with your ESG goals`,

  'default': `I'm **EcoBot**, your EcoSphere ESG assistant! 🌍

I can help you with:
• **Carbon & Emissions** — Scope 1, 2, 3 tracking, carbon reduction strategies
• **ESG Frameworks** — GRI, SASB, TCFD, UN SDGs, CDP
• **CSR & Social** — Activity ideas, employee engagement, DEI metrics
• **Governance** — Compliance, policies, audit management
• **ESG Scoring** — How scores work, improvement strategies
• **Gamification** — Challenges, badges, leaderboards

What would you like to explore?`,
};

const getLocalResponse = (message) => {
  const msg = message.toLowerCase();
  if (msg.includes('scope 1') || msg.includes('scope1')) return LOCAL_KNOWLEDGE['scope 1'];
  if (msg.includes('scope 2') || msg.includes('scope2')) return LOCAL_KNOWLEDGE['scope 2'];
  if (msg.includes('scope 3') || msg.includes('scope3')) return LOCAL_KNOWLEDGE['scope 3'];
  if (msg.includes('gri') || msg.includes('global reporting')) return LOCAL_KNOWLEDGE['gri'];
  if (msg.includes('esg score') || msg.includes('calculate score') || msg.includes('scoring')) return LOCAL_KNOWLEDGE['esg score'];
  if (msg.includes('carbon footprint') || msg.includes('reduce carbon') || msg.includes('carbon reduction')) return LOCAL_KNOWLEDGE['carbon footprint'];
  if (msg.includes('csr') || msg.includes('corporate social') || msg.includes('volunteer')) return LOCAL_KNOWLEDGE['csr'];
  if (msg.includes('sdg') || msg.includes('sustainable development goal')) return LOCAL_KNOWLEDGE['sdg'];
  if (msg.includes('tcfd') || msg.includes('climate disclosure') || msg.includes('climate risk')) return LOCAL_KNOWLEDGE['tcfd'];
  if (msg.includes('gamif') || msg.includes('badge') || msg.includes('challenge') || msg.includes('leaderboard')) return LOCAL_KNOWLEDGE['gamification'];
  return null; // No local match — try Gemini
};

// ─── Chat Route ─────────────────────────────────────────────────────────────
router.post('/chat', authenticate, async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    if (!message?.trim()) throw new AppError('Message is required', 400);

    const sid = sessionId || req.user._id.toString();

    // Try local knowledge base first for common questions
    const localAnswer = getLocalResponse(message);

    // Try Gemini
    const model = await initModel();
    if (model) {
      const { HumanMessage, SystemMessage, AIMessage } = await import('@langchain/core/messages');

      if (!conversationHistory.has(sid)) {
        conversationHistory.set(sid, []);
      }
      const history = conversationHistory.get(sid);

      const messages = [
        new SystemMessage(ESG_SYSTEM_PROMPT),
        ...history,
        new HumanMessage(message),
      ];

      try {
        const response = await model.invoke(messages);
        const aiResponse = response.content || 'I could not generate a response. Please try again.';

        // Update history (keep last 10 exchanges = 20 messages)
        history.push(new HumanMessage(message));
        history.push(new AIMessage(aiResponse));
        if (history.length > 20) history.splice(0, 2);
        conversationHistory.set(sid, history);

        // Auto-clean sessions after 30 minutes
        setTimeout(() => conversationHistory.delete(sid), 30 * 60 * 1000);

        return res.json({
          success: true,
          data: {
            response: aiResponse,
            sessionId: sid,
            timestamp: new Date().toISOString(),
            source: 'gemini',
          },
        });
      } catch (modelErr) {
        console.warn('[EcoBot] Gemini invocation failed:', modelErr.message);
        // Fall through to local knowledge
      }
    }

    // Use local knowledge base
    const fallbackResponse = localAnswer || LOCAL_KNOWLEDGE['default'];

    return res.json({
      success: true,
      data: {
        response: fallbackResponse,
        sessionId: sid,
        timestamp: new Date().toISOString(),
        source: 'local',
      },
    });
  } catch (e) {
    next(e);
  }
});

// ─── Clear conversation session ──────────────────────────────────────────────
router.delete('/chat/session/:sessionId', authenticate, async (req, res) => {
  conversationHistory.delete(req.params.sessionId);
  res.json({ success: true, message: 'Conversation cleared' });
});

// ─── Quick ESG tips ──────────────────────────────────────────────────────────
router.get('/tips', authenticate, async (req, res) => {
  const tips = [
    { category: 'Environmental', tip: 'Track Scope 1, 2, and 3 emissions separately for accurate carbon accounting. Scope 3 often represents 70-90% of total emissions.' },
    { category: 'Social', tip: 'Employee participation in CSR activities increases by 3x when activities align with personal values. Use EcoSphere to let employees choose causes.' },
    { category: 'Governance', tip: 'Regular policy acknowledgements ensure all employees are aware of compliance requirements. Target 100% completion within 30 days of policy updates.' },
    { category: 'Gamification', tip: 'Challenges with clear deadlines and visible leaderboards drive 40% higher participation rates than static programs.' },
    { category: 'Environmental', tip: 'Science-based targets (SBTi) aligned with the Paris Agreement (1.5°C pathway) are now the gold standard for corporate climate commitments.' },
    { category: 'Social', tip: 'Diversity metrics should be tracked across gender, ethnicity, age, and disability status for comprehensive GRI reporting.' },
    { category: 'Governance', tip: 'Companies with strong ESG governance have 25% lower cost of capital and 20% higher valuation multiples on average.' },
    { category: 'Environmental', tip: 'Setting a monthly carbon budget per department and tracking it in EcoSphere creates healthy competition and measurable reduction.' },
    { category: 'Social', tip: 'Volunteer time off (VTO) programs that offer 1-3 paid days per year for CSR activities increase employee retention by up to 15%.' },
    { category: 'Governance', tip: 'Use EcoSphere\'s audit trail features to document all ESG decisions — this is essential for TCFD and GRI disclosures.' },
  ];
  res.json({ success: true, data: tips });
});

// ─── ESG Quick Reference ─────────────────────────────────────────────────────
router.get('/reference', authenticate, async (req, res) => {
  const reference = {
    frameworks: ['GRI Standards', 'SASB', 'TCFD', 'UN SDGs', 'CDP', 'ISO 14001', 'CSRD', 'BRSR'],
    emissionScopes: {
      scope1: 'Direct emissions from owned/controlled sources',
      scope2: 'Indirect from purchased electricity/heat/steam',
      scope3: 'All other indirect emissions in value chain',
    },
    esgComponents: {
      environmental: ['Carbon emissions', 'Energy consumption', 'Water usage', 'Waste management', 'Biodiversity'],
      social: ['Employee engagement', 'DEI metrics', 'Community investment', 'Health & safety', 'Supply chain labor'],
      governance: ['Board composition', 'Anti-corruption', 'Data privacy', 'Policy compliance', 'Risk management'],
    },
    keyMetrics: {
      carbon: 'CO2 equivalent (CO2e) in tonnes',
      energy: 'kWh or GJ per revenue or employee',
      water: 'cubic meters or liters',
      waste: 'tonnes diverted from landfill (%)',
      social: 'volunteer hours, participation rate (%)',
    },
  };
  res.json({ success: true, data: reference });
});

export default router;

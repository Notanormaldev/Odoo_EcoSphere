import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { config } from '../config/env.js';

const router = Router();

// Initialize Gemini via LangChain
let chatModel = null;
const conversationHistory = new Map(); // In-memory per-session history

const initModel = async () => {
  if (chatModel) return chatModel;
  try {
    const { ChatGoogleGenerativeAI } = await import('@langchain/google-genai');
    chatModel = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash',
      apiKey: config.geminiApiKey,
      temperature: 0.7,
      maxOutputTokens: 1024,
    });
    return chatModel;
  } catch (err) {
    console.error('Gemini init error:', err.message);
    return null;
  }
};

const ESG_SYSTEM_PROMPT = `You are EcoBot, an intelligent ESG (Environmental, Social, and Governance) assistant for the EcoSphere platform.

Your role is to help users understand and improve their organization's ESG performance. You can:
- Explain ESG concepts, metrics, and best practices
- Help interpret carbon emission data, sustainability goals, and ESG scores
- Provide guidance on CSR activities, employee engagement, and governance compliance
- Suggest ways to improve environmental performance and reduce carbon footprint
- Answer questions about ESG frameworks (GRI, SASB, TCFD, UN SDGs)
- Help understand compliance requirements and audit processes
- Give advice on gamification strategies for sustainability engagement

Keep responses practical, concise, and actionable. When discussing the platform, reference its modules: Environmental (carbon tracking, goals), Social (CSR activities, participation), Governance (policies, audits, compliance), and Gamification (challenges, badges, rewards).

Be professional but approachable. Format responses clearly with bullet points or numbered lists when appropriate.`;

router.post('/chat', authenticate, async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    if (!message?.trim()) throw new AppError('Message is required', 400);

    const model = await initModel();
    if (!model) {
      // Fallback response if Gemini fails
      return res.json({
        success: true,
        data: {
          response: "I'm EcoBot, your ESG assistant. I'm having trouble connecting right now. Please check your Gemini API key configuration. In the meantime, you can explore the EcoSphere modules directly — Environmental for carbon tracking, Social for CSR activities, Governance for compliance, and Gamification for challenges and rewards.",
          sessionId: sessionId || 'default',
        },
      });
    }

    const { HumanMessage, SystemMessage, AIMessage } = await import('@langchain/core/messages');

    const sid = sessionId || req.user._id.toString();
    
    // Get or initialize conversation history
    if (!conversationHistory.has(sid)) {
      conversationHistory.set(sid, []);
    }
    const history = conversationHistory.get(sid);

    // Build messages array
    const messages = [
      new SystemMessage(ESG_SYSTEM_PROMPT),
      ...history,
      new HumanMessage(message),
    ];

    // Invoke model
    let aiResponse;
    try {
      const response = await model.invoke(messages);
      aiResponse = response.content || 'I could not generate a response. Please try again.';
    } catch (modelErr) {
      console.warn('Gemini model invocation failed, using local fallback:', modelErr.message);
      aiResponse = `I'm EcoBot, your ESG assistant. I am currently offline due to a connection limit or quota exhaustion with the Gemini API key. In the meantime, I can share this general advice: To reduce carbon footprint, focus on energy efficiency, encourage employee volunteering, and keep policy compliance audits transparent.`;
    }

    // Update history (keep last 10 exchanges)
    history.push(new HumanMessage(message));
    history.push(new AIMessage(aiResponse));
    if (history.length > 20) history.splice(0, 2);
    conversationHistory.set(sid, history);

    // Auto-clean sessions after 30 minutes of inactivity
    setTimeout(() => conversationHistory.delete(sid), 30 * 60 * 1000);

    res.json({
      success: true,
      data: {
        response: aiResponse,
        sessionId: sid,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (e) {
    // Graceful fallback
    if (e.message?.includes('API') || e.message?.includes('auth') || e.message?.includes('quota')) {
      return res.json({
        success: true,
        data: {
          response: `I'm EcoBot! I encountered an API issue (${e.message}). For ESG guidance, check our platform modules or visit the GRI Standards website. Your question was: "${req.body.message}"`,
          sessionId: req.body.sessionId || 'default',
          error: true,
        },
      });
    }
    next(e);
  }
});

// Clear conversation history
router.delete('/chat/session/:sessionId', authenticate, async (req, res) => {
  conversationHistory.delete(req.params.sessionId);
  res.json({ success: true, message: 'Conversation cleared' });
});

// Quick ESG tips (no Gemini needed)
router.get('/tips', authenticate, async (req, res) => {
  const tips = [
    { category: 'Environmental', tip: 'Track Scope 1, 2, and 3 emissions separately for more accurate carbon accounting.' },
    { category: 'Social', tip: 'Employee participation in CSR activities increases when they align with personal values.' },
    { category: 'Governance', tip: 'Regular policy acknowledgements ensure all employees are aware of compliance requirements.' },
    { category: 'Gamification', tip: 'Challenges with clear deadlines and visible leaderboards drive higher participation rates.' },
    { category: 'Environmental', tip: 'Setting science-based targets (SBTs) aligned with Paris Agreement goals improves credibility.' },
    { category: 'Social', tip: 'Diversity metrics should be tracked across gender, ethnicity, and age for comprehensive reporting.' },
  ];
  res.json({ success: true, data: tips });
});

export default router;

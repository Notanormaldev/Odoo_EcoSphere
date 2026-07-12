import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@shared/api/client';
import useAuthStore from '@app/store/authStore';
import Logo from '@shared/ui/Logo';

const QUICK_QUESTIONS = [
  'What is Scope 1, 2, and 3 emissions?',
  'How can our company reduce carbon footprint?',
  'What is the GRI reporting framework?',
  'How do I calculate ESG scores?',
  'What are good CSR activity ideas?',
  'What is science-based target setting?',
  'Explain TCFD disclosure requirements',
  'How does EcoSphere gamification work?',
  'What are the UN Sustainable Development Goals?',
  'How to improve governance compliance?',
];

const CAPABILITIES = [
  { icon: '🌿', label: 'Carbon accounting & Scope 1/2/3' },
  { icon: '📋', label: 'GRI, SASB, TCFD frameworks' },
  { icon: '🤝', label: 'CSR strategy & activities' },
  { icon: '🏛️', label: 'Compliance & audit guidance' },
  { icon: '🎯', label: 'ESG scoring & metrics' },
  { icon: '🏆', label: 'Gamification strategies' },
  { icon: '🌐', label: 'UN SDGs alignment' },
  { icon: '📊', label: 'Report interpretation' },
];

// Parse markdown-ish to JSX-safe HTML
function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:var(--color-stone-100);padding:2px 5px;border-radius:4px;font-family:var(--font-mono);font-size:0.85em">$1</code>')
    .replace(/^### (.*$)/gm, '<h4 style="font-size:13px;font-weight:700;color:var(--color-stone-800);margin:12px 0 4px">$1</h4>')
    .replace(/^## (.*$)/gm, '<h3 style="font-size:14px;font-weight:700;color:var(--color-stone-900);margin:14px 0 6px">$1</h3>')
    .replace(/^• (.*$)/gm, '<li style="margin:3px 0 3px 16px;list-style:disc">$1</li>')
    .replace(/^\* (.*$)/gm, '<li style="margin:3px 0 3px 16px;list-style:disc">$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li style="margin:3px 0 3px 16px;list-style:decimal">$2</li>')
    .replace(/\n/g, '<br/>');
}

function BotAvatar({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--color-forest-pale)',
      border: '2px solid rgba(45,80,22,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, overflow: 'hidden',
    }}>
      <Logo size={size * 0.65} withText={false} />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="chat-message">
      <BotAvatar />
      <div className="chat-bubble bot" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '14px 18px' }}>
        {[0, 200, 400].map((delay) => (
          <span key={delay} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--color-stone-400)',
            display: 'inline-block',
            animation: 'typingBounce 1.2s infinite',
            animationDelay: `${delay}ms`,
          }} />
        ))}
      </div>
    </div>
  );
}

export default function ChatbotPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      content: `Hi **${user?.name?.split(' ')[0] || 'there'}**! I'm **EcoBot** 🌍 — your AI-powered ESG assistant on EcoSphere.

I'm here to help you with:
• **Carbon tracking** — Scope 1, 2 & 3 emissions explained
• **ESG frameworks** — GRI, TCFD, SASB, UN SDGs & more
• **CSR strategy** — Activity ideas and engagement tips
• **Governance** — Compliance, audits, policy management
• **Gamification** — Challenges, badges, and leaderboards

What would you like to explore today?`,
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(`session-${Date.now()}`);
  const [showQuestions, setShowQuestions] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Fetch tips for sidebar
  const { data: tipsData } = useQuery({
    queryKey: ['chatbot-tips'],
    queryFn: () => api.get('/chatbot/tips').then((r) => r.data.data),
    staleTime: Infinity,
  });

  const chatMutation = useMutation({
    mutationFn: (message) => api.post('/chatbot/chat', { message, sessionId }),
    onSuccess: ({ data }) => {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== 'typing'),
        {
          id: `bot-${Date.now()}`,
          role: 'bot',
          content: data.data.response,
          time: new Date(),
          source: data.data.source,
        },
      ]);
    },
    onError: (err) => {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== 'typing'),
        {
          id: `err-${Date.now()}`,
          role: 'bot',
          content: `Sorry, I ran into an issue: *${err.response?.data?.message || 'Connection error'}*. Please try again.`,
          time: new Date(),
          error: true,
        },
      ]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const sendMessage = (text) => {
    const msg = (text || input).trim();
    if (!msg || chatMutation.isPending) return;
    setShowQuestions(false);
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', content: msg, time: new Date() },
      { id: 'typing', role: 'typing' },
    ]);
    setInput('');
    chatMutation.mutate(msg);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    try {
      await api.delete(`/chatbot/chat/session/${sessionId}`);
    } catch {}
    setMessages([{
      id: 'welcome-2',
      role: 'bot',
      content: 'Chat cleared! How can I help you with your ESG journey? 🌱',
      time: new Date(),
    }]);
    setShowQuestions(true);
  };

  return (
    <div className="animate-fade-in">
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        .chatbot-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 16px;
          height: calc(100vh - 160px);
          min-height: 500px;
        }
        @media (max-width: 768px) {
          .chatbot-layout {
            grid-template-columns: 1fr;
            height: auto;
          }
          .chatbot-sidebar { display: none; }
          .chatbot-main { height: calc(100vh - 180px); }
        }
        .quick-q-btn {
          text-align: left;
          background: var(--color-stone-50);
          border: 1px solid var(--color-stone-200);
          border-radius: var(--radius);
          padding: 7px 10px;
          font-size: 12px;
          color: var(--color-stone-700);
          cursor: pointer;
          transition: all var(--transition-fast);
          line-height: 1.4;
          width: 100%;
        }
        .quick-q-btn:hover {
          background: var(--color-forest-pale);
          border-color: var(--color-forest);
          color: var(--color-forest);
        }
      `}</style>

      {/* Page header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BotAvatar size={40} />
          <div>
            <h1 className="page-title" style={{ marginBottom: 2 }}>EcoBot AI</h1>
            <p className="page-subtitle">Your intelligent ESG assistant — powered by EcoSphere</p>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={clearChat}>
            🗑️ Clear Chat
          </button>
        </div>
      </div>

      <div className="chatbot-layout">
        {/* Sidebar */}
        <div className="chatbot-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          {/* Quick questions */}
          <div className="card card-sm" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-stone-500)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Quick Questions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, overflowY: 'auto', flex: 1 }}>
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  className="quick-q-btn"
                  onClick={() => sendMessage(q)}
                  disabled={chatMutation.isPending}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div className="card card-sm">
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-stone-500)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              EcoBot Expertise
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {CAPABILITIES.map(({ icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-stone-600)' }}>
                  <span style={{ fontSize: 14 }}>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="chat-container chatbot-main" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Messages */}
          <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {messages.map((msg) => {
              if (msg.id === 'typing') return <TypingIndicator key="typing" />;

              if (msg.role === 'bot') {
                return (
                  <div key={msg.id} className="chat-message" style={{ display: 'flex', gap: 10, maxWidth: '85%' }}>
                    <BotAvatar />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                      <div
                        className="chat-bubble bot"
                        style={{
                          background: msg.error ? 'var(--color-danger-pale)' : 'var(--color-stone-50)',
                          border: `1px solid ${msg.error ? 'var(--color-danger)' : 'var(--color-stone-200)'}`,
                          borderRadius: '2px var(--radius-md) var(--radius-md) var(--radius-md)',
                          padding: '12px 16px',
                          fontSize: 13,
                          lineHeight: 1.65,
                          color: 'var(--color-stone-800)',
                        }}
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, color: 'var(--color-stone-400)' }}>
                          {msg.time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              // User message
              return (
                <div key={msg.id} className="chat-message user" style={{ display: 'flex', gap: 10, maxWidth: '80%', marginLeft: 'auto', flexDirection: 'row-reverse' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--color-forest)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
                  }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                    <div
                      className="chat-bubble user"
                      style={{
                        background: 'var(--color-forest)',
                        color: '#fff',
                        borderRadius: 'var(--radius-md) 2px var(--radius-md) var(--radius-md)',
                        padding: '12px 16px',
                        fontSize: 13,
                        lineHeight: 1.65,
                      }}
                    >
                      {msg.content}
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--color-stone-400)' }}>
                      {msg.time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Inline quick questions when chat is fresh */}
          {showQuestions && messages.length <= 1 && (
            <div style={{ padding: '8px 16px 0', display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: 'var(--border)' }}>
              {QUICK_QUESTIONS.slice(0, 4).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={{
                    background: 'var(--color-forest-pale)',
                    border: '1px solid rgba(45,80,22,0.2)',
                    borderRadius: 'var(--radius-full)',
                    padding: '5px 12px',
                    fontSize: 12,
                    color: 'var(--color-forest)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(45,80,22,0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-forest-pale)'}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="chat-input-area" style={{ padding: '12px 16px', borderTop: 'var(--border)', background: 'var(--surface-card)', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                ref={textareaRef}
                className="chat-input"
                placeholder="Ask EcoBot about ESG, carbon tracking, sustainability frameworks…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                style={{ width: '100%', resize: 'none', paddingRight: 8 }}
              />
              {input && (
                <div style={{ fontSize: 10, color: 'var(--color-stone-400)', position: 'absolute', bottom: 4, right: 8 }}>
                  Shift+Enter for new line
                </div>
              )}
            </div>
            <button
              className="btn btn-primary"
              onClick={() => sendMessage()}
              disabled={!input.trim() || chatMutation.isPending}
              style={{ flexShrink: 0, height: 40, width: 48, padding: 0, justifyContent: 'center', fontSize: 18 }}
              title="Send message (Enter)"
            >
              {chatMutation.isPending
                ? <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff', width: 16, height: 16 }} />
                : '↑'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

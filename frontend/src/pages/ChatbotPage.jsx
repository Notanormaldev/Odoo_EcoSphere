import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@shared/api/client';
import useAuthStore from '@app/store/authStore';

const QUICK_QUESTIONS = [
  'What is Scope 1, 2, and 3 emissions?',
  'How can our company reduce carbon footprint?',
  'What is the GRI reporting framework?',
  'How do I calculate ESG scores?',
  'What are good CSR activity ideas?',
  'What is science-based target setting?',
];

function TypingIndicator() {
  return (
    <div className="chat-message">
      <div className="chat-avatar bot">🌍</div>
      <div className="chat-bubble bot" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span className="skeleton" style={{ width: 6, height: 6, borderRadius: '50%', animationDelay: '0ms' }} />
        <span className="skeleton" style={{ width: 6, height: 6, borderRadius: '50%', animationDelay: '200ms' }} />
        <span className="skeleton" style={{ width: 6, height: 6, borderRadius: '50%', animationDelay: '400ms' }} />
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
      content: `Hi, I'm **EcoBot** 🌍 — your ESG assistant!\n\nI can help you understand carbon emissions, ESG frameworks, CSR best practices, governance compliance, and anything else related to sustainability.\n\nWhat would you like to know?`,
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(`session-${Date.now()}`);
  const messagesEndRef = useRef(null);

  const chatMutation = useMutation({
    mutationFn: (message) => api.post('/chatbot/chat', { message, sessionId }),
    onSuccess: ({ data }) => {
      setMessages((prev) => [
        ...prev.filter(m => m.id !== 'typing'),
        {
          id: `bot-${Date.now()}`,
          role: 'bot',
          content: data.data.response,
          time: new Date(),
        },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev.filter(m => m.id !== 'typing'),
        {
          id: `err-${Date.now()}`,
          role: 'bot',
          content: 'I encountered an error. Please try again.',
          time: new Date(),
          error: true,
        },
      ]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text) => {
    const msg = text || input.trim();
    if (!msg) return;

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

  // Simple markdown-like formatting
  const formatContent = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:var(--color-stone-100);padding:1px 4px;border-radius:3px;font-family:var(--font-mono);font-size:0.9em">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">💬 EcoBot</h1>
          <p className="page-subtitle">AI-powered ESG assistant — ask anything about sustainability</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, height: 'calc(100vh - 180px)' }}>
        {/* Sidebar */}
        <div>
          <div className="card card-sm" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-stone-700)', marginBottom: 10 }}>
              Quick Questions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  className="btn btn-ghost btn-sm"
                  style={{ textAlign: 'left', justifyContent: 'flex-start', whiteSpace: 'normal', lineHeight: 1.4, height: 'auto', padding: '6px 8px' }}
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="card card-sm">
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-stone-700)', marginBottom: 8 }}>
              EcoBot can help with
            </div>
            {['Carbon accounting', 'ESG frameworks', 'CSR strategy', 'Compliance guidance', 'Sustainability goals', 'Report interpretation'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 12, color: 'var(--color-stone-600)' }}>
                <span style={{ color: 'var(--color-forest)' }}>✓</span> {t}
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((msg) => {
              if (msg.id === 'typing') return <TypingIndicator key="typing" />;
              return (
                <div key={msg.id} className={`chat-message ${msg.role}`}>
                  {msg.role === 'bot' && (
                    <div className="chat-avatar bot">🌍</div>
                  )}
                  <div className={`chat-bubble ${msg.role}`}>
                    <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                    <div style={{ fontSize: 10, opacity: 0.5, marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                      {msg.time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div className="chat-avatar user">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <textarea
              className="chat-input"
              placeholder="Ask EcoBot about ESG, sustainability, or carbon tracking…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              style={{ resize: 'none' }}
            />
            <button
              className="btn btn-primary"
              onClick={() => sendMessage()}
              disabled={!input.trim() || chatMutation.isPending}
              style={{ flexShrink: 0 }}
            >
              {chatMutation.isPending ? <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> : '→'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

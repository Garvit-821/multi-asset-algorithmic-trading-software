import { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, X, Send, Zap, ChevronDown, Minimize2, ArrowUpRight } from 'lucide-react';
import { aiCopilotService, CopilotMessage, getGeminiApiKey } from '../services/aiCopilotService';

export function FloatingAICopilotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasLiveAI, setHasLiveAI] = useState(!!getGeminiApiKey());
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'drawer-init',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: '👋 Hi! I am your global AI Copilot. Query your portfolio, risks, or strategy options anytime from any view.',
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      setHasLiveAI(!!getGeminiApiKey());
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: q,
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setLoading(true);

    try {
      const res = await aiCopilotService.processQuery(q);
      setMessages(prev => [...prev, res]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: '⚠️ Failed to get response from Copilot. Please check your network or Gemini API key.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transition-all flex items-center space-x-2.5 font-bold text-xs sm:text-sm group border border-white/20"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-200 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
          </div>
          <span>AI Copilot</span>
          {hasLiveAI && <span className="text-[10px] bg-purple-400/30 px-1.5 py-0.5 rounded-md font-extrabold">GEMINI</span>}
        </button>
      )}

      {/* Slide-over Drawer Panel */}
      {isOpen && (
        <div className={`fixed z-50 transition-all duration-300 ${
          isMinimized
            ? 'bottom-6 right-6 w-72 sm:w-80 h-14 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between px-4 text-white'
            : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp'
        }`}>
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold flex items-center space-x-1.5">
                  <span>Stratrade AI Copilot</span>
                  {hasLiveAI ? (
                    <span className="text-[9px] bg-purple-500/30 text-purple-300 border border-purple-400/30 px-1.5 py-0.5 rounded font-extrabold">LIVE AI</span>
                  ) : (
                    <span className="text-[9px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.5 rounded font-extrabold">RULE-BASED</span>
                  )}
                </h4>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
              >
                {isMinimized ? <ChevronDown className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => { setIsOpen(false); setIsMinimized(false); }}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Prompts Bar */}
              <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-slate-700 shrink-0">
                <button
                  onClick={() => handleSend('What is my portfolio tech stock and crypto exposure?')}
                  className="shrink-0 px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] font-semibold transition-all"
                >
                  📊 Exposure
                </button>
                <button
                  onClick={() => handleSend('Analyze my worst losing trades')}
                  className="shrink-0 px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] font-semibold transition-all"
                >
                  📉 Losing Trades
                </button>
                <button
                  onClick={() => handleSend('Suggest risk rebalancing steps')}
                  className="shrink-0 px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] font-semibold transition-all"
                >
                  🛡️ Rebalance
                </button>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none shadow-sm font-medium'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-200/40 pb-1 mb-1.5 text-[10px] opacity-75">
                        <span>{m.sender === 'user' ? 'You' : 'Copilot'}</span>
                        <span>{m.timestamp}</span>
                      </div>
                      <div className="whitespace-pre-line font-sans">{m.text}</div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl p-3 text-xs text-slate-500 flex items-center space-x-2 shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                      <span>Thinking & analyzing live portfolio...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Input Footer */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2 shrink-0">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Query portfolio, risk or options..."
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !inputQuery.trim()}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-sm shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

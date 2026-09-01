import React, { useState } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { api } from '../services/api';
import { ChatResponse, ToolExecutionLog } from '../types';
import { Bot, Send, Sparkles, Terminal, CheckCircle2, User, ChevronRight } from 'lucide-react';

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; tools?: ToolExecutionLog[] }>>([
    {
      role: 'assistant',
      text: 'Hello Dr. Thorne! I am your autonomous **AI Placement Operations Copilot**. I have direct access to placement database tools to rank candidates, check stats, diagnose skill gaps, and inspect JDs. How can I assist your placement drive today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: 'user' as const, text: textToSend.trim() };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await api.chatWithCopilot(textToSend.trim());
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: res.response,
        tools: res.executed_tools
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'An error occurred while calling placement tools.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Rank candidates for TechNova Solutions Software Engineer",
    "Show overall placement statistics and package averages",
    "Which skills are in highest demand across company JDs?",
    "Which students need urgent SQL and DSA training?"
  ];

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-w-0">
        <Navbar title="Autonomous AI Placement Copilot" subtitle="Conversational agent with controlled business logic tool execution" />

        <main className="p-6 flex-1 flex flex-col min-h-0">
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-2xl rounded-2xl p-4 text-xs space-y-3 ${
                    m.role === 'user' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                    {/* Tool Execution Box */}
                    {m.tools && m.tools.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-brand-400">
                          <Terminal className="w-3.5 h-3.5" /> Controlled Tool Executed
                        </div>
                        {m.tools.map((t, tIdx) => (
                          <div key={tIdx} className="text-[11px] font-mono text-slate-300 bg-slate-950 p-1.5 rounded border border-slate-800">
                            <span className="text-emerald-400">✓ {t.tool_name}()</span>: {t.result_summary}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="whitespace-pre-wrap leading-relaxed">
                      {m.text}
                    </div>
                  </div>

                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-brand-400 shrink-0 font-bold text-xs border border-slate-700">
                      U
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-brand-400 animate-pulse pl-11">
                  <Sparkles className="w-4 h-4" /> Agent analyzing database records & calculating match scores...
                </div>
              )}
            </div>

            {/* Quick Action Chips */}
            <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/50 flex flex-wrap gap-1.5">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(qp)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left transition"
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask placement copilot (e.g. 'Show students eligible for Java Developer roles')..."
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

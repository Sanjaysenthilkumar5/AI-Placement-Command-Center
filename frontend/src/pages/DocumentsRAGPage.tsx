import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { api } from '../services/api';
import { DocumentItem, RAGQueryResponse } from '../types';
import { FileText, Search, Sparkles, BookOpen, ShieldCheck, Upload, AlertCircle, Quote } from 'lucide-react';

export const DocumentsRAGPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [query, setQuery] = useState('');
  const [ragResult, setRagResult] = useState<RAGQueryResponse | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const list = await api.getDocuments();
        setDocuments(list);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDocs();
  }, []);

  const handleAskRAG = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await api.queryRAG(query.trim());
      setRagResult(res);
    } catch (e) {
      alert('Error searching RAG knowledge');
    } finally {
      setSearching(false);
    }
  };

  const sampleQuestions = [
    "What is the eligibility requirement for Dream Companies (₹12+ LPA)?",
    "What are the mandatory skills for TechNova Solutions Software Engineer?",
    "What is the policy if a student misses a registered technical round?"
  ];

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-w-0">
        <Navbar title="RAG Placement Knowledge & Policy Search" subtitle="Grounded vector retrieval across institutional circulars and drive guidelines" />
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Query Bar */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-400">
              <Sparkles className="w-4 h-4" /> Ask Placement Document Knowledge Base
            </div>
            <form onSubmit={handleAskRAG} className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about placement policy rules, minimum cutoffs, dream company provisions..."
                className="w-full pl-4 pr-28 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                disabled={searching}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition"
              >
                {searching ? 'Retrieving...' : 'Ask RAG'}
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] text-slate-400 font-semibold">Suggested Questions:</span>
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(q)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-left border border-slate-700"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Grounded Response Card with Citations */}
          {ragResult && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-brand-500/30 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" /> Grounded Synthesized Response
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Confidence: <strong className="text-brand-400">{Math.round(ragResult.confidence_score * 100)}%</strong>
                </span>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                {ragResult.answer}
              </p>

              {/* Source Document Citations */}
              {ragResult.citations.length > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-brand-400" /> Source Citations & Context Evidence
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {ragResult.citations.map((cite, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-200">{cite.document_title}</span>
                          <span className="text-[10px] text-brand-400 font-semibold">Chunk #{cite.chunk_index}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] italic">"{cite.snippet}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Indexed Documents List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Indexed Placement Documents ({documents.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold uppercase">{doc.category}</span>
                  <h4 className="text-xs font-bold text-white mt-1.5">{doc.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{doc.chunks_count} indexed chunks</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

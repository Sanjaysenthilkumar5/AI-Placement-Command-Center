import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Database, Award, Users, Building2, Briefcase, CheckCircle2, ChevronRight, TrendingUp, BarChart3, Bot, Zap } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { demoLogin } = useAuth();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">AI Placement <span className="text-brand-400">Command Center</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => demoLogin('admin')} className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition">
              Live Demo (Admin)
            </button>
            <Link to="/login" className="text-xs font-bold px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/20 transition flex items-center gap-1.5">
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <section className="py-20 px-6 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen Enterprise Placement Intelligence Platform
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto mb-6">
          Connect Students with Careers using <span className="bg-gradient-to-r from-brand-400 via-indigo-400 to-teal-400 bg-clip-text text-transparent">AI Candidate Matching</span> & Skill-Gap Intelligence
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Replace error-prone spreadsheets with a hybrid matching engine, explainable AI recommendations, grounded RAG policies, and autonomous placement copilot.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button onClick={() => demoLogin('admin')} className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25 flex items-center gap-2 transition">
            <span>Explore Placement Officer Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => demoLogin('student')} className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition flex items-center gap-2">
            <span>View Student Experience</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 max-w-4xl mx-auto text-left">
          <div><p className="text-2xl sm:text-3xl font-black text-white">52+</p><p className="text-xs text-slate-400 font-medium">Students Analyzed</p></div>
          <div><p className="text-2xl sm:text-3xl font-black text-brand-400">10+</p><p className="text-xs text-slate-400 font-medium">Partner Companies</p></div>
          <div><p className="text-2xl sm:text-3xl font-black text-emerald-400">94.2%</p><p className="text-xs text-slate-400 font-medium">Top Match Precision</p></div>
          <div><p className="text-2xl sm:text-3xl font-black text-purple-400">₹24 LPA</p><p className="text-xs text-slate-400 font-medium">Highest Package Offer</p></div>
        </div>
      </section>

      <section className="py-16 px-6 bg-slate-900/40 border-y border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xs uppercase tracking-widest font-bold text-brand-400 mb-2">Automated End-to-End Workflow</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">From Company JD to Shortlist in Seconds</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-center">
            {[
              { step: '1', title: 'Upload JD', desc: 'PDF / Text JD upload' },
              { step: '2', title: 'AI Extraction', desc: 'Extracts skills & cutoffs' },
              { step: '3', title: 'Hard Filtering', desc: 'Pre-checks CGPA & branches' },
              { step: '4', title: 'Hybrid Scoring', desc: 'Skills, projects & CGPA' },
              { step: '5', title: 'XAI Rationale', desc: 'Strengths & skill gaps' },
              { step: '6', title: 'Shortlist', desc: 'Officer confirms action' }
            ].map((st) => (
              <div key={st.step} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 font-bold text-xs flex items-center justify-center mb-2">{st.step}</div>
                <h4 className="text-xs font-bold text-slate-100">{st.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { api } from '../../services/api';
import { StudentDetail, StudentPrepPlan, JobDrive } from '../../types';
import { Sparkles, GraduationCap, Briefcase, FileText, CheckCircle2, XCircle, Upload, ArrowRight, User, Award } from 'lucide-react';

export const StudentPortalPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [profile, setProfile] = useState<StudentDetail | null>(null);
  const [prepPlan, setPrepPlan] = useState<StudentPrepPlan | null>(null);
  const [jobs, setJobs] = useState<JobDrive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const p = await api.getCurrentStudentProfile();
        setProfile(p);
        const [plan, jList] = await Promise.all([
          api.getStudentPrepPlan(p.id),
          api.getJobs()
        ]);
        setPrepPlan(plan);
        setJobs(jList);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  if (loading || !profile) {
    return (
      <div className="flex bg-slate-950 min-h-screen">
        <Sidebar />
        <div className="ml-64 flex-1 p-8 text-center text-slate-400">Loading student career cockpit...</div>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-w-0">
        <Navbar title="Student Career Intelligence Portal" subtitle={`Welcome, ${profile.full_name} (${profile.roll_number})`} />

        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Top Tabs */}
          <div className="flex border-b border-slate-800 gap-6 text-xs font-bold">
            {[
              { id: 'overview', label: 'Profile & AI Summary' },
              { id: 'matches', label: 'Job Matches & Skill Gaps' },
              { id: 'prepplan', label: 'Personalized 4-Week Prep Plan' },
              { id: 'applications', label: 'My Applications & Feedback' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 transition relative ${
                  activeTab === tab.id ? 'text-brand-400 border-b-2 border-brand-500' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Profile Card & Readiness */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 md:col-span-2 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white">{profile.full_name}</h3>
                      <p className="text-xs text-slate-400">{profile.roll_number} • {profile.department} Department (CGPA: {profile.cgpa.toFixed(2)})</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs uppercase">
                      {profile.placement_status}
                    </span>
                  </div>

                  {profile.ai_profile_summary && (
                    <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs">
                      <div className="font-bold text-brand-300 flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-brand-400" /> AI Career Persona
                      </div>
                      <p className="text-slate-200 leading-relaxed">{profile.ai_profile_summary}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Verified Skill Stack</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.detailed_skills.map((sk) => (
                        <span key={sk.id} className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 font-medium">
                          {sk.skill_name} <span className="text-slate-500 text-[10px]">({sk.proficiency_level})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-950/40 via-slate-900 to-indigo-950/40 border border-brand-500/30 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">Placement Readiness</span>
                    <h3 className="text-4xl font-black text-white mt-2">{profile.placement_readiness_score}%</h3>
                    <p className="text-xs text-slate-400 mt-2">
                      Multi-factor index computed across technical stack depth, CGPA ratio, and mock interview feedback.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('prepplan')}
                    className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg mt-4 flex items-center justify-center gap-1.5"
                  >
                    <span>View 4-Week Prep Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JOB MATCHES & GAPS */}
          {activeTab === 'matches' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Live Company Job Matches for your Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((j) => {
                  const studentSkills = new Set(profile.skills.map(s => s.toLowerCase()));
                  const matched = j.required_skills.filter(s => studentSkills.has(s.toLowerCase()));
                  const missing = j.required_skills.filter(s => !studentSkills.has(s.toLowerCase()));
                  const matchPct = Math.round((matched.length / j.required_skills.length) * 100) || 75;

                  return (
                    <div key={j.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">{j.company_name}</span>
                          <h4 className="text-base font-bold text-white">{j.title}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-black text-brand-400">{matchPct}%</span>
                          <p className="text-[10px] text-slate-500">Match Score</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex flex-wrap gap-1">
                          {matched.map(s => (
                            <span key={s} className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">✓ {s}</span>
                          ))}
                          {missing.map(s => (
                            <span key={s} className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">✗ {s} (Missing)</span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab('prepplan')}
                        className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center block"
                      >
                        Generate Targeted Preparation Roadmap
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: 4-WEEK PREP PLAN */}
          {activeTab === 'prepplan' && prepPlan && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-900/40 via-slate-900 to-indigo-900/40 border border-brand-500/30">
                <div className="flex items-center gap-2 font-bold text-brand-300 text-sm mb-1">
                  <GraduationCap className="w-4 h-4 text-brand-400" /> Targeted Role Roadmap: {prepPlan.target_role}
                </div>
                <p className="text-xs text-slate-300">{prepPlan.ai_advisor_note}</p>
                <div className="flex items-center gap-4 mt-3 text-xs font-semibold">
                  <span className="text-slate-400">Current Readiness: <strong className="text-white">{prepPlan.estimated_readiness_before}%</strong></span>
                  <span>→</span>
                  <span className="text-emerald-400">Projected Readiness After 4 Weeks: <strong>{prepPlan.estimated_readiness_after}%</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prepPlan.weekly_schedule.map((w) => (
                  <div key={w.week_number} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-black text-brand-400 uppercase tracking-wider">Week {w.week_number}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">{w.target_skill}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{w.focus_title}</h4>

                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Key Topics:</p>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {w.topics.map((t, idx) => (
                          <li key={idx} className="flex items-start gap-1.5"><span className="text-brand-400">•</span><span>{t}</span></li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Practical Exercises:</p>
                      <ul className="space-y-1 text-xs text-emerald-400/90">
                        {w.practical_exercises.map((ex, idx) => (
                          <li key={idx} className="flex items-start gap-1.5"><span>✓</span><span>{ex}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: APPLICATIONS & FEEDBACK */}
          {activeTab === 'applications' && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Active Placement Drive Applications</h3>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-100">TechNova Solutions — Software Engineer</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">Applied: Aug 2026 • Status: <strong className="text-emerald-400">Shortlisted for Round 1 Interview</strong></p>
                </div>
                <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 font-bold">94.2% AI Match</span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

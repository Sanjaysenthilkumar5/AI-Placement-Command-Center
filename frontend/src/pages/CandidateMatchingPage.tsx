import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { XAIModal } from '../components/matching/XAIModal';
import { WeightSliderModal } from '../components/matching/WeightSliderModal';
import { api } from '../services/api';
import { JobDrive, CandidateMatch, XAIAnalysis, MatchWeights } from '../types';
import { Sparkles, Sliders, CheckCircle2, XCircle, Search, Filter, ArrowRight, UserCheck } from 'lucide-react';

export const CandidateMatchingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState<JobDrive[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number>(1);
  const [candidates, setCandidates] = useState<CandidateMatch[]>([]);
  const [selectedXAI, setSelectedXAI] = useState<XAIAnalysis | null>(null);
  const [showWeightsModal, setShowWeightsModal] = useState(false);
  const [eligibilityOnly, setEligibilityOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const [weights, setWeights] = useState<MatchWeights>({
    eligibility_weight: 0.20,
    required_skills_weight: 0.30,
    preferred_skills_weight: 0.10,
    projects_weight: 0.10,
    internships_weight: 0.05,
    cgpa_weight: 0.10,
    experience_weight: 0.05,
    soft_skills_weight: 0.05,
    certifications_weight: 0.05
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jList = await api.getJobs();
        setJobs(jList);
        const queryJobId = searchParams.get('job_id');
        if (queryJobId) {
          setSelectedJobId(Number(queryJobId));
        } else if (jList.length > 0) {
          setSelectedJobId(jList[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchJobs();
  }, []);

  const fetchRankings = async () => {
    if (!selectedJobId) return;
    setLoading(true);
    try {
      const list = await api.getCandidatesForJob(selectedJobId, { eligibility_only: eligibilityOnly });
      setCandidates(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [selectedJobId, eligibilityOnly]);

  const openXAI = async (studentId: number) => {
    try {
      const res = await api.getCandidateXAI(selectedJobId, studentId);
      setSelectedXAI(res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShortlist = async (studentId: number) => {
    await api.updateCandidateStatus(selectedJobId, studentId, 'shortlisted');
    fetchRankings();
  };

  const handleReject = async (studentId: number) => {
    await api.updateCandidateStatus(selectedJobId, studentId, 'rejected');
    fetchRankings();
  };

  const handleSaveWeights = async (newWeights: MatchWeights) => {
    setWeights(newWeights);
    await api.updateMatchWeights(newWeights);
    fetchRankings();
  };

  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-w-0">
        <Navbar title="AI Candidate Matching & Ranking Engine" subtitle="Hybrid scoring matrix with explainable evidence" />

        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Top Job Selector & Controls Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <label className="block text-[11px] font-bold text-brand-400 uppercase tracking-wider mb-1">Select Target Placement Drive</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(Number(e.target.value))}
                  className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:outline-none focus:border-brand-500"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>{j.company_name} — {j.title} (₹{j.salary_lpa} LPA)</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowWeightsModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                >
                  <Sliders className="w-4 h-4 text-brand-400" />
                  <span>Configure Weights</span>
                </button>
                <button
                  onClick={() => setEligibilityOnly(!eligibilityOnly)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                    eligibilityOnly ? 'bg-brand-600 text-white border-brand-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {eligibilityOnly ? '✓ Eligible Cohort Only' : 'Show All Candidates'}
                </button>
              </div>
            </div>

            {currentJob && (
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">Required Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {currentJob.required_skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold text-[10px]">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="text-slate-400">
                  Cutoffs: <strong className="text-slate-200">CGPA ≥ {currentJob.min_cgpa}</strong> • <strong className="text-slate-200">{currentJob.max_backlogs} Backlogs</strong> • <strong className="text-slate-200">{currentJob.eligible_departments.join(', ')}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Candidate Rankings Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Ranked Candidate Cohort ({candidates.length} Analyzed)</span>
              <span className="text-xs text-brand-400 font-semibold">100% Explainable AI Grounded</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800/80">
                  <tr>
                    <th className="px-4 py-3.5">Rank</th>
                    <th className="px-4 py-3.5">Candidate Name</th>
                    <th className="px-4 py-3.5">Branch & CGPA</th>
                    <th className="px-4 py-3.5">Hybrid Match Score</th>
                    <th className="px-4 py-3.5">Skills Overlap</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {candidates.map((c) => (
                    <tr key={c.student_id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3.5">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          c.rank === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : (c.rank <= 3 ? 'bg-slate-800 text-brand-400' : 'text-slate-500')
                        }`}>
                          #{c.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          {c.student_name}
                          {c.rank === 1 && <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">Top Match</span>}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{c.roll_number}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-200">{c.department} • {c.cgpa.toFixed(2)}</div>
                        <div className={`text-[10px] ${c.is_eligible ? 'text-emerald-400' : 'text-rose-400 font-bold'}`}>
                          {c.is_eligible ? 'Eligible' : 'Ineligible'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${c.match_score >= 85 ? 'bg-emerald-500' : (c.match_score >= 70 ? 'bg-brand-500' : 'bg-slate-600')}`}
                              style={{ width: `${c.match_score}%` }}
                            />
                          </div>
                          <span className={`font-black text-sm ${c.match_score >= 85 ? 'text-emerald-400' : (c.match_score >= 70 ? 'text-brand-400' : 'text-slate-400')}`}>
                            {c.match_score}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-200">
                          {c.matched_skills_count} / {c.total_required_skills} matched
                        </span>
                        {c.missing_skills.length > 0 && (
                          <div className="text-[10px] text-rose-400/80 truncate max-w-xs">
                            Gap: {c.missing_skills.slice(0, 2).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          c.status === 'shortlisted'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : (c.status === 'rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-400')
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => openXAI(c.student_id)}
                          className="px-3 py-1 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 border border-brand-500/30 text-xs font-bold"
                        >
                          View AI Analysis
                        </button>
                        <button
                          onClick={() => handleShortlist(c.student_id)}
                          title="Shortlist"
                          className="p-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/30"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Explainable AI Modal */}
      <XAIModal
        analysis={selectedXAI}
        onClose={() => setSelectedXAI(null)}
        onShortlist={handleShortlist}
        onReject={handleReject}
      />

      {/* Configurable Weights Modal */}
      {showWeightsModal && (
        <WeightSliderModal
          weights={weights}
          onClose={() => setShowWeightsModal(false)}
          onSave={handleSaveWeights}
        />
      )}
    </div>
  );
};

import React from 'react';
import { XAIAnalysis } from '../../types';
import { X, CheckCircle2, XCircle, Sparkles, Building, Briefcase, Award, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';

interface XAIModalProps {
  analysis: XAIAnalysis | null;
  onClose: () => void;
  onShortlist: (studentId: number) => void;
  onReject: (studentId: number) => void;
}

export const XAIModal: React.FC<XAIModalProps> = ({ analysis, onClose, onShortlist, onReject }) => {
  if (!analysis) return null;

  const { breakdown } = analysis;

  const criteriaItems = [
    { label: 'Mandatory Eligibility', score: breakdown.eligibility_score, weight: '20%' },
    { label: 'Required Skills Match', score: breakdown.required_skills_score, weight: '30%' },
    { label: 'Preferred Skills Match', score: breakdown.preferred_skills_score, weight: '10%' },
    { label: 'Project Portfolio Overlap', score: breakdown.projects_score, weight: '10%' },
    { label: 'Industry Internship', score: breakdown.internships_score, weight: '5%' },
    { label: 'Academic CGPA Ratio', score: breakdown.cgpa_score, weight: '10%' },
    { label: 'Technical Experience', score: breakdown.experience_score, weight: '5%' },
    { label: 'Soft Skills & Leadership', score: breakdown.soft_skills_score, weight: '5%' },
    { label: 'Certifications Match', score: breakdown.certifications_score, weight: '5%' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{analysis.student_name}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  {analysis.department} | CGPA {analysis.cgpa}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluation for <strong className="text-brand-400">{analysis.job_title}</strong> at {analysis.company_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-black text-brand-400">{analysis.match_score}%</div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Hybrid Score</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top AI Recommendation Callout */}
          <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 text-xs">
            <div className="flex items-center gap-2 font-bold text-brand-300 mb-1">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>AI Placement Recommendation</span>
            </div>
            <p className="text-slate-200 leading-relaxed font-medium">
              {analysis.ai_recommendation}
            </p>
          </div>

          {/* Granular Factor Breakdown Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Granular Scoring Matrix (100% Configurable Total)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {criteriaItems.map((crit) => (
                <div key={crit.label} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">{crit.label}</span>
                    <span className="text-brand-400 font-bold">{crit.score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${crit.score >= 80 ? 'bg-emerald-500' : (crit.score >= 50 ? 'bg-brand-500' : 'bg-amber-500')}`}
                      style={{ width: `${Math.max(5, crit.score)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Weight: {crit.weight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Matched vs Missing Skills Evidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths / Matched */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2.5">
                <CheckCircle2 className="w-4 h-4" /> Matched Core Requirements & Strengths
              </h4>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {analysis.matched_required_skills.map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                    ✓ {s}
                  </span>
                ))}
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {analysis.strengths_rationale.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skill Gaps / Missing */}
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20">
              <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 mb-2.5">
                <XCircle className="w-4 h-4" /> Detected Skill Gaps & Weaknesses
              </h4>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {analysis.missing_required_skills.map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                    ✗ {s} (Missing)
                  </span>
                ))}
                {analysis.missing_preferred_skills.map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                    ? {s} (Preferred)
                  </span>
                ))}
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {analysis.skill_gaps_rationale.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 mt-0.5">•</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Explainable AI decision based on verified institutional database records.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onReject(analysis.student_id); onClose(); }}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-rose-900/30 hover:text-rose-400 text-slate-300 text-xs font-semibold transition"
            >
              Reject Candidate
            </button>
            <button
              onClick={() => { onShortlist(analysis.student_id); onClose(); }}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-brand-500/20 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Shortlist</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

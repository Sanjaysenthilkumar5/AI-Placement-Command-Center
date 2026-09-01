import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { api } from '../../services/api';
import { JobDrive, CandidateMatch } from '../../types';
import { Briefcase, Users, Plus, CheckCircle2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecruiterPortalPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobDrive[]>([]);
  const [candidates, setCandidates] = useState<CandidateMatch[]>([]);

  useEffect(() => {
    const fetchD = async () => {
      const jList = await api.getJobs();
      setJobs(jList);
      if (jList.length > 0) {
        const cList = await api.getCandidatesForJob(jList[0].id);
        setCandidates(cList.slice(0, 5));
      }
    };
    fetchD();
  }, []);

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-w-0">
        <Navbar title="Recruiter Talent Command Center" subtitle="TechNova Solutions Talent Acquisition Portal" />
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">Active Openings</span>
              <p className="text-2xl font-bold text-white mt-1">1 Drive</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">Matched Candidates</span>
              <p className="text-2xl font-bold text-brand-400 mt-1">52 Evaluated</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">Top Tier Shortlisted</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">6 Candidates</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white">Top AI-Ranked Candidates for Software Engineer</h3>
              <Link to="/matching" className="text-xs text-brand-400 hover:underline font-bold">Open Full Ranking Engine →</Link>
            </div>
            <div className="space-y-2">
              {candidates.map((c) => (
                <div key={c.student_id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-100">#{c.rank} {c.student_name} ({c.department}, CGPA {c.cgpa})</p>
                    <p className="text-slate-400 text-[11px]">{c.ai_summary}</p>
                  </div>
                  <span className="font-black text-brand-400 text-sm">{c.match_score}% Match</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

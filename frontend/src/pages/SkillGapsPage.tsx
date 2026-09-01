import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { api } from '../services/api';
import { CohortSkillDemand } from '../types';
import { AlertTriangle, TrendingUp, Users, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SkillGapsPage: React.FC = () => {
  const [demands, setDemands] = useState<CohortSkillDemand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGaps = async () => {
      try {
        const list = await api.getCohortDemand();
        setDemands(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchGaps();
  }, []);

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-w-0">
        <Navbar title="Cohort Skill-Gap Analysis" subtitle="Identify campus-wide curriculum deficits against live employer job descriptions" />
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-1">Campus Skill Supply vs Employer Demand Matrix</h3>
            <p className="text-xs text-slate-400">Aggregated across all registered hiring JDs and active student skill profiles.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demands.map((item) => (
              <div key={item.skill} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 shadow-lg">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white">{item.skill}</h4>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded font-bold ${
                      item.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : (item.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400')
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Appears in <strong className="text-brand-400">{item.demand_pct}%</strong> of all verified job descriptions.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400">Unmet Candidate Gap:</span>
                    <span className="font-bold text-rose-400">{item.unmet_student_count} Students</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, item.unmet_student_count * 2)}%` }} />
                  </div>
                </div>

                <Link
                  to="/training"
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center transition flex items-center justify-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-brand-400" />
                  <span>Launch Training Bootcamp</span>
                </Link>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { StatCard } from '../components/common/StatCard';
import { api } from '../services/api';
import { AnalyticsDashboard } from '../types';
import { Users, Briefcase, Trophy, TrendingUp, Sparkles, GraduationCap, ArrowRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.getAnalytics();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex bg-slate-950 min-h-screen">
        <Sidebar />
        <div className="ml-64 flex-1 p-8 text-center text-slate-400">Loading placement command center...</div>
      </div>
    );
  }

  const { kpis, placement_trend, dept_distribution, skill_demand, training_priority } = data;

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-w-0">
        <Navbar title="Placement Operations Dashboard" subtitle="Real-time campus placement metrics and AI intelligence" />
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Registered Students" value={kpis.total_students} subtitle={`${kpis.eligible_students} eligible for active drives`} icon={Users} color="brand" />
            <StatCard title="Students Placed" value={kpis.students_placed} subtitle={`${kpis.placement_percentage}% conversion rate`} icon={Trophy} trend="+12% YoY" trendPositive={true} color="emerald" />
            <StatCard title="Active Placement Drives" value={kpis.active_drives} subtitle={`${kpis.active_companies} hiring companies`} icon={Briefcase} color="purple" />
            <StatCard title="Average Package (CTC)" value={`₹${kpis.average_package_lpa} LPA`} subtitle={`Highest: ₹${kpis.highest_package_lpa} LPA`} icon={TrendingUp} color="amber" />
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-900/50 via-slate-900 to-indigo-900/50 border border-brand-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Active Featured Drive: TechNova Solutions (Software Engineer)</h3>
                <p className="text-xs text-slate-300">52 students evaluated • 6 Top Tier candidates matched with 85%+ score</p>
              </div>
            </div>
            <Link to="/matching" className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition flex items-center gap-2">
              <span>View AI Candidate Rankings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Placement Velocity Trend</h3>
                <span className="text-xs text-slate-400 font-medium">Monthly Offers</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={placement_trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="placed_count" name="Students Placed" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="drives_count" name="Active Drives" stroke="#a855f7" strokeWidth={2} strokeDasharray="4 4" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Department-Wise Placement %</h3>
                <span className="text-xs text-slate-400 font-medium">By Faculty Branch</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dept_distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="department" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="placement_pct" name="Placed %" fill="#10b981" radius={[4, 4, 0, 0]}>
                      {dept_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#38bdf8', '#818cf8', '#34d399', '#f59e0b', '#ec4899'][index % 5]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Industry Skill Demand (Active JDs)</h3>
                <span className="text-xs text-brand-400 font-semibold">Demand %</span>
              </div>
              <div className="space-y-3">
                {skill_demand.map((item) => (
                  <div key={item.skill} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-200">{item.skill}</span>
                      <span className="text-brand-400">{item.demand_pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${item.demand_pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-brand-400" />
                  <h3 className="text-sm font-bold text-white">AI Training Priority Recommendations</h3>
                </div>
                <Link to="/training" className="text-xs text-brand-400 hover:underline font-semibold">Manage all</Link>
              </div>
              <div className="space-y-2.5 flex-1">
                {training_priority.map((p) => (
                  <div key={p.skill} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">{p.skill}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${p.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                          {p.priority} PRIORITY
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{p.unmet_student_count} students missing this core skill</p>
                    </div>
                    <Link to="/training" className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium">Schedule</Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

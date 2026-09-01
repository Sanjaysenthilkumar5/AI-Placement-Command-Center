import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { api } from '../services/api';
import { AnalyticsDashboard } from '../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsDashboard | null>(null);

  useEffect(() => {
    const fetchA = async () => {
      try {
        const res = await api.getAnalytics();
        setData(res);
      } catch (e) {
        console.error(e);
      }
    };
    fetchA();
  }, []);

  if (!data) return null;

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-w-0">
        <Navbar title="Comprehensive Placement Analytics" subtitle="Visual data reports on conversion velocity, branch distributions, and skill demand" />
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-4">Placement Conversion Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.placement_trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="placed_count" stroke="#0ea5e9" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-4">Department Placement Ratios</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.dept_distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="department" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                    <Bar dataKey="placement_pct" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

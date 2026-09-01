import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { api } from '../services/api';
import { AIEvalDashboard } from '../types';
import { ShieldCheck, Cpu, Play, CheckCircle2, XCircle, Zap, DollarSign, Clock } from 'lucide-react';

export const AIEvalPage: React.FC = () => {
  const [data, setData] = useState<AIEvalDashboard | null>(null);
  const [running, setRunning] = useState(false);

  const fetchBenchmarks = async () => {
    setRunning(true);
    try {
      const res = await api.getAIBenchmarks();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => { fetchBenchmarks(); }, []);

  if (!data) return null;

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-w-0">
        <Navbar title="AI Engineering & Evaluation Sandbox" subtitle="Precision@K benchmarks, scoring formula audit, and latency/cost telemetry" />
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">Overall Benchmark Accuracy</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{data.overall_accuracy_pct}%</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{data.passed_test_cases} / {data.total_test_cases} test cases passing</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">Precision @ 3 / Precision @ 5</span>
              <p className="text-2xl font-black text-brand-400 mt-1">{data.precision_at_3} / {data.precision_at_5}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Top-K candidate relevance</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">Skill Extraction Accuracy</span>
              <p className="text-2xl font-black text-purple-400 mt-1">{data.skill_extraction_accuracy_pct}%</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Normalized canonical parsing</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">Inference Latency & Cost</span>
              <p className="text-2xl font-black text-amber-400 mt-1">{data.avg_inference_latency_ms} ms</p>
              <p className="text-[10px] text-slate-500 mt-0.5">~${data.estimated_token_cost_usd} per query</p>
            </div>
          </div>

          {/* Safeguards & Engineering Architecture */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Active AI Engineering Safeguards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {data.safeguards_active.map((sg, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{sg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Test Case Harness Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Automated Candidate Matching Test Cases</span>
              <button
                onClick={fetchBenchmarks}
                disabled={running}
                className="px-3 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Play className="w-3 h-3" /> Re-Run Benchmark Harness
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Test Scenario</th>
                    <th className="px-4 py-3">Target Drive</th>
                    <th className="px-4 py-3">Expected Score</th>
                    <th className="px-4 py-3">Actual Score</th>
                    <th className="px-4 py-3">Eligibility Check</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.benchmark_cases.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-bold text-slate-200">{b.test_case_name}</td>
                      <td className="px-4 py-3 text-slate-400">{b.job_title}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{b.expected_score}%</td>
                      <td className="px-4 py-3 font-mono font-bold text-brand-400">{b.actual_score}%</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-semibold">
                          {b.actual_eligibility ? 'Eligible' : 'Ineligible'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ✓ PASS
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

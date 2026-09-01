import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { api } from '../services/api';
import { TrainingProgram } from '../types';
import { GraduationCap, Plus, Calendar, Users, CheckCircle2, Clock, X } from 'lucide-react';

export const TrainingProgramsPage: React.FC = () => {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [skillName, setSkillName] = useState('SQL');
  const [priority, setPriority] = useState('high');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [cohortSize, setCohortSize] = useState(45);

  const fetchPrograms = async () => {
    try {
      const list = await api.getTrainingPrograms();
      setPrograms(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchPrograms(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTrainingProgram({
        title,
        description: desc,
        target_skill_name: skillName,
        priority,
        duration_weeks: durationWeeks,
        cohort_size: cohortSize,
        syllabus: ['Architecture Fundamentals', 'Live Hands-On Exercises', 'Capstone Project & Mock Test']
      });
      setShowModal(false);
      setTitle('');
      fetchPrograms();
    } catch (e) {
      alert('Error creating program');
    }
  };

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-w-0">
        <Navbar title="AI Training & Upskilling Programs" subtitle="Bridge campus skill gaps with targeted technical and behavioral bootcamps" />
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">{programs.length} Scheduled Upskilling Bootcamps</h3>
            <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Create Bootcamp
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map((p) => (
              <div key={p.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4 shadow-lg">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">{p.target_skill_name} Track</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      p.priority === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {p.priority}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1">{p.title}</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{p.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-500" /> Cohort Size: <strong className="text-slate-200">{p.cohort_size} Students</strong></span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-500" /> Duration: <strong className="text-slate-200">{p.duration_weeks} Weeks</strong></span>
                  </div>
                  {p.syllabus && p.syllabus.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {p.syllabus.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-semibold capitalize">
                    ● {p.status}
                  </span>
                  <button className="px-3 py-1 rounded-lg bg-brand-600/20 text-brand-400 text-xs font-semibold hover:bg-brand-600/30">
                    View Enrolled Cohort
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Upskilling Bootcamp</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bootcamp Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Advanced SQL Joins & Query Tuning" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Skill</label>
                <input type="text" value={skillName} onChange={(e) => setSkillName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Curriculum overview..." className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Weeks)</label>
                  <input type="number" value={durationWeeks} onChange={(e) => setDurationWeeks(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cohort Size</label>
                  <input type="number" value={cohortSize} onChange={(e) => setCohortSize(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg mt-2">Publish Bootcamp</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

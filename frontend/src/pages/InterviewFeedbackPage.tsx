import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { api } from '../services/api';
import { InterviewFeedback, Student } from '../types';
import { MessageSquareText, Plus, Star, X } from 'lucide-react';

export const InterviewFeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<InterviewFeedback[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  const [studentId, setStudentId] = useState<number>(1);
  const [roundName, setRoundName] = useState('Technical Round 1');
  const [techScore, setTechScore] = useState(8.5);
  const [commScore, setCommScore] = useState(8.0);
  const [aptScore, setAptScore] = useState(8.0);
  const [probScore, setProbScore] = useState(9.0);
  const [confScore, setConfScore] = useState(8.5);
  const [techFeedback, setTechFeedback] = useState('Strong in Java OOP, database normalization, and REST API conventions.');
  const [hrFeedback, setHrFeedback] = useState('Articulate, confident, and polite.');
  const [verdict, setVerdict] = useState('selected');

  const fetchData = async () => {
    try {
      const [fList, sList] = await Promise.all([api.getInterviewFeedbacks(), api.getStudents()]);
      setFeedbacks(fList);
      setStudents(sList);
      if (sList.length > 0) setStudentId(sList[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.recordInterviewFeedback({
        student_id: studentId,
        round_name: roundName,
        technical_score: techScore,
        communication_score: commScore,
        aptitude_score: aptScore,
        problem_solving_score: probScore,
        confidence_score: confScore,
        technical_feedback: techFeedback,
        hr_feedback: hrFeedback,
        final_verdict: verdict
      });
      setShowModal(false);
      fetchData();
    } catch (e) {
      alert('Error recording feedback');
    }
  };

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-w-0">
        <Navbar title="Interview Feedback & Candidate Evaluation" subtitle="Log multi-factor evaluation scores to refine student readiness predictions" />
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">{feedbacks.length} Recorded Interview Logs</h3>
            <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Record Evaluation
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4 shadow-lg">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-white">{fb.student_name}</h4>
                      <span className="text-[11px] text-brand-400 font-semibold">{fb.round_name}</span>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded font-bold uppercase ${
                      fb.final_verdict === 'selected' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {fb.final_verdict}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 my-3 p-2 bg-slate-950 rounded-xl border border-slate-800/80 text-center">
                    <div><p className="text-[10px] text-slate-500">Tech</p><p className="text-xs font-bold text-brand-400">{fb.technical_score}</p></div>
                    <div><p className="text-[10px] text-slate-500">Comm</p><p className="text-xs font-bold text-emerald-400">{fb.communication_score}</p></div>
                    <div><p className="text-[10px] text-slate-500">Apt</p><p className="text-xs font-bold text-amber-400">{fb.aptitude_score}</p></div>
                    <div><p className="text-[10px] text-slate-500">Problem</p><p className="text-xs font-bold text-purple-400">{fb.problem_solving_score}</p></div>
                    <div><p className="text-[10px] text-slate-500">Avg</p><p className="text-xs font-black text-white">{fb.average_score}</p></div>
                  </div>

                  {fb.technical_feedback && (
                    <p className="text-xs text-slate-300 mt-2"><strong className="text-slate-400">Tech:</strong> {fb.technical_feedback}</p>
                  )}
                  {fb.hr_feedback && (
                    <p className="text-xs text-slate-400 mt-1"><strong className="text-slate-500">HR:</strong> {fb.hr_feedback}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Record Interview Feedback</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleRecord} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Student</label>
                <select value={studentId} onChange={(e) => setStudentId(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100">
                  {students.map((s) => (<option key={s.id} value={s.id}>{s.full_name} ({s.roll_number})</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Technical (1-10)</label>
                  <input type="number" step="0.5" min="1" max="10" value={techScore} onChange={(e) => setTechScore(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Communication (1-10)</label>
                  <input type="number" step="0.5" min="1" max="10" value={commScore} onChange={(e) => setCommScore(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Problem Solving (1-10)</label>
                  <input type="number" step="0.5" min="1" max="10" value={probScore} onChange={(e) => setProbScore(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Verdict</label>
                  <select value={verdict} onChange={(e) => setVerdict(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100">
                    <option value="selected">Selected</option>
                    <option value="on_hold">On Hold</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Technical Notes</label>
                <textarea rows={2} value={techFeedback} onChange={(e) => setTechFeedback(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg mt-2">Save Evaluation</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

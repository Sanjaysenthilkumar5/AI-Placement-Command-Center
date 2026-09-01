import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { api } from '../services/api';
import { Student, StudentDetail } from '../types';
import { Search, Upload, X, Sparkles } from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadModalStudentId, setUploadModalStudentId] = useState<number | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.getStudents({
        department: deptFilter,
        placement_status: statusFilter,
        search: search.trim() || undefined
      });
      setStudents(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [deptFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const openStudentDetail = async (id: number) => {
    try {
      const detail = await api.getStudentById(id);
      setSelectedStudent(detail);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResumeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadModalStudentId) return;
    setUploading(true);
    try {
      await api.uploadResume(uploadModalStudentId, uploadFile);
      alert('Resume parsed & skills normalized successfully!');
      setUploadModalStudentId(null);
      setUploadFile(null);
      fetchStudents();
    } catch (e) {
      alert('Resume parsing error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-w-0">
        <Navbar title="Student Directory & Profiles" subtitle="Comprehensive talent pool, verified skills, and resume intelligence" />
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search student name, roll number, or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500" />
            </form>
            <div className="flex items-center gap-3">
              <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200">
                <option value="All">All Departments</option>
                <option value="CSE">CSE</option><option value="IT">IT</option><option value="ECE">ECE</option><option value="EEE">EEE</option><option value="MECH">MECH</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200">
                <option value="All">All Statuses</option>
                <option value="unplaced">Unplaced</option><option value="shortlisted">Shortlisted</option><option value="placed">Placed</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">Roll No & Name</th>
                    <th className="px-4 py-3.5">Department</th>
                    <th className="px-4 py-3.5">CGPA / Backlogs</th>
                    <th className="px-4 py-3.5">Skills (Normalized)</th>
                    <th className="px-4 py-3.5">AI Readiness</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-100">{st.full_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{st.roll_number}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">{st.department}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-200">{st.cgpa.toFixed(2)}</div>
                        <div className={`text-[11px] ${st.active_backlogs > 0 ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>{st.active_backlogs} Backlogs</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {st.skills.slice(0, 3).map((sk) => (
                            <span key={sk} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium">{sk}</span>
                          ))}
                          {st.skills.length > 3 && <span className="text-[10px] text-slate-500 font-semibold">+{st.skills.length - 3}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${st.placement_readiness_score}%` }} />
                          </div>
                          <span className="font-bold text-brand-400">{st.placement_readiness_score}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${st.placement_status === 'placed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : (st.placement_status === 'shortlisted' ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'bg-slate-800 text-slate-400')}`}>
                          {st.placement_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button onClick={() => setUploadModalStudentId(st.id)} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium">
                          <Upload className="w-3.5 h-3.5 inline mr-1" /> Resume
                        </button>
                        <button onClick={() => openStudentDetail(st.id)} className="px-3 py-1 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 border border-brand-500/30 text-xs font-semibold">
                          Profile
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

      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedStudent.full_name}</h3>
                <p className="text-xs text-slate-400">{selectedStudent.roll_number} • {selectedStudent.department} (Batch {selectedStudent.batch_year})</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            {selectedStudent.ai_profile_summary && (
              <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs">
                <div className="font-bold text-brand-300 flex items-center gap-1.5 mb-1"><Sparkles className="w-3.5 h-3.5 text-brand-400" /> AI Profile Assessment</div>
                <p className="text-slate-200">{selectedStudent.ai_profile_summary}</p>
              </div>
            )}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Verified Skill Inventory</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedStudent.detailed_skills.map((sk) => (
                  <span key={sk.id} className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 font-medium">
                    {sk.skill_name} <span className="text-slate-500 text-[10px]">({sk.proficiency_level})</span>
                  </span>
                ))}
              </div>
            </div>
            {selectedStudent.projects.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Academic & Practical Projects</h4>
                <div className="space-y-2">
                  {selectedStudent.projects.map((p) => (
                    <div key={p.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                      <p className="font-bold text-slate-100">{p.title}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {uploadModalStudentId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Upload Resume for AI Intelligence</h3>
            <p className="text-xs text-slate-400 mb-4">Accepts PDF, DOCX or TXT. AI automatically extracts skills, CGPA, and projects.</p>
            <form onSubmit={handleResumeUpload} className="space-y-4">
              <input type="file" accept=".pdf,.docx,.doc,.txt" required onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)} className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-500 cursor-pointer" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setUploadModalStudentId(null)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300">Cancel</button>
                <button type="submit" disabled={uploading} className="px-4 py-1.5 rounded-lg bg-brand-600 text-xs font-bold text-white shadow-lg">{uploading ? 'Extracting...' : 'Parse & Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { api } from '../services/api';
import { Student, StudentDetail } from '../types';
import { useAuth } from '../context/AuthContext';
import { Search, Upload, X, Sparkles, UserPlus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const { role } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Resume upload modal
  const [uploadModalStudentId, setUploadModalStudentId] = useState<number | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Add Student modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    roll_number: '',
    department: 'CSE',
    batch_year: 2026,
    cgpa: 8.0,
    active_backlogs: 0,
    phone: '',
    skills_text: 'Python, React, SQL',
    password: 'password123'
  });

  // Action messages
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      setActionMessage({ type: 'success', text: 'Resume parsed & candidate profile upgraded by AI!' });
      setUploadModalStudentId(null);
      setUploadFile(null);
      fetchStudents();
    } catch (e) {
      setActionMessage({ type: 'error', text: 'Resume parsing error. Please try another document format.' });
    } finally {
      setUploading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    setAddLoading(true);

    try {
      const skillsArray = formData.skills_text
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      await api.createStudent({
        full_name: formData.full_name,
        email: formData.email,
        roll_number: formData.roll_number,
        department: formData.department,
        batch_year: Number(formData.batch_year),
        cgpa: Number(formData.cgpa),
        active_backlogs: Number(formData.active_backlogs),
        phone: formData.phone || undefined,
        skills: skillsArray,
        password: formData.password || 'password123'
      });

      setAddSuccess(`Student ${formData.full_name} enrolled successfully!`);
      setTimeout(() => {
        setShowAddModal(false);
        setAddSuccess('');
        setFormData({
          full_name: '',
          email: '',
          roll_number: '',
          department: 'CSE',
          batch_year: 2026,
          cgpa: 8.0,
          active_backlogs: 0,
          phone: '',
          skills_text: 'Python, React, SQL',
          password: 'password123'
        });
      }, 1200);

      fetchStudents();
    } catch (err: any) {
      setAddError(err.response?.data?.detail || 'Failed to add student. Please check input values.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteStudent = async (id: number, name: string, roll: string) => {
    if (!window.confirm(`Are you sure you want to permanently remove ${name} (${roll}) from the placement database? This will remove all associated matches and applications.`)) {
      return;
    }

    try {
      await api.deleteStudent(id);
      setActionMessage({ type: 'success', text: `Candidate ${name} removed successfully.` });
      fetchStudents();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to remove student.' });
    }
  };

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-w-0">
        <Navbar title="Student Directory & Profiles" subtitle="Comprehensive talent pool, verified skills, and resume intelligence" />
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* Action Notification Banner */}
          {actionMessage && (
            <div className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
              actionMessage.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              <div className="flex items-center gap-2">
                {actionMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span className="font-semibold">{actionMessage.text}</span>
              </div>
              <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Search, Filter & Add Header */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search student name, roll number, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
              />
            </form>
            <div className="flex items-center gap-3">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="All">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="All">All Statuses</option>
                <option value="unplaced">Unplaced</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="placed">Placed</option>
              </select>

              {/* Admin Add Student Button */}
              {role === 'admin' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 flex items-center gap-1.5 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add Student</span>
                </button>
              )}
            </div>
          </div>

          {/* Student Table */}
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
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        Loading student records...
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        No students match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    students.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-100">{st.full_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                            <span>{st.roll_number}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-400">{st.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                            {st.department}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-200">{st.cgpa.toFixed(2)}</div>
                          <div className={`text-[11px] ${st.active_backlogs > 0 ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
                            {st.active_backlogs} Backlogs
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {st.skills.slice(0, 3).map((sk) => (
                              <span key={sk} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium">
                                {sk}
                              </span>
                            ))}
                            {st.skills.length > 3 && (
                              <span className="text-[10px] text-slate-500 font-semibold">+{st.skills.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(0, st.placement_readiness_score))}%` }}
                              />
                            </div>
                            <span className="font-bold text-brand-400">{st.placement_readiness_score}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            st.placement_status === 'placed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : (st.placement_status === 'shortlisted' ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'bg-slate-800 text-slate-400')
                          }`}>
                            {st.placement_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setUploadModalStudentId(st.id)}
                            title="Upload Resume for AI Parser"
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                          >
                            <Upload className="w-3.5 h-3.5 inline mr-1" /> Resume
                          </button>
                          <button
                            onClick={() => openStudentDetail(st.id)}
                            title="View Full Candidate Profile"
                            className="px-2.5 py-1 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 border border-brand-500/30 text-xs font-semibold transition"
                          >
                            Profile
                          </button>
                          {role === 'admin' && (
                            <button
                              onClick={() => handleDeleteStudent(st.id, st.full_name, st.roll_number)}
                              title="Delete Student from Placement Database"
                              className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition inline-flex items-center justify-center align-middle"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Enroll New Student Candidate</h3>
                  <p className="text-xs text-slate-400">Add student to placement registry with skills & scores</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            {addSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{addSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddStudent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Patel"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 22CS108"
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ananya@student.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">CGPA (0 - 10)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Active Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    required
                    value={formData.active_backlogs}
                    onChange={(e) => setFormData({ ...formData, active_backlogs: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Skills (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Python, FastApi, PostgreSQL, Docker, PyTorch, React"
                  value={formData.skills_text}
                  onChange={(e) => setFormData({ ...formData, skills_text: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">AI automatically standardizes and maps canonical skill aliases.</p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Student Portal Password</label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Default is 'password123' so candidate can log into student portal.</p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-brand-500/20 disabled:opacity-50 transition flex items-center gap-1.5"
                >
                  {addLoading ? 'Saving...' : 'Enroll Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-500/20">
                  {selectedStudent.full_name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{selectedStudent.full_name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedStudent.roll_number} • {selectedStudent.department} (Batch {selectedStudent.batch_year})</p>
                  <p className="text-xs text-slate-500">{selectedStudent.email} {selectedStudent.phone ? `• ${selectedStudent.phone}` : ''}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Academic Snapshot */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400">CGPA</p>
                <p className="text-lg font-black text-slate-100 mt-0.5">{selectedStudent.cgpa.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400">Backlogs</p>
                <p className={`text-lg font-black mt-0.5 ${selectedStudent.active_backlogs > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedStudent.active_backlogs}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400">Readiness Score</p>
                <p className="text-lg font-black text-brand-400 mt-0.5">{selectedStudent.placement_readiness_score}%</p>
              </div>
            </div>

            {selectedStudent.ai_profile_summary && (
              <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs space-y-1.5">
                <div className="font-bold text-brand-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" /> AI Placement & Profile Evaluation
                </div>
                <p className="text-slate-200 leading-relaxed">{selectedStudent.ai_profile_summary}</p>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Verified Skill Inventory</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedStudent.detailed_skills.map((sk) => (
                  <span key={sk.id} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-medium flex items-center gap-1.5">
                    <span>{sk.skill_name}</span>
                    <span className="text-slate-500 text-[10px]">({sk.proficiency_level})</span>
                  </span>
                ))}
              </div>
            </div>

            {selectedStudent.projects.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Projects & Portfolio</h4>
                <div className="space-y-2">
                  {selectedStudent.projects.map((p) => (
                    <div key={p.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <p className="font-bold text-slate-100">{p.title}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">{p.description}</p>
                      {p.tech_stack && p.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.tech_stack.map((t, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resume Upload Modal */}
      {uploadModalStudentId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Upload Resume for AI Intelligence</h3>
            <p className="text-xs text-slate-400 mb-4">Accepts PDF, DOCX or TXT. AI automatically extracts skills, CGPA, and projects.</p>
            <form onSubmit={handleResumeUpload} className="space-y-4">
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                required
                onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-500 cursor-pointer"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalStudentId(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-1.5 rounded-lg bg-brand-600 text-xs font-bold text-white shadow-lg shadow-brand-500/20 disabled:opacity-50 transition"
                >
                  {uploading ? 'Extracting...' : 'Parse & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

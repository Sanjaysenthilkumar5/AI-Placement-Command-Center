import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [cgpa, setCgpa] = useState('8.0');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.register({ email, password, full_name: fullName, role: 'student', department, cgpa: parseFloat(cgpa) || 7.5 });
      await demoLogin('student');
      navigate('/student/portal');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-white tracking-tight">Create Student Account</h2>
          <p className="text-xs text-slate-400 mt-1">Register for AI Placement Candidate Matching</p>
        </div>
        {error && <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">{error}</div>}
        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Rahul Sharma" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">College Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="rahul@student.edu" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100">
                <option value="CSE">CSE</option><option value="IT">IT</option><option value="ECE">ECE</option><option value="EEE">EEE</option><option value="MECH">MECH</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">CGPA</label>
              <input type="number" step="0.01" min="0" max="10" value={cgpa} onChange={(e) => setCgpa(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition mt-4">
            {loading ? 'Creating...' : 'Register Profile'}
          </button>
        </form>
        <p className="text-xs text-center text-slate-500 mt-6">
          Already have an account? <Link to="/login" className="text-brand-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

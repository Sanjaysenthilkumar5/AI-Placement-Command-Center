import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, Mail, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@placement.edu');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: string) => {
    setLoading(true);
    try {
      await demoLogin(role);
      navigate(role === 'student' ? '/student/portal' : (role === 'recruiter' ? '/recruiter/portal' : '/dashboard'));
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Placement Command Center</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to access AI-powered placement intelligence</p>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition flex items-center justify-center gap-2">
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-[11px] text-center text-slate-400 font-semibold uppercase tracking-wider mb-3">Instant One-Click Demo Access</p>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => handleDemo('admin')} className="py-2 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-amber-400 transition">Officer (Admin)</button>
            <button type="button" onClick={() => handleDemo('student')} className="py-2 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-emerald-400 transition">Rahul (Student)</button>
            <button type="button" onClick={() => handleDemo('recruiter')} className="py-2 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-purple-400 transition">Recruiter</button>
          </div>
        </div>

        <p className="text-xs text-center text-slate-500 mt-6">
          Don't have an account? <Link to="/register" className="text-brand-400 hover:underline">Register student</Link>
        </p>
      </div>
    </div>
  );
};

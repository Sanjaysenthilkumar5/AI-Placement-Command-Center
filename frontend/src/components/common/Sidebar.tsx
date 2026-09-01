import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Building2, Briefcase, Sparkles, AlertTriangle,
  GraduationCap, MessageSquareText, Trophy, BarChart3, FileText,
  Bot, ShieldCheck, Bell, History, ArrowLeftRight, LogOut, CheckCircle2
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { role, user, demoLogin, logout } = useAuth();

  const adminNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Companies', path: '/companies', icon: Building2 },
    { name: 'Placement Drives', path: '/drives', icon: Briefcase },
    { name: 'Candidate Matching', path: '/matching', icon: Sparkles, highlight: true },
    { name: 'Skill Gaps', path: '/skill-gaps', icon: AlertTriangle },
    { name: 'Training Programs', path: '/training', icon: GraduationCap },
    { name: 'Interview Feedback', path: '/interview-feedback', icon: MessageSquareText },
    { name: 'Placements', path: '/placements', icon: Trophy },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'RAG Documents', path: '/documents', icon: FileText },
    { name: 'AI Copilot', path: '/ai-copilot', icon: Bot, highlight: true },
    { name: 'AI Engineering', path: '/ai-eval', icon: ShieldCheck, badge: 'Sandbox' },
    { name: 'Audit Logs', path: '/audit-logs', icon: History }
  ];

  const studentNav = [
    { name: 'Student Portal', path: '/student/portal', icon: LayoutDashboard },
    { name: 'My Matches & Gaps', path: '/student/portal?tab=matches', icon: Sparkles },
    { name: '4-Week Prep Plan', path: '/student/portal?tab=prepplan', icon: GraduationCap },
    { name: 'My Applications', path: '/student/portal?tab=applications', icon: Briefcase },
    { name: 'Placement Policies', path: '/documents', icon: FileText },
    { name: 'AI Career Advisor', path: '/ai-copilot', icon: Bot }
  ];

  const recruiterNav = [
    { name: 'Recruiter Hub', path: '/recruiter/portal', icon: LayoutDashboard },
    { name: 'Job Openings', path: '/drives', icon: Briefcase },
    { name: 'Ranked Candidates', path: '/matching', icon: Sparkles },
    { name: 'Campus Analytics', path: '/analytics', icon: BarChart3 }
  ];

  const currentNav = role === 'student' ? studentNav : (role === 'recruiter' ? recruiterNav : adminNav);

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-tight">AI Placement</h1>
          <p className="text-[11px] text-brand-400 font-medium">Command Center</p>
        </div>
      </div>

      {/* Role Switcher Pills */}
      <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-950/40">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
          <ArrowLeftRight className="w-3 h-3 text-brand-400" /> Switch Persona
        </div>
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
          <button
            onClick={() => demoLogin('admin')}
            className={`text-xs py-1 rounded font-medium transition-all ${role === 'admin' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Admin
          </button>
          <button
            onClick={() => demoLogin('student')}
            className={`text-xs py-1 rounded font-medium transition-all ${role === 'student' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Student
          </button>
          <button
            onClick={() => demoLogin('recruiter')}
            className={`text-xs py-1 rounded font-medium transition-all ${role === 'recruiter' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Recruiter
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {currentNav.map((item: any) => {
          const isActive = location.pathname === item.path.split('?')[0];
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-brand-600/15 text-brand-400 border border-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                  {item.badge}
                </span>
              )}
              {item.highlight && !item.badge && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-brand-400 shrink-0">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="truncate">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.full_name || 'Placement User'}</p>
            <p className="text-[10px] text-slate-500 capitalize">{role || 'Admin'} Role</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Logout"
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

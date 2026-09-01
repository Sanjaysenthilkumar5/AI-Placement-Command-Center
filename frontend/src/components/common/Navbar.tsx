import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, Sparkles, Shield, User as UserIcon, Check, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';

export const Navbar: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const list = await api.getNotifications();
        setNotifications(list);
      } catch (e) {
        // quiet fallback
      }
    };
    fetchNotifs();
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/students?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20 flex items-center justify-between px-6">
      {/* Title */}
      <div>
        <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 font-normal">{subtitle}</p>}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students, skills, drives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-9 pr-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
          />
        </form>

        {/* AI Copilot Quick Launcher */}
        <Link
          to="/ai-copilot"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/30 text-xs font-semibold transition"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-brand-400" />
          <span>Ask AI</span>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-slate-900" />
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-3 overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="text-xs font-bold text-white">Notifications ({unreadCount})</span>
                <Link to="/notifications" className="text-[11px] text-brand-400 hover:underline">View all</Link>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No new notifications</p>
                ) : (
                  notifications.slice(0, 4).map((n) => (
                    <div key={n.id} className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 text-xs">
                      <p className="font-semibold text-slate-200">{n.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${
            role === 'admin'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : (role === 'student' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20')
          }`}>
            {role?.toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
};

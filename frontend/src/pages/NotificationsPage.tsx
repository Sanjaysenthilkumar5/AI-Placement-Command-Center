import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { api } from '../services/api';
import { NotificationItem } from '../types';
import { Bell, CheckCircle2 } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);

  useEffect(() => {
    api.getNotifications().then(setNotifs).catch(console.error);
  }, []);

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-w-0">
        <Navbar title="Placement Notifications" subtitle="Drive updates, interview invitations, and status alerts" />
        <main className="p-6 space-y-4 flex-1 overflow-y-auto">
          {notifs.map((n) => (
            <div key={n.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <Bell className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">{n.title}</h4>
                <p className="text-xs text-slate-300 mt-1">{n.message}</p>
                <span className="text-[10px] text-slate-500 mt-2 block">{new Date(n.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
};

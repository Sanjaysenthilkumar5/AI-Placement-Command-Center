import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { api } from '../services/api';
import { AuditLogItem } from '../types';
import { History } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);

  useEffect(() => {
    api.getAuditLogs().then(setLogs).catch(console.error);
  }, []);

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-w-0">
        <Navbar title="Audit Trail & Activity Logs" subtitle="Immutable log of admin actions, JD uploads, shortlists, and rankings" />
        <main className="p-6 space-y-4 flex-1 overflow-y-auto">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Action Description</th>
                  <th className="px-4 py-3">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono text-slate-400">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3 font-bold text-white">{l.user_name}</td>
                    <td className="px-4 py-3 text-brand-400 capitalize">{l.role}</td>
                    <td className="px-4 py-3 text-slate-200">{l.action}</td>
                    <td className="px-4 py-3 text-slate-400">{l.entity_type} #{l.entity_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

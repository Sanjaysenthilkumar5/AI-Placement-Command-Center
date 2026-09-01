import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { api } from '../services/api';
import { Trophy, Award, Building2, TrendingUp } from 'lucide-react';

export const PlacementsPage: React.FC = () => {
  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-w-0">
        <Navbar title="Placement Records & Offers" subtitle="Verified campus recruitment offers, salary distributions, and alumni data" />
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400 font-semibold">Confirmed Offers</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">15 Offers</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400 font-semibold">Average Package</p>
              <p className="text-2xl font-bold text-brand-400 mt-1">₹8.4 LPA</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400 font-semibold">Tier-1 Highest Offer</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">₹24.0 LPA</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-3">Recent Verified Offer Letters</h3>
            <div className="space-y-2">
              {[
                { name: 'Karthik Rao', dept: 'CSE', company: 'Google India', pkg: '24.0 LPA', date: 'Aug 2026' },
                { name: 'Nandini Verma', dept: 'CSE', company: 'Microsoft IDC', pkg: '18.0 LPA', date: 'Aug 2026' },
                { name: 'Simran Mehta', dept: 'CSE', company: 'Razorpay', pkg: '14.0 LPA', date: 'Aug 2026' },
                { name: 'Deepika Kulkarni', dept: 'CSE', company: 'Amazon Web Services', pkg: '12.0 LPA', date: 'Jul 2026' },
                { name: 'Aparna Saxena', dept: 'CSE', company: 'Zomato', pkg: '11.0 LPA', date: 'Jul 2026' }
              ].map((p, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-100">{p.name} ({p.dept})</p>
                      <p className="text-slate-400 text-[11px]">{p.company} • {p.date}</p>
                    </div>
                  </div>
                  <span className="font-black text-brand-400 text-sm">₹{p.pkg}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { api } from '../services/api';
import { Company } from '../types';
import { useAuth } from '../context/AuthContext';
import { Building2, Plus, ExternalLink, Mail, Phone, MapPin, X, Trash2, Shield } from 'lucide-react';

export const CompaniesPage: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [companies, setCompanies] = useState<Company[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('Software & IT');
  const [location, setLocation] = useState('Bengaluru');
  const [website, setWebsite] = useState('');
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');

  const fetchCompanies = async () => {
    try {
      const res = await api.getCompanies();
      setCompanies(res);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCompany({ name, industry, location, website, recruiter_name: recruiterName, recruiter_email: recruiterEmail });
      setShowModal(false);
      setName('');
      fetchCompanies();
    } catch (e) {
      alert('Error creating company');
    }
  };

  const handleDeleteCompany = async (companyId: number, companyName: string) => {
    if (!window.confirm(`Are you sure you want to remove '${companyName}' and all associated placement drives? This action cannot be undone.`)) {
      return;
    }
    setDeletingId(companyId);
    try {
      await api.deleteCompany(companyId);
      await fetchCompanies();
    } catch (e) {
      alert('Failed to delete company');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-w-0">
        <Navbar title="Recruiting Partner Companies" subtitle="Manage corporate partnerships, recruiters, and placement drives" />
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white">{companies.length} Corporate Partners Registered</h3>
              {isAdmin ? (
                <p className="text-xs text-brand-400 font-medium">Placement Director / Admin Access Active (Create & Remove enabled)</p>
              ) : (
                <p className="text-xs text-slate-500 font-medium">Viewing directory as {role}</p>
              )}
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" /> Add Company Partner
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((c) => (
              <div key={c.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4 shadow-lg relative group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <img src={c.logo_url} alt={c.name} className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 p-1 object-cover" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{c.name}</h4>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-brand-400 font-semibold">{c.industry}</span>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-500" /> {c.location || 'Pan India'}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteCompany(c.id, c.name)}
                      disabled={deletingId === c.id}
                      title="Remove Company Partner"
                      className="p-1.5 rounded-lg bg-slate-950 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/30 transition opacity-80 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center">
                  <div>
                    <p className="text-xs font-bold text-white">{c.total_drives}</p>
                    <p className="text-[10px] text-slate-500">Drives</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-400">{c.total_hired}</p>
                    <p className="text-[10px] text-slate-500">Hired</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-400">₹{c.avg_package_lpa}L</p>
                    <p className="text-[10px] text-slate-500">Avg CTC</p>
                  </div>
                </div>

                {c.recruiter_name && (
                  <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
                    <span>Recruiter: <strong className="text-slate-200">{c.recruiter_name}</strong></span>
                    {c.website && <a href={c.website} target="_blank" rel="noreferrer" className="text-brand-400 hover:underline flex items-center gap-0.5"><ExternalLink className="w-3 h-3" /></a>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Corporate Partner</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Oracle Financial Services" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-brand-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Industry</label>
                  <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Website</label>
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Recruiter Name</label>
                  <input type="text" value={recruiterName} onChange={(e) => setRecruiterName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Recruiter Email</label>
                  <input type="email" value={recruiterEmail} onChange={(e) => setRecruiterEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg mt-2 transition">Save Partner Company</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

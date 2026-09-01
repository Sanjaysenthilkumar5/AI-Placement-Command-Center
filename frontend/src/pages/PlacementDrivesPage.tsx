import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { api } from '../services/api';
import { JobDrive, Company } from '../types';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Plus, Sparkles, Upload, Calendar, MapPin, X, ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PlacementDrivesPage: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [jobs, setJobs] = useState<JobDrive[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [parsingJD, setParsingJD] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const [companyId, setCompanyId] = useState<number>(1);
  const [title, setTitle] = useState('Backend Software Engineer');
  const [salaryLpa, setSalaryLpa] = useState('8.5');
  const [minCgpa, setMinCgpa] = useState('7.0');
  const [maxBacklogs, setMaxBacklogs] = useState('0');
  const [reqSkills, setReqSkills] = useState('Java, Spring Boot, SQL, REST API');
  const [prefSkills, setPrefSkills] = useState('AWS, Docker');
  const [description, setDescription] = useState('Design, develop, and maintain high-throughput backend microservices.');

  const fetchData = async () => {
    try {
      const [jList, cList] = await Promise.all([api.getJobs(), api.getCompanies()]);
      setJobs(jList);
      setCompanies(cList);
      if (cList.length > 0) setCompanyId(cList[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleJDFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setParsingJD(true);
    try {
      const structured = await api.parseJD(e.target.files[0]);
      setTitle(structured.job_title || title);
      setSalaryLpa(String(structured.salary_lpa || salaryLpa));
      setMinCgpa(String(structured.min_cgpa || minCgpa));
      setMaxBacklogs(String(structured.max_backlogs || 0));
      setReqSkills(structured.required_skills?.join(', ') || reqSkills);
      setPrefSkills(structured.preferred_skills?.join(', ') || prefSkills);
      setDescription(structured.summary || description);
      alert('JD parsed automatically with AI!');
    } catch (e) {
      alert('Error parsing JD');
    } finally {
      setParsingJD(false);
    }
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createJob({
        company_id: companyId,
        title,
        description,
        salary_lpa: parseFloat(salaryLpa) || 6.0,
        min_cgpa: parseFloat(minCgpa) || 6.5,
        max_backlogs: parseInt(maxBacklogs) || 0,
        eligible_departments: ['CSE', 'IT', 'ECE'],
        required_skills: reqSkills.split(',').map(s => s.trim()).filter(Boolean),
        preferred_skills: prefSkills.split(',').map(s => s.trim()).filter(Boolean),
        soft_skills: ['Communication', 'Teamwork']
      });
      setShowModal(false);
      fetchData();
    } catch (e) {
      alert('Error creating drive');
    }
  };

  const handleDeleteDrive = async (jobId: number, jobTitle: string) => {
    if (!window.confirm(`Are you sure you want to remove recruitment drive '${jobTitle}'? Candidate applications for this drive will also be cleared.`)) {
      return;
    }
    setDeletingId(jobId);
    try {
      await api.deleteJob(jobId);
      await fetchData();
    } catch (e) {
      alert('Failed to delete recruitment drive');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-w-0">
        <Navbar title="Placement Drives & Job Openings" subtitle="Create recruitment drives, upload company JDs, and evaluate candidates" />
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white">{jobs.length} Active Recruitment Drives</h3>
              {isAdmin ? (
                <p className="text-xs text-brand-400 font-medium">Placement Director / Admin Access Active (Create & Remove enabled)</p>
              ) : (
                <p className="text-xs text-slate-500 font-medium">Viewing drives as {role}</p>
              )}
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" /> Create Placement Drive
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <div key={job.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4 shadow-lg relative group">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">{job.company_name}</span>
                      <h4 className="text-base font-bold text-white">{job.title}</h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-emerald-400">₹{job.salary_lpa} LPA</span>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteDrive(job.id, job.title)}
                          disabled={deletingId === job.id}
                          title="Remove Placement Drive"
                          className="p-1.5 rounded-lg bg-slate-950 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/30 transition opacity-80 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{job.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex flex-wrap gap-1">
                    {job.required_skills.map((sk) => (
                      <span key={sk} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[11px]">
                        {sk}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Min CGPA: <strong className="text-slate-200">{job.min_cgpa}</strong></span>
                    <span>Eligible: <strong className="text-slate-200">{job.eligible_departments.join(', ')}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-xs text-slate-400">
                    <strong className="text-brand-400 font-bold">{job.total_shortlisted}</strong> candidates shortlisted
                  </span>
                  <Link
                    to={`/matching?job_id=${job.id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 border border-brand-500/30 text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> AI Match Rankings
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Placement Drive</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {/* Quick JD Auto-Parser Upload */}
            <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs space-y-2">
              <div className="font-bold text-brand-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-400" /> Auto-Extract from Company JD Document
              </div>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleJDFileUpload}
                className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white cursor-pointer"
              />
              {parsingJD && <p className="text-[11px] text-brand-400 animate-pulse">Extracting structured requirements with AI...</p>}
            </div>

            <form onSubmit={handleCreateDrive} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company</label>
                <select value={companyId} onChange={(e) => setCompanyId(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100">
                  {companies.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Salary (CTC LPA)</label>
                  <input type="number" step="0.1" value={salaryLpa} onChange={(e) => setSalaryLpa(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Min CGPA</label>
                  <input type="number" step="0.1" value={minCgpa} onChange={(e) => setMinCgpa(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Backlogs</label>
                  <input type="number" value={maxBacklogs} onChange={(e) => setMaxBacklogs(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Required Skills (Comma separated)</label>
                <input type="text" value={reqSkills} onChange={(e) => setReqSkills(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Skills</label>
                <input type="text" value={prefSkills} onChange={(e) => setPrefSkills(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100" />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg mt-2">Publish Drive</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import axios from 'axios';
import {
  AuthResponse, User, Student, StudentDetail, Company, JobDrive,
  CandidateMatch, XAIAnalysis, MatchWeights, CohortSkillDemand,
  TrainingProgram, StudentPrepPlan, InterviewFeedback, AnalyticsDashboard,
  DocumentItem, RAGQueryResponse, ChatResponse, AIEvalDashboard,
  NotificationItem, AuditLogItem
} from '../types';

const API_BASE = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('placement_jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (data: any): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },
  demoLogin: async (role: string): Promise<AuthResponse> => {
    const res = await apiClient.post(`/auth/demo-login/${role}`);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  // Students
  getStudents: async (params?: { department?: string; min_cgpa?: number; placement_status?: string; search?: string }): Promise<Student[]> => {
    const res = await apiClient.get('/students', { params });
    return res.data;
  },
  getStudentById: async (id: number): Promise<StudentDetail> => {
    const res = await apiClient.get(`/students/${id}`);
    return res.data;
  },
  getCurrentStudentProfile: async (): Promise<StudentDetail> => {
    const res = await apiClient.get('/students/me');
    return res.data;
  },
  updateStudent: async (id: number, data: any): Promise<StudentDetail> => {
    const res = await apiClient.put(`/students/${id}`, data);
    return res.data;
  },
  uploadResume: async (studentId: number, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post(`/students/${studentId}/resume`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // Companies
  getCompanies: async (): Promise<Company[]> => {
    const res = await apiClient.get('/companies');
    return res.data;
  },
  createCompany: async (data: any): Promise<Company> => {
    const res = await apiClient.post('/companies', data);
    return res.data;
  },
  deleteCompany: async (id: number): Promise<any> => {
    const res = await apiClient.delete(`/companies/${id}`);
    return res.data;
  },

  // Jobs
  getJobs: async (status?: string): Promise<JobDrive[]> => {
    const res = await apiClient.get('/jobs', { params: { status } });
    return res.data;
  },
  createJob: async (data: any): Promise<JobDrive> => {
    const res = await apiClient.post('/jobs', data);
    return res.data;
  },
  deleteJob: async (id: number): Promise<any> => {
    const res = await apiClient.delete(`/jobs/${id}`);
    return res.data;
  },
  parseJD: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/jobs/parse-jd', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // Candidate Matching & XAI
  getCandidatesForJob: async (jobId: number, params?: { department?: string; min_score?: number; eligibility_only?: boolean }): Promise<CandidateMatch[]> => {
    const res = await apiClient.get(`/matching/jobs/${jobId}/candidates`, { params });
    return res.data;
  },
  getCandidateXAI: async (jobId: number, studentId: number): Promise<XAIAnalysis> => {
    const res = await apiClient.get(`/matching/jobs/${jobId}/candidates/${studentId}/analysis`);
    return res.data;
  },
  updateCandidateStatus: async (jobId: number, studentId: number, action: string, notes?: string): Promise<any> => {
    const res = await apiClient.post(`/matching/jobs/${jobId}/action`, { student_id: studentId, action, notes });
    return res.data;
  },
  updateMatchWeights: async (weights: MatchWeights): Promise<any> => {
    const res = await apiClient.post('/matching/weights', weights);
    return res.data;
  },

  // Training & Skills
  getCohortDemand: async (): Promise<CohortSkillDemand[]> => {
    const res = await apiClient.get('/training/cohort-demand');
    return res.data;
  },
  getStudentGaps: async (studentId: number, jobId?: number): Promise<any> => {
    const res = await apiClient.get(`/training/student/${studentId}/gaps`, { params: { job_id: jobId } });
    return res.data;
  },
  getStudentPrepPlan: async (studentId: number, jobId?: number): Promise<StudentPrepPlan> => {
    const res = await apiClient.get(`/training/student/${studentId}/prep-plan`, { params: { job_id: jobId } });
    return res.data;
  },
  getTrainingPrograms: async (): Promise<TrainingProgram[]> => {
    const res = await apiClient.get('/training/programs');
    return res.data;
  },
  createTrainingProgram: async (data: any): Promise<TrainingProgram> => {
    const res = await apiClient.post('/training/programs', data);
    return res.data;
  },

  // Interview Feedback
  getInterviewFeedbacks: async (): Promise<InterviewFeedback[]> => {
    const res = await apiClient.get('/interview-feedback');
    return res.data;
  },
  recordInterviewFeedback: async (data: any): Promise<InterviewFeedback> => {
    const res = await apiClient.post('/interview-feedback', data);
    return res.data;
  },

  // Analytics
  getAnalytics: async (): Promise<AnalyticsDashboard> => {
    const res = await apiClient.get('/analytics/dashboard');
    return res.data;
  },

  // RAG Documents
  getDocuments: async (): Promise<DocumentItem[]> => {
    const res = await apiClient.get('/documents');
    return res.data;
  },
  queryRAG: async (query: string, category?: string): Promise<RAGQueryResponse> => {
    const res = await apiClient.post('/documents/query', { query, category });
    return res.data;
  },
  uploadDocument: async (title: string, category: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('file', file);
    const res = await apiClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // AI Copilot
  chatWithCopilot: async (message: string, history: any[] = []): Promise<ChatResponse> => {
    const res = await apiClient.post('/ai/chat', { message, conversation_history: history });
    return res.data;
  },

  // AI Evaluation
  getAIBenchmarks: async (): Promise<AIEvalDashboard> => {
    const res = await apiClient.get('/eval/benchmarks');
    return res.data;
  },

  // Notifications & Audit
  getNotifications: async (): Promise<NotificationItem[]> => {
    const res = await apiClient.get('/notifications');
    return res.data;
  },
  markNotificationRead: async (id: number): Promise<any> => {
    const res = await apiClient.post(`/notifications/${id}/read`);
    return res.data;
  },
  getAuditLogs: async (): Promise<AuditLogItem[]> => {
    const res = await apiClient.get('/audit');
    return res.data;
  }
};

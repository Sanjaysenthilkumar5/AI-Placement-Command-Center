import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { PlacementDrivesPage } from './pages/PlacementDrivesPage';
import { CandidateMatchingPage } from './pages/CandidateMatchingPage';
import { SkillGapsPage } from './pages/SkillGapsPage';
import { TrainingProgramsPage } from './pages/TrainingProgramsPage';
import { InterviewFeedbackPage } from './pages/InterviewFeedbackPage';
import { PlacementsPage } from './pages/PlacementsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DocumentsRAGPage } from './pages/DocumentsRAGPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { AIEvalPage } from './pages/AIEvalPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { StudentPortalPage } from './pages/student/StudentPortalPage';
import { RecruiterPortalPage } from './pages/recruiter/RecruiterPortalPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();
  if (isLoading) return <div className="p-8 text-center text-slate-400">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
          <Route path="/companies" element={<ProtectedRoute><CompaniesPage /></ProtectedRoute>} />
          <Route path="/drives" element={<ProtectedRoute><PlacementDrivesPage /></ProtectedRoute>} />
          <Route path="/matching" element={<ProtectedRoute><CandidateMatchingPage /></ProtectedRoute>} />
          <Route path="/skill-gaps" element={<ProtectedRoute><SkillGapsPage /></ProtectedRoute>} />
          <Route path="/training" element={<ProtectedRoute><TrainingProgramsPage /></ProtectedRoute>} />
          <Route path="/interview-feedback" element={<ProtectedRoute><InterviewFeedbackPage /></ProtectedRoute>} />
          <Route path="/placements" element={<ProtectedRoute><PlacementsPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><DocumentsRAGPage /></ProtectedRoute>} />
          <Route path="/ai-copilot" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
          <Route path="/ai-eval" element={<ProtectedRoute><AIEvalPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/audit-logs" element={<ProtectedRoute><AuditLogsPage /></ProtectedRoute>} />

          {/* Student & Recruiter Portals */}
          <Route path="/student/portal" element={<ProtectedRoute><StudentPortalPage /></ProtectedRoute>} />
          <Route path="/recruiter/portal" element={<ProtectedRoute><RecruiterPortalPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

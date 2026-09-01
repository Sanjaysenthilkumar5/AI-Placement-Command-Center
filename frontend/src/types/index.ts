export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'student' | 'recruiter';
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: string;
  user_id: number;
  full_name: string;
  email: string;
}

export interface Student {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  roll_number: string;
  department: string;
  batch_year: number;
  cgpa: number;
  active_backlogs: number;
  phone?: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  placement_status: 'unplaced' | 'shortlisted' | 'placed' | 'opted_out';
  placement_readiness_score: number;
  skills: string[];
  created_at: string;
}

export interface StudentSkill {
  id: number;
  skill_id: number;
  skill_name: string;
  category: string;
  proficiency_level: string;
  verified: boolean;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  tech_stack: string[];
  github_link?: string;
  live_link?: string;
  duration_months: number;
}

export interface Internship {
  id: number;
  company_name: string;
  role: string;
  description?: string;
  duration_months: number;
  certificate_url?: string;
}

export interface Certification {
  id: number;
  title: string;
  issuing_org: string;
  issue_date?: string;
  credential_url?: string;
}

export interface StudentDetail extends Student {
  ai_profile_summary?: string;
  strengths: string[];
  gaps: string[];
  best_roles: string[];
  detailed_skills: StudentSkill[];
  projects: Project[];
  internships: Internship[];
  certifications: Certification[];
}

export interface Company {
  id: number;
  name: string;
  industry: string;
  website?: string;
  location?: string;
  description?: string;
  recruiter_name?: string;
  recruiter_email?: string;
  recruiter_phone?: string;
  logo_url?: string;
  total_drives: number;
  total_hired: number;
  avg_package_lpa: number;
  created_at: string;
}

export interface JobDrive {
  id: number;
  company_id: number;
  company_name: string;
  title: string;
  description: string;
  location: string;
  work_mode: string;
  salary_lpa: number;
  job_type: string;
  experience_level: string;
  min_cgpa: number;
  max_backlogs: number;
  eligible_departments: string[];
  required_skills: string[];
  preferred_skills: string[];
  soft_skills: string[];
  responsibilities: string[];
  application_deadline?: string;
  drive_date?: string;
  status: string;
  total_applicants: number;
  total_shortlisted: number;
  created_at: string;
}

export interface CandidateMatch {
  rank: number;
  student_id: number;
  student_name: string;
  roll_number: string;
  department: string;
  cgpa: number;
  backlogs: number;
  placement_status: string;
  match_score: number;
  is_eligible: boolean;
  status: string;
  matched_skills_count: number;
  total_required_skills: number;
  missing_skills: string[];
  ai_summary: string;
}

export interface CandidateMatchBreakdown {
  eligibility_score: number;
  required_skills_score: number;
  preferred_skills_score: number;
  projects_score: number;
  internships_score: number;
  cgpa_score: number;
  experience_score: number;
  soft_skills_score: number;
  certifications_score: number;
  is_eligible: boolean;
  eligibility_reasons: string[];
}

export interface XAIAnalysis {
  student_id: number;
  student_name: string;
  department: string;
  cgpa: number;
  job_id: number;
  job_title: string;
  company_name: string;
  match_score: number;
  is_eligible: boolean;
  breakdown: CandidateMatchBreakdown;
  matched_required_skills: string[];
  missing_required_skills: string[];
  matched_preferred_skills: string[];
  missing_preferred_skills: string[];
  matched_soft_skills: string[];
  relevant_projects: string[];
  relevant_internships: string[];
  strengths_rationale: string[];
  skill_gaps_rationale: string[];
  ai_recommendation: string;
}

export interface MatchWeights {
  eligibility_weight: number;
  required_skills_weight: number;
  preferred_skills_weight: number;
  projects_weight: number;
  internships_weight: number;
  cgpa_weight: number;
  experience_weight: number;
  soft_skills_weight: number;
  certifications_weight: number;
}

export interface CohortSkillDemand {
  skill: string;
  demand_pct: number;
  unmet_student_count: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface TrainingProgram {
  id: number;
  title: string;
  description: string;
  target_skill_name: string;
  priority: string;
  cohort_size: number;
  duration_weeks: number;
  syllabus: string[];
  status: string;
  created_at: string;
}

export interface PrepPlanWeek {
  week_number: number;
  focus_title: string;
  topics: string[];
  practical_exercises: string[];
  target_skill: string;
}

export interface StudentPrepPlan {
  student_id: number;
  student_name: string;
  target_role: string;
  estimated_readiness_before: number;
  estimated_readiness_after: number;
  weekly_schedule: PrepPlanWeek[];
  ai_advisor_note: string;
}

export interface InterviewFeedback {
  id: number;
  student_id: number;
  student_name: string;
  round_name: string;
  technical_score: number;
  communication_score: number;
  aptitude_score: number;
  problem_solving_score: number;
  confidence_score: number;
  average_score: number;
  hr_feedback?: string;
  technical_feedback?: string;
  final_verdict: string;
  created_at: string;
}

export interface PlacementKPICards {
  total_students: number;
  eligible_students: number;
  active_companies: number;
  active_drives: number;
  students_placed: number;
  placement_percentage: number;
  average_package_lpa: number;
  highest_package_lpa: number;
}

export interface TrendDataPoint {
  month: string;
  placed_count: number;
  drives_count: number;
}

export interface DeptPlacementStat {
  department: string;
  total: number;
  placed: number;
  placement_pct: number;
  avg_package: number;
}

export interface SkillDemandStat {
  skill: string;
  demand_pct: number;
  active_jobs_count: number;
}

export interface AnalyticsDashboard {
  kpis: PlacementKPICards;
  placement_trend: TrendDataPoint[];
  dept_distribution: DeptPlacementStat[];
  skill_demand: SkillDemandStat[];
  training_priority: CohortSkillDemand[];
}

export interface DocumentItem {
  id: number;
  title: string;
  category: string;
  summary?: string;
  chunks_count: number;
  created_at: string;
}

export interface Citation {
  document_id: number;
  document_title: string;
  chunk_index: number;
  snippet: string;
  relevance_score: number;
}

export interface RAGQueryResponse {
  query: string;
  answer: string;
  citations: Citation[];
  is_grounded: boolean;
  confidence_score: number;
}

export interface ToolExecutionLog {
  tool_name: string;
  parameters: Record<string, any>;
  result_summary: string;
}

export interface ChatResponse {
  response: string;
  executed_tools: ToolExecutionLog[];
  quick_suggestions: string[];
}

export interface BenchmarkCase {
  id: number;
  test_case_name: string;
  job_title: string;
  student_name: string;
  expected_score: number;
  actual_score: number;
  expected_eligibility: boolean;
  actual_eligibility: boolean;
  precision_at_k: number;
  passed: boolean;
  discrepancy_reason?: string;
}

export interface AIEvalDashboard {
  total_test_cases: number;
  passed_test_cases: number;
  overall_accuracy_pct: number;
  precision_at_3: number;
  precision_at_5: number;
  skill_extraction_accuracy_pct: number;
  eligibility_accuracy_pct: number;
  avg_inference_latency_ms: number;
  estimated_token_cost_usd: number;
  benchmark_cases: BenchmarkCase[];
  scoring_formula_weights: Record<string, number>;
  safeguards_active: string[];
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface AuditLogItem {
  id: number;
  user_name: string;
  role: string;
  action: string;
  entity_type?: string;
  entity_id?: number;
  details: Record<string, any>;
  timestamp: string;
}

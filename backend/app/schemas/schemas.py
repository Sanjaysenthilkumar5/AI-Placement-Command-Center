from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# ================= AUTH SCHEMAS =================
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    full_name: str
    email: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "student"  # admin, student, recruiter
    roll_number: Optional[str] = None
    department: Optional[str] = None
    batch_year: Optional[int] = 2026
    cgpa: Optional[float] = 0.0

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

# ================= SKILL & PROFILE SCHEMAS =================
class SkillOut(BaseModel):
    id: int
    name: str
    category: str
    class Config:
        from_attributes = True

class StudentSkillOut(BaseModel):
    id: int
    skill_id: int
    skill_name: str
    category: str
    proficiency_level: str
    verified: bool

class ProjectOut(BaseModel):
    id: int
    title: str
    description: str
    tech_stack: List[str]
    github_link: Optional[str] = None
    live_link: Optional[str] = None
    duration_months: int

class InternshipOut(BaseModel):
    id: int
    company_name: str
    role: str
    description: Optional[str] = None
    duration_months: int
    certificate_url: Optional[str] = None

class CertificationOut(BaseModel):
    id: int
    title: str
    issuing_org: str
    issue_date: Optional[str] = None
    credential_url: Optional[str] = None

class StudentOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    roll_number: str
    department: str
    batch_year: int
    cgpa: float
    active_backlogs: int
    phone: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    placement_status: str
    placement_readiness_score: float
    skills: List[str] = []
    created_at: datetime
    class Config:
        from_attributes = True

class StudentDetailOut(StudentOut):
    ai_profile_summary: Optional[str] = None
    strengths: List[str] = []
    gaps: List[str] = []
    best_roles: List[str] = []
    detailed_skills: List[StudentSkillOut] = []
    projects: List[ProjectOut] = []
    internships: List[InternshipOut] = []
    certifications: List[CertificationOut] = []
    latest_resume_url: Optional[str] = None

class StudentCreate(BaseModel):
    full_name: str
    email: EmailStr
    roll_number: str
    department: str
    batch_year: int = 2026
    cgpa: float = 7.5
    active_backlogs: int = 0
    phone: Optional[str] = None
    skills: List[str] = []
    password: Optional[str] = "password123"

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class StudentUpdate(BaseModel):
    phone: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    skills: Optional[List[str]] = None
    cgpa: Optional[float] = None
    active_backlogs: Optional[int] = None

# ================= COMPANY & JOB SCHEMAS =================
class CompanyCreate(BaseModel):
    name: str
    industry: str
    website: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    recruiter_phone: Optional[str] = None
    logo_url: Optional[str] = None

class CompanyOut(BaseModel):
    id: int
    name: str
    industry: str
    website: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    recruiter_phone: Optional[str] = None
    logo_url: Optional[str] = None
    total_drives: int = 0
    total_hired: int = 0
    avg_package_lpa: float = 0.0
    created_at: datetime
    class Config:
        from_attributes = True

class JobCreate(BaseModel):
    company_id: int
    title: str
    description: str
    location: str = "Pan India"
    work_mode: str = "onsite"
    salary_lpa: float = 6.0
    job_type: str = "Full Time"
    experience_level: str = "Fresher"
    min_cgpa: float = 6.5
    max_backlogs: int = 0
    eligible_departments: List[str] = ["CSE", "IT", "ECE"]
    required_skills: List[str] = ["Java", "SQL"]
    preferred_skills: List[str] = ["AWS", "Docker"]
    soft_skills: List[str] = ["Communication", "Teamwork"]
    responsibilities: List[str] = []
    application_deadline: Optional[datetime] = None
    drive_date: Optional[datetime] = None

class StructuredJD(BaseModel):
    job_title: str
    company_name: Optional[str] = None
    experience_level: str = "Fresher"
    salary_lpa: float = 6.0
    min_cgpa: float = 6.5
    max_backlogs: int = 0
    eligible_departments: List[str] = []
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    soft_skills: List[str] = []
    responsibilities: List[str] = []
    summary: str = ""

class JobOut(BaseModel):
    id: int
    company_id: int
    company_name: str
    title: str
    description: str
    location: str
    work_mode: str
    salary_lpa: float
    job_type: str
    experience_level: str
    min_cgpa: float
    max_backlogs: int
    eligible_departments: List[str] = []
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    soft_skills: List[str] = []
    responsibilities: List[str] = []
    application_deadline: Optional[datetime] = None
    drive_date: Optional[datetime] = None
    status: str
    total_applicants: int = 0
    total_shortlisted: int = 0
    created_at: datetime
    class Config:
        from_attributes = True

# ================= MATCHING & XAI SCHEMAS =================
class MatchWeightConfig(BaseModel):
    eligibility_weight: float = 0.20
    required_skills_weight: float = 0.30
    preferred_skills_weight: float = 0.10
    projects_weight: float = 0.10
    internships_weight: float = 0.05
    cgpa_weight: float = 0.10
    experience_weight: float = 0.05
    soft_skills_weight: float = 0.05
    certifications_weight: float = 0.05

class CandidateMatchBreakdown(BaseModel):
    eligibility_score: float
    required_skills_score: float
    preferred_skills_score: float
    projects_score: float
    internships_score: float
    cgpa_score: float
    experience_score: float
    soft_skills_score: float
    certifications_score: float
    is_eligible: bool
    eligibility_reasons: List[str] = []

class XAIAnalysisOut(BaseModel):
    student_id: int
    student_name: str
    department: str
    cgpa: float
    job_id: int
    job_title: str
    company_name: str
    match_score: float
    is_eligible: bool
    breakdown: CandidateMatchBreakdown
    matched_required_skills: List[str] = []
    missing_required_skills: List[str] = []
    matched_preferred_skills: List[str] = []
    missing_preferred_skills: List[str] = []
    matched_soft_skills: List[str] = []
    relevant_projects: List[str] = []
    relevant_internships: List[str] = []
    strengths_rationale: List[str] = []
    skill_gaps_rationale: List[str] = []
    ai_recommendation: str

class CandidateMatchOut(BaseModel):
    rank: int
    student_id: int
    student_name: str
    roll_number: str
    department: str
    cgpa: float
    backlogs: int
    placement_status: str
    match_score: float
    is_eligible: bool
    status: str  # applied, shortlisted, etc.
    matched_skills_count: int
    total_required_skills: int
    missing_skills: List[str] = []
    ai_summary: str

class ShortlistActionRequest(BaseModel):
    student_id: int
    action: str  # shortlist, reject, interview_schedule, reset
    notes: Optional[str] = None

# ================= SKILL GAPS & TRAINING SCHEMAS =================
class SkillGapCategory(BaseModel):
    strong: List[str] = []
    moderate: List[str] = []
    missing: List[str] = []
    overall_skill_match_pct: float

class StudentSkillGapOut(BaseModel):
    student_id: int
    student_name: str
    target_job_title: str
    gaps: SkillGapCategory
    recommendations: List[str]

class CohortSkillDemandItem(BaseModel):
    skill: str
    demand_pct: float
    unmet_student_count: int
    priority: str  # HIGH, MEDIUM, LOW

class TrainingProgramCreate(BaseModel):
    title: str
    description: str
    target_skill_name: str
    priority: str = "high"
    cohort_size: int = 30
    duration_weeks: int = 4
    syllabus: List[str] = []

class TrainingProgramOut(BaseModel):
    id: int
    title: str
    description: str
    target_skill_name: str
    priority: str
    cohort_size: int
    duration_weeks: int
    syllabus: List[str] = []
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class PrepPlanWeek(BaseModel):
    week_number: int
    focus_title: str
    topics: List[str]
    practical_exercises: List[str]
    target_skill: str

class StudentPrepPlan(BaseModel):
    student_id: int
    student_name: str
    target_role: str
    estimated_readiness_before: float
    estimated_readiness_after: float
    weekly_schedule: List[PrepPlanWeek]
    ai_advisor_note: str

# ================= INTERVIEW FEEDBACK SCHEMAS =================
class InterviewFeedbackCreate(BaseModel):
    application_id: Optional[int] = None
    student_id: int
    round_name: str = "Technical Round 1"
    technical_score: float = Field(..., ge=1, le=10)
    communication_score: float = Field(..., ge=1, le=10)
    aptitude_score: float = Field(..., ge=1, le=10)
    problem_solving_score: float = Field(..., ge=1, le=10)
    confidence_score: float = Field(..., ge=1, le=10)
    hr_feedback: Optional[str] = None
    technical_feedback: Optional[str] = None
    final_verdict: str = "on_hold"  # selected, rejected, on_hold

class InterviewFeedbackOut(BaseModel):
    id: int
    student_id: int
    student_name: str
    round_name: str
    technical_score: float
    communication_score: float
    aptitude_score: float
    problem_solving_score: float
    confidence_score: float
    average_score: float
    hr_feedback: Optional[str]
    technical_feedback: Optional[str]
    final_verdict: str
    created_at: datetime
    class Config:
        from_attributes = True

# ================= PLACEMENT PREDICTION SCHEMAS =================
class PlacementPredictionOut(BaseModel):
    student_id: int
    student_name: str
    readiness_score: float  # 0 to 100
    category: str           # HIGH, MEDIUM, MODERATE, LOW
    factors: Dict[str, float]
    strengths: List[str]
    areas_to_improve: List[str]
    disclaimer: str = "AI readiness estimate only; does not guarantee employment offers."

# ================= ANALYTICS SCHEMAS =================
class PlacementKPICards(BaseModel):
    total_students: int
    eligible_students: int
    active_companies: int
    active_drives: int
    students_placed: int
    placement_percentage: float
    average_package_lpa: float
    highest_package_lpa: float

class TrendDataPoint(BaseModel):
    month: str
    placed_count: int
    drives_count: int

class DeptPlacementStat(BaseModel):
    department: str
    total: int
    placed: int
    placement_pct: float
    avg_package: float

class SkillDemandStat(BaseModel):
    skill: str
    demand_pct: float
    active_jobs_count: int

class AnalyticsDashboardOut(BaseModel):
    kpis: PlacementKPICards
    placement_trend: List[TrendDataPoint]
    dept_distribution: List[DeptPlacementStat]
    skill_demand: List[SkillDemandStat]
    training_priority: List[CohortSkillDemandItem]

# ================= RAG & DOCUMENTS SCHEMAS =================
class DocumentOut(BaseModel):
    id: int
    title: str
    category: str
    summary: Optional[str]
    chunks_count: int
    created_at: datetime
    class Config:
        from_attributes = True

class DocumentQueryRequest(BaseModel):
    query: str
    category: Optional[str] = None
    top_k: int = 4

class CitationOut(BaseModel):
    document_id: int
    document_title: str
    chunk_index: int
    snippet: str
    relevance_score: float

class DocumentQueryResponse(BaseModel):
    query: str
    answer: str
    citations: List[CitationOut]
    is_grounded: bool
    confidence_score: float

# ================= AI ASSISTANT SCHEMAS =================
class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str
    tool_calls: Optional[List[Dict[str, Any]]] = None

class ChatQueryRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage] = []

class ToolExecutionLog(BaseModel):
    tool_name: str
    parameters: Dict[str, Any]
    result_summary: str

class ChatQueryResponse(BaseModel):
    response: str
    executed_tools: List[ToolExecutionLog] = []
    quick_suggestions: List[str] = []

# ================= AI EVALUATION BENCHMARKS =================
class BenchmarkCaseOut(BaseModel):
    id: int
    test_case_name: str
    job_title: str
    student_name: str
    expected_score: float
    actual_score: float
    expected_eligibility: bool
    actual_eligibility: bool
    precision_at_k: float
    passed: bool
    discrepancy_reason: Optional[str] = None

class AIEvalDashboardOut(BaseModel):
    total_test_cases: int
    passed_test_cases: int
    overall_accuracy_pct: float
    precision_at_3: float
    precision_at_5: float
    skill_extraction_accuracy_pct: float
    eligibility_accuracy_pct: float
    avg_inference_latency_ms: float
    estimated_token_cost_usd: float
    benchmark_cases: List[BenchmarkCaseOut]
    scoring_formula_weights: Dict[str, float]
    safeguards_active: List[str]

# ================= NOTIFICATIONS & AUDIT =================
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    link: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

class AuditLogOut(BaseModel):
    id: int
    user_name: str
    role: str
    action: str
    entity_type: Optional[str]
    entity_id: Optional[int]
    details: Dict[str, Any]
    timestamp: datetime
    class Config:
        from_attributes = True

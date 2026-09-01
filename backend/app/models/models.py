import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON, Enum
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student", index=True)  # admin, student, recruiter
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    student_profile = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    roll_number = Column(String(50), unique=True, index=True, nullable=False)
    department = Column(String(100), index=True, nullable=False)  # CSE, IT, ECE, EEE, MECH, etc.
    batch_year = Column(Integer, default=2026, index=True)
    cgpa = Column(Float, default=0.0, index=True)
    active_backlogs = Column(Integer, default=0)
    phone = Column(String(30), nullable=True)
    github_url = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    portfolio_url = Column(String(255), nullable=True)
    placement_status = Column(String(50), default="unplaced", index=True)  # unplaced, shortlisted, placed, opted_out
    placement_readiness_score = Column(Float, default=0.0)  # 0 to 100
    ai_profile_summary = Column(Text, nullable=True)
    strengths_json = Column(JSON, default=list)
    gaps_json = Column(JSON, default=list)
    best_roles_json = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="student_profile")
    skills = relationship("StudentSkill", back_populates="student", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="student", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="student", cascade="all, delete-orphan")
    internships = relationship("Internship", back_populates="student", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="student", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")
    interview_feedbacks = relationship("InterviewFeedback", back_populates="student", cascade="all, delete-orphan")
    placement_records = relationship("Placement", back_populates="student", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)  # Normalized name
    category = Column(String(50), default="core", index=True)  # frontend, backend, database, cloud, ml_ai, core, soft_skill


class StudentSkill(Base):
    __tablename__ = "student_skills"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    proficiency_level = Column(String(50), default="intermediate")  # beginner, intermediate, advanced
    verified = Column(Boolean, default=True)

    # Relationships
    student = relationship("Student", back_populates="skills")
    skill = relationship("Skill")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    file_path = Column(String(500), nullable=False)
    file_name = Column(String(255), nullable=False)
    parsed_text = Column(Text, nullable=True)
    parsed_json = Column(JSON, default=dict)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("Student", back_populates="resumes")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    tech_stack_json = Column(JSON, default=list)  # list of strings
    github_link = Column(String(255), nullable=True)
    live_link = Column(String(255), nullable=True)
    duration_months = Column(Integer, default=3)

    student = relationship("Student", back_populates="projects")


class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    company_name = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    duration_months = Column(Integer, default=3)
    certificate_url = Column(String(255), nullable=True)

    student = relationship("Student", back_populates="internships")


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    issuing_org = Column(String(255), nullable=False)
    issue_date = Column(String(50), nullable=True)
    credential_url = Column(String(255), nullable=True)

    student = relationship("Student", back_populates="certifications")


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    industry = Column(String(100), index=True, nullable=False)
    website = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    recruiter_name = Column(String(255), nullable=True)
    recruiter_email = Column(String(255), nullable=True)
    recruiter_phone = Column(String(50), nullable=True)
    logo_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    jobs = relationship("Job", back_populates="company", cascade="all, delete-orphan")
    placements = relationship("Placement", back_populates="company")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(255), default="Pan India")
    work_mode = Column(String(50), default="onsite")  # onsite, hybrid, remote
    salary_lpa = Column(Float, default=6.0)
    job_type = Column(String(50), default="Full Time")
    experience_level = Column(String(50), default="Fresher")
    min_cgpa = Column(Float, default=6.5)
    max_backlogs = Column(Integer, default=0)
    eligible_departments_json = Column(JSON, default=list)  # ["CSE", "IT", "ECE"]
    required_skills_json = Column(JSON, default=list)       # ["Java", "Spring Boot", "SQL"]
    preferred_skills_json = Column(JSON, default=list)      # ["AWS", "Docker"]
    soft_skills_json = Column(JSON, default=list)           # ["Communication", "Teamwork"]
    responsibilities_json = Column(JSON, default=list)
    application_deadline = Column(DateTime, nullable=True)
    drive_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="active", index=True)  # draft, active, closed
    raw_jd_file_path = Column(String(500), nullable=True)
    structured_jd_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    company = relationship("Company", back_populates="jobs")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    placements = relationship("Placement", back_populates="job")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="applied", index=True)  # applied, eligible, ineligible, shortlisted, interview_scheduled, offered, rejected
    match_score = Column(Float, default=0.0, index=True)
    match_breakdown_json = Column(JSON, default=dict)
    ai_recommendation = Column(Text, nullable=True)
    applied_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    job = relationship("Job", back_populates="applications")
    student = relationship("Student", back_populates="applications")
    interview_feedbacks = relationship("InterviewFeedback", back_populates="application", cascade="all, delete-orphan")


class InterviewFeedback(Base):
    __tablename__ = "interview_feedback"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    round_name = Column(String(100), default="Technical Round 1")
    technical_score = Column(Float, default=7.0)      # 1-10
    communication_score = Column(Float, default=7.0)  # 1-10
    aptitude_score = Column(Float, default=7.0)       # 1-10
    problem_solving_score = Column(Float, default=7.0)# 1-10
    confidence_score = Column(Float, default=7.0)     # 1-10
    hr_feedback = Column(Text, nullable=True)
    technical_feedback = Column(Text, nullable=True)
    final_verdict = Column(String(50), default="on_hold")  # selected, rejected, on_hold
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    application = relationship("Application", back_populates="interview_feedbacks")
    student = relationship("Student", back_populates="interview_feedbacks")


class TrainingProgram(Base):
    __tablename__ = "training_programs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True)
    target_skill_name = Column(String(100), nullable=False)
    priority = Column(String(50), default="high", index=True)  # high, medium, low
    cohort_size = Column(Integer, default=30)
    duration_weeks = Column(Integer, default=4)
    syllabus_json = Column(JSON, default=list)
    status = Column(String(50), default="planned")  # planned, ongoing, completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    skill = relationship("Skill")


class Placement(Base):
    __tablename__ = "placements"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    package_lpa = Column(Float, nullable=False)
    offer_date = Column(DateTime, default=datetime.datetime.utcnow)
    acceptance_status = Column(String(50), default="accepted")  # accepted, pending, declined
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("Student", back_populates="placement_records")
    company = relationship("Company", back_populates="placements")
    job = relationship("Job", back_populates="placements")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="policy", index=True)  # policy, jd, interview_experience, circular, curriculum
    file_path = Column(String(500), nullable=True)
    content_text = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    uploaded_by = Column(String(255), default="Placement Admin")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    embedding_json = Column(JSON, default=list)  # list of floats for vector retrieval

    document = relationship("Document", back_populates="chunks")


class AIEvalBenchmark(Base):
    __tablename__ = "ai_eval_benchmarks"

    id = Column(Integer, primary_key=True, index=True)
    test_case_name = Column(String(255), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True)
    expected_match_score = Column(Float, nullable=False)
    actual_match_score = Column(Float, nullable=False)
    expected_eligibility = Column(Boolean, default=True)
    actual_eligibility = Column(Boolean, default=True)
    precision_at_k = Column(Float, default=1.0)
    pass_fail = Column(Boolean, default=True)
    details_json = Column(JSON, default=dict)
    tested_at = Column(DateTime, default=datetime.datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info")  # job, shortlist, interview, training, alert
    is_read = Column(Boolean, default=False)
    link = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_name = Column(String(255), default="System")
    role = Column(String(50), default="admin")
    action = Column(String(255), nullable=False)
    entity_type = Column(String(100), nullable=True)
    entity_id = Column(Integer, nullable=True)
    details_json = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="audit_logs")

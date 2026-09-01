import pytest
from app.models.models import Student, Job, User, Skill, StudentSkill, Project, Internship
from app.services.matching_engine import matching_engine
from app.schemas.schemas import MatchWeightConfig

def test_skill_normalization():
    from app.services.ai_provider import normalize_skill, extract_skills_from_text
    assert normalize_skill("react.js") == "React"
    assert normalize_skill("ReactJS") == "React"
    assert normalize_skill("spring boot") == "Spring Boot"
    assert normalize_skill("aws") == "AWS"
    
    extracted = extract_skills_from_text("Candidate with experience in React.js, Python, and AWS cloud")
    assert "React" in extracted
    assert "Python" in extracted
    assert "AWS" in extracted

def test_candidate_eligibility_and_scoring():
    # Mock Student
    user = User(full_name="Test Student", email="test@test.com")
    student = Student(
        user=user,
        roll_number="2026CSE999",
        department="CSE",
        cgpa=8.5,
        active_backlogs=0,
        placement_status="unplaced"
    )
    java_skill = Skill(name="Java", category="core")
    sql_skill = Skill(name="SQL", category="database")
    comm_skill = Skill(name="Communication", category="soft_skill")
    student.skills = [
        StudentSkill(skill=java_skill, proficiency_level="advanced"),
        StudentSkill(skill=sql_skill, proficiency_level="advanced"),
        StudentSkill(skill=comm_skill, proficiency_level="advanced")
    ]
    student.projects = [
        Project(title="Java Microservice", description="Built with Java and SQL", tech_stack_json=["Java", "SQL"])
    ]
    student.internships = [
        Internship(company_name="Tech Corp", role="Software Intern", duration_months=3)
    ]
    student.certifications = []

    # Mock Job Drive
    job = Job(
        title="Software Engineer",
        min_cgpa=7.0,
        max_backlogs=0,
        eligible_departments_json=["CSE", "IT"],
        required_skills_json=["Java", "SQL"],
        preferred_skills_json=["AWS"],
        soft_skills_json=["Communication"]
    )

    score, breakdown, xai = matching_engine.evaluate_candidate(student, job)
    assert breakdown.is_eligible is True
    assert score >= 75.0
    assert "Java" in xai.matched_required_skills
    assert "SQL" in xai.matched_required_skills

def test_ineligible_candidate_penalty():
    user = User(full_name="Ineligible Student", email="ineligible@test.com")
    student = Student(
        user=user,
        roll_number="2026MECH999",
        department="MECH",
        cgpa=6.0,
        active_backlogs=1,
        placement_status="unplaced"
    )
    student.skills = []
    student.projects = []
    student.internships = []
    student.certifications = []

    job = Job(
        title="Software Engineer",
        min_cgpa=7.0,
        max_backlogs=0,
        eligible_departments_json=["CSE", "IT"],
        required_skills_json=["Java", "SQL"]
    )

    score, breakdown, xai = matching_engine.evaluate_candidate(student, job)
    assert breakdown.is_eligible is False
    assert score <= 45.0
    assert len(breakdown.eligibility_reasons) > 0

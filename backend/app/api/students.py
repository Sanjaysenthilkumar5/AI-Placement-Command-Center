import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.models import Student, User, Skill, StudentSkill, Resume, Project, Internship, Certification, Application, InterviewFeedback, Placement
from app.schemas.schemas import StudentOut, StudentDetailOut, StudentUpdate, StudentCreate, StudentSkillOut, ProjectOut, InternshipOut, CertificationOut
from app.services.resume_parser import resume_parser
from app.services.placement_predictor import placement_predictor
from app.services.ai_provider import normalize_skill
from app.api.auth import get_current_user

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("", response_model=List[StudentOut])
def get_students(
    department: Optional[str] = None,
    min_cgpa: Optional[float] = None,
    placement_status: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Student).join(User)

    if department and department != "All":
        query = query.filter(Student.department == department)
    if min_cgpa is not None:
        query = query.filter(Student.cgpa >= min_cgpa)
    if placement_status and placement_status != "All":
        query = query.filter(Student.placement_status == placement_status)
    if search:
        s = f"%{search}%"
        query = query.filter((User.full_name.ilike(s)) | (Student.roll_number.ilike(s)) | (User.email.ilike(s)))

    students = query.offset(skip).limit(limit).all()
    
    result = []
    for st in students:
        sk_names = [sk.skill.name for sk in st.skills if sk.skill]
        result.append(StudentOut(
            id=st.id,
            user_id=st.user_id,
            full_name=st.user.full_name if st.user else "",
            email=st.user.email if st.user else "",
            roll_number=st.roll_number,
            department=st.department,
            batch_year=st.batch_year,
            cgpa=st.cgpa,
            active_backlogs=st.active_backlogs,
            phone=st.phone,
            github_url=st.github_url,
            linkedin_url=st.linkedin_url,
            portfolio_url=st.portfolio_url,
            placement_status=st.placement_status,
            placement_readiness_score=st.placement_readiness_score,
            skills=sk_names,
            created_at=st.created_at
        ))
    return result

@router.get("/me", response_model=StudentDetailOut)
def get_current_student_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    st = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return _build_student_detail(st)

@router.get("/{student_id}", response_model=StudentDetailOut)
def get_student_by_id(student_id: int, db: Session = Depends(get_db)):
    st = db.query(Student).filter(Student.id == student_id).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student not found")
    return _build_student_detail(st)

@router.put("/{student_id}", response_model=StudentDetailOut)
def update_student_profile(
    student_id: int,
    data: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    st = db.query(Student).filter(Student.id == student_id).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student not found")

    if data.phone is not None: st.phone = data.phone
    if data.github_url is not None: st.github_url = data.github_url
    if data.linkedin_url is not None: st.linkedin_url = data.linkedin_url
    if data.portfolio_url is not None: st.portfolio_url = data.portfolio_url
    if data.cgpa is not None: st.cgpa = data.cgpa
    if data.active_backlogs is not None: st.active_backlogs = data.active_backlogs

    # Update readiness score
    pred = placement_predictor.predict_readiness(st, db)
    st.placement_readiness_score = pred.readiness_score

    db.commit()
    db.refresh(st)
    return _build_student_detail(st)

@router.post("/{student_id}/resume")
async def upload_resume(
    student_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    st = db.query(Student).filter(Student.id == student_id).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student not found")

    file_path = os.path.join(settings.UPLOAD_DIR, f"resume_{student_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = resume_parser.extract_text_from_file(file_path)
    parsed = resume_parser.parse_resume_content(text)

    # Save Resume Record
    res_obj = Resume(
        student_id=st.id,
        file_path=file_path,
        file_name=file.filename,
        parsed_text=text[:5000],
        parsed_json=parsed
    )
    db.add(res_obj)

    # Update student attributes if detected
    if parsed.get("cgpa") and parsed["cgpa"] > 0:
        st.cgpa = parsed["cgpa"]
    if parsed.get("github_url"):
        st.github_url = parsed["github_url"]
    if parsed.get("linkedin_url"):
        st.linkedin_url = parsed["linkedin_url"]

    # Normalize and link extracted skills
    for sk_name in parsed.get("skills", []):
        sk = db.query(Skill).filter(Skill.name == sk_name).first()
        if not sk:
            sk = Skill(name=sk_name, category="core")
            db.add(sk)
            db.commit()
            db.refresh(sk)
        
        exists = db.query(StudentSkill).filter(StudentSkill.student_id == st.id, StudentSkill.skill_id == sk.id).first()
        if not exists:
            db.add(StudentSkill(student_id=st.id, skill_id=sk.id, proficiency_level="intermediate", verified=True))

    db.commit()
    return {
        "status": "success",
        "message": f"Resume '{file.filename}' parsed and normalized successfully.",
        "extracted_skills": parsed.get("skills", []),
        "extracted_cgpa": parsed.get("cgpa")
    }

def _build_student_detail(st: Student) -> StudentDetailOut:
    sk_list = []
    sk_names = []
    for sk in st.skills:
        if sk.skill:
            sk_names.append(sk.skill.name)
            sk_list.append(StudentSkillOut(
                id=sk.id,
                skill_id=sk.skill.id,
                skill_name=sk.skill.name,
                category=sk.skill.category,
                proficiency_level=sk.proficiency_level,
                verified=sk.verified
            ))

    projects = [
        ProjectOut(
            id=p.id,
            title=p.title,
            description=p.description,
            tech_stack=p.tech_stack_json or [],
            github_link=p.github_link,
            live_link=p.live_link,
            duration_months=p.duration_months
        )
        for p in st.projects
    ]

    internships = [
        InternshipOut(
            id=i.id,
            company_name=i.company_name,
            role=i.role,
            description=i.description,
            duration_months=i.duration_months,
            certificate_url=i.certificate_url
        )
        for i in st.internships
    ]

    certifications = [
        CertificationOut(
            id=c.id,
            title=c.title,
            issuing_org=c.issuing_org,
            issue_date=c.issue_date,
            credential_url=c.credential_url
        )
        for c in st.certifications
    ]

    return StudentDetailOut(
        id=st.id,
        user_id=st.user_id,
        full_name=st.user.full_name if st.user else "",
        email=st.user.email if st.user else "",
        roll_number=st.roll_number,
        department=st.department,
        batch_year=st.batch_year,
        cgpa=st.cgpa,
        active_backlogs=st.active_backlogs,
        phone=st.phone,
        github_url=st.github_url,
        linkedin_url=st.linkedin_url,
        portfolio_url=st.portfolio_url,
        placement_status=st.placement_status,
        placement_readiness_score=st.placement_readiness_score,
        skills=sk_names,
        ai_profile_summary=st.ai_profile_summary,
        strengths=st.strengths_json or [],
        gaps=st.gaps_json or [],
        best_roles=st.best_roles_json or [],
        detailed_skills=sk_list,
        projects=projects,
        internships=internships,
        certifications=certifications,
        created_at=st.created_at
    )

@router.post("", response_model=StudentOut)
def create_student(
    data: StudentCreate,
    db: Session = Depends(get_db)
):
    email = data.email.lower().strip()
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    existing_roll = db.query(Student).filter(Student.roll_number == data.roll_number.strip()).first()
    if existing_roll:
        raise HTTPException(status_code=400, detail="Student with this roll number already exists")

    # 1. Create User
    user = User(
        email=email,
        hashed_password=get_password_hash(data.password or "password123"),
        full_name=data.full_name.strip(),
        role="student",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 2. Create Student
    student = Student(
        user_id=user.id,
        roll_number=data.roll_number.strip(),
        department=data.department,
        batch_year=data.batch_year,
        cgpa=data.cgpa,
        active_backlogs=data.active_backlogs,
        phone=data.phone,
        placement_status="unplaced",
        placement_readiness_score=65.0,
        ai_profile_summary=f"{data.department} undergraduate student specializing in {', '.join(data.skills[:3]) if data.skills else 'Software Engineering'}."
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    # 3. Add Skills
    sk_names = []
    for sk_raw in data.skills:
        clean_name = normalize_skill(sk_raw)
        sk = db.query(Skill).filter(Skill.name.ilike(clean_name)).first()
        if not sk:
            sk = Skill(name=clean_name, category="technical")
            db.add(sk)
            db.commit()
            db.refresh(sk)
        sk_names.append(sk.name)
        db.add(StudentSkill(student_id=student.id, skill_id=sk.id, proficiency_level="intermediate", verified=True))

    db.commit()

    # 4. Calculate initial readiness
    pred = placement_predictor.predict_readiness(student, db)
    student.placement_readiness_score = pred.readiness_score
    db.commit()
    db.refresh(student)

    return StudentOut(
        id=student.id,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        roll_number=student.roll_number,
        department=student.department,
        batch_year=student.batch_year,
        cgpa=student.cgpa,
        active_backlogs=student.active_backlogs,
        phone=student.phone,
        github_url=student.github_url,
        linkedin_url=student.linkedin_url,
        portfolio_url=student.portfolio_url,
        placement_status=student.placement_status,
        placement_readiness_score=student.placement_readiness_score,
        skills=sk_names,
        created_at=student.created_at
    )

@router.delete("/{student_id}")
def delete_student(
    student_id: int,
    db: Session = Depends(get_db)
):
    st = db.query(Student).filter(Student.id == student_id).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student not found")

    user_id = st.user_id
    full_name = st.user.full_name if st.user else "Student"
    roll_no = st.roll_number

    # Cascading deletions
    db.query(StudentSkill).filter(StudentSkill.student_id == student_id).delete()
    db.query(Resume).filter(Resume.student_id == student_id).delete()
    db.query(Project).filter(Project.student_id == student_id).delete()
    db.query(Internship).filter(Internship.student_id == student_id).delete()
    db.query(Certification).filter(Certification.student_id == student_id).delete()
    db.query(Application).filter(Application.student_id == student_id).delete()
    db.query(InterviewFeedback).filter(InterviewFeedback.student_id == student_id).delete()
    db.query(Placement).filter(Placement.student_id == student_id).delete()

    db.delete(st)
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            db.delete(user)

    db.commit()
    return {"message": f"Student '{full_name}' ({roll_no}) removed successfully", "id": student_id}

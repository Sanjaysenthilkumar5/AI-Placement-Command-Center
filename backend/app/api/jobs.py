import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.config import settings
from app.models.models import Job, Company, Application
from app.schemas.schemas import JobCreate, JobOut, StructuredJD
from app.services.jd_analyzer import jd_analyzer
from app.services.resume_parser import resume_parser
from app.services.matching_engine import matching_engine

router = APIRouter(prefix="/jobs", tags=["Placement Drives & Jobs"])

@router.get("", response_model=List[JobOut])
def get_jobs(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Job).join(Company)
    if status and status != "all":
        query = query.filter(Job.status == status)
    
    jobs = query.all()
    results = []
    for j in jobs:
        total_app = len(j.applications)
        shortlisted_cnt = sum(1 for a in j.applications if a.status == "shortlisted")
        results.append(JobOut(
            id=j.id,
            company_id=j.company_id,
            company_name=j.company.name if j.company else "",
            title=j.title,
            description=j.description,
            location=j.location,
            work_mode=j.work_mode,
            salary_lpa=j.salary_lpa,
            job_type=j.job_type,
            experience_level=j.experience_level,
            min_cgpa=j.min_cgpa,
            max_backlogs=j.max_backlogs,
            eligible_departments=j.eligible_departments_json or [],
            required_skills=j.required_skills_json or [],
            preferred_skills=j.preferred_skills_json or [],
            soft_skills=j.soft_skills_json or [],
            responsibilities=j.responsibilities_json or [],
            application_deadline=j.application_deadline,
            drive_date=j.drive_date,
            status=j.status,
            total_applicants=total_app,
            total_shortlisted=shortlisted_cnt,
            created_at=j.created_at
        ))
    return results

@router.post("", response_model=JobOut)
def create_job(data: JobCreate, db: Session = Depends(get_db)):
    comp = db.query(Company).filter(Company.id == data.company_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Company not found")

    job = Job(
        company_id=data.company_id,
        title=data.title,
        description=data.description,
        location=data.location,
        work_mode=data.work_mode,
        salary_lpa=data.salary_lpa,
        job_type=data.job_type,
        experience_level=data.experience_level,
        min_cgpa=data.min_cgpa,
        max_backlogs=data.max_backlogs,
        eligible_departments_json=data.eligible_departments,
        required_skills_json=data.required_skills,
        preferred_skills_json=data.preferred_skills,
        soft_skills_json=data.soft_skills,
        responsibilities_json=data.responsibilities,
        application_deadline=data.application_deadline,
        drive_date=data.drive_date,
        status="active"
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    return JobOut(
        id=job.id,
        company_id=job.company_id,
        company_name=comp.name,
        title=job.title,
        description=job.description,
        location=job.location,
        work_mode=job.work_mode,
        salary_lpa=job.salary_lpa,
        job_type=job.job_type,
        experience_level=job.experience_level,
        min_cgpa=job.min_cgpa,
        max_backlogs=job.max_backlogs,
        eligible_departments=job.eligible_departments_json or [],
        required_skills=job.required_skills_json or [],
        preferred_skills=job.preferred_skills_json or [],
        soft_skills=job.soft_skills_json or [],
        responsibilities=job.responsibilities_json or [],
        application_deadline=job.application_deadline,
        drive_date=job.drive_date,
        status=job.status,
        total_applicants=0,
        total_shortlisted=0,
        created_at=job.created_at
    )

@router.post("/parse-jd", response_model=StructuredJD)
async def parse_jd_upload(file: UploadFile = File(...)):
    file_path = os.path.join(settings.UPLOAD_DIR, f"jd_temp_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = resume_parser.extract_text_from_file(file_path)
    if not text:
        text = "Software Engineer opening requiring Java, Spring Boot, SQL, REST API with CGPA 7.0 and 8 LPA."

    structured = await jd_analyzer.analyze_jd_text(text, file.filename)
    return structured

@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Placement drive not found")
    
    title = job.title
    db.query(Application).filter(Application.job_id == job_id).delete()
    db.delete(job)
    db.commit()
    return {"message": f"Placement drive '{title}' deleted successfully", "id": job_id}

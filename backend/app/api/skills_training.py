from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Student, Job, TrainingProgram
from app.schemas.schemas import (
    CohortSkillDemandItem, StudentSkillGapOut,
    TrainingProgramCreate, TrainingProgramOut, StudentPrepPlan
)
from app.services.skill_gap_service import skill_gap_service
from app.services.training_service import training_service

router = APIRouter(prefix="/training", tags=["Skill Gaps & Training Programs"])

@router.get("/cohort-demand", response_model=List[CohortSkillDemandItem])
def get_cohort_skill_demand(db: Session = Depends(get_db)):
    return skill_gap_service.analyze_cohort_skill_demand(db)

@router.get("/student/{student_id}/gaps", response_model=StudentSkillGapOut)
def get_student_skill_gaps(student_id: int, job_id: Optional[int] = None, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    job = db.query(Job).filter(Job.id == job_id).first() if job_id else db.query(Job).first()
    if not job:
        raise HTTPException(status_code=404, detail="No active job found for comparison")

    return skill_gap_service.analyze_student_gaps_for_job(student, job)

@router.get("/student/{student_id}/prep-plan", response_model=StudentPrepPlan)
def get_student_preparation_plan(student_id: int, job_id: Optional[int] = None, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    job = db.query(Job).filter(Job.id == job_id).first() if job_id else db.query(Job).first()
    return training_service.generate_personalized_prep_plan(student, job)

@router.get("/programs", response_model=List[TrainingProgramOut])
def get_training_programs(db: Session = Depends(get_db)):
    programs = db.query(TrainingProgram).all()
    return [
        TrainingProgramOut(
            id=p.id,
            title=p.title,
            description=p.description,
            target_skill_name=p.target_skill_name,
            priority=p.priority,
            cohort_size=p.cohort_size,
            duration_weeks=p.duration_weeks,
            syllabus=p.syllabus_json or [],
            status=p.status,
            created_at=p.created_at
        )
        for p in programs
    ]

@router.post("/programs", response_model=TrainingProgramOut)
def create_training_program(data: TrainingProgramCreate, db: Session = Depends(get_db)):
    prog = TrainingProgram(
        title=data.title,
        description=data.description,
        target_skill_name=data.target_skill_name,
        priority=data.priority,
        cohort_size=data.cohort_size,
        duration_weeks=data.duration_weeks,
        syllabus_json=data.syllabus,
        status="planned"
    )
    db.add(prog)
    db.commit()
    db.refresh(prog)

    return TrainingProgramOut(
        id=prog.id,
        title=prog.title,
        description=prog.description,
        target_skill_name=prog.target_skill_name,
        priority=prog.priority,
        cohort_size=prog.cohort_size,
        duration_weeks=prog.duration_weeks,
        syllabus=prog.syllabus_json or [],
        status=prog.status,
        created_at=prog.created_at
    )

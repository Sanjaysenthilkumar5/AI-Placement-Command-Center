from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Job, Student, Application, AuditLog
from app.schemas.schemas import CandidateMatchOut, XAIAnalysisOut, MatchWeightConfig, ShortlistActionRequest
from app.services.matching_engine import matching_engine

router = APIRouter(prefix="/matching", tags=["Candidate Matching & Ranking"])

@router.post("/weights")
def update_default_weights(weights: MatchWeightConfig):
    matching_engine.default_weights = weights
    return {"status": "success", "message": "Scoring weights updated successfully", "weights": weights}

@router.get("/jobs/{job_id}/candidates", response_model=List[CandidateMatchOut])
def get_job_candidates_ranked(
    job_id: int,
    department: Optional[str] = None,
    min_score: Optional[float] = None,
    eligibility_only: bool = False,
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job drive not found")

    students = db.query(Student).all()
    ranked_list = []

    for st in students:
        if department and department != "All" and st.department != department:
            continue

        score, breakdown, xai = matching_engine.evaluate_candidate(st, job)

        if eligibility_only and not breakdown.is_eligible:
            continue
        if min_score is not None and score < min_score:
            continue

        # Check existing application status
        app = db.query(Application).filter(Application.job_id == job.id, Application.student_id == st.id).first()
        status = app.status if app else ("shortlisted" if score >= 85.0 else ("eligible" if breakdown.is_eligible else "ineligible"))

        ranked_list.append({
            "student_id": st.id,
            "student_name": st.user.full_name if st.user else f"Student #{st.id}",
            "roll_number": st.roll_number,
            "department": st.department,
            "cgpa": st.cgpa,
            "backlogs": st.active_backlogs,
            "placement_status": st.placement_status,
            "match_score": score,
            "is_eligible": breakdown.is_eligible,
            "status": status,
            "matched_skills_count": len(xai.matched_required_skills),
            "total_required_skills": len(job.required_skills_json or []),
            "missing_skills": xai.missing_required_skills,
            "ai_summary": xai.ai_recommendation[:140] + "..." if len(xai.ai_recommendation) > 140 else xai.ai_recommendation
        })

    # Sort descending by eligibility, then match score
    ranked_list.sort(key=lambda x: (x["is_eligible"], x["match_score"]), reverse=True)

    result = []
    for rank_idx, item in enumerate(ranked_list):
        result.append(CandidateMatchOut(
            rank=rank_idx + 1,
            **item
        ))

    return result

@router.get("/jobs/{job_id}/candidates/{student_id}/analysis", response_model=XAIAnalysisOut)
def get_candidate_xai_analysis(job_id: int, student_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    student = db.query(Student).filter(Student.id == student_id).first()
    if not job or not student:
        raise HTTPException(status_code=404, detail="Job or Student not found")

    score, breakdown, xai = matching_engine.evaluate_candidate(student, job)
    return xai

@router.post("/jobs/{job_id}/action")
def update_candidate_status(job_id: int, req: ShortlistActionRequest, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    student = db.query(Student).filter(Student.id == req.student_id).first()
    if not job or not student:
        raise HTTPException(status_code=404, detail="Job or Student not found")

    app = db.query(Application).filter(Application.job_id == job_id, Application.student_id == req.student_id).first()
    if not app:
        score, breakdown, xai = matching_engine.evaluate_candidate(student, job)
        app = Application(
            job_id=job_id,
            student_id=req.student_id,
            status=req.action,
            match_score=score,
            match_breakdown_json=breakdown.model_dump(),
            ai_recommendation=xai.ai_recommendation
        )
        db.add(app)
    else:
        app.status = req.action

    if req.action == "shortlisted":
        student.placement_status = "shortlisted"

    # Audit log
    db.add(AuditLog(
        user_name="Placement Officer",
        role="admin",
        action=f"Updated status of {student.user.full_name if student.user else 'Student'} to '{req.action}' for {job.title}",
        entity_type="Application",
        entity_id=app.id if app else 0,
        details_json={"notes": req.notes}
    ))

    db.commit()
    return {"status": "success", "new_status": req.action, "student_id": req.student_id}

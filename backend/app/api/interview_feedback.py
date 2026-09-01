from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import InterviewFeedback, Student, Application
from app.schemas.schemas import InterviewFeedbackCreate, InterviewFeedbackOut
from app.services.placement_predictor import placement_predictor

router = APIRouter(prefix="/interview-feedback", tags=["Interview Feedback"])

@router.get("", response_model=List[InterviewFeedbackOut])
def get_all_feedbacks(db: Session = Depends(get_db)):
    feedbacks = db.query(InterviewFeedback).join(Student).all()
    results = []
    for f in feedbacks:
        avg = round((f.technical_score + f.communication_score + f.aptitude_score + f.problem_solving_score + f.confidence_score) / 5.0, 1)
        results.append(InterviewFeedbackOut(
            id=f.id,
            student_id=f.student_id,
            student_name=f.student.user.full_name if f.student and f.student.user else f"Student #{f.student_id}",
            round_name=f.round_name,
            technical_score=f.technical_score,
            communication_score=f.communication_score,
            aptitude_score=f.aptitude_score,
            problem_solving_score=f.problem_solving_score,
            confidence_score=f.confidence_score,
            average_score=avg,
            hr_feedback=f.hr_feedback,
            technical_feedback=f.technical_feedback,
            final_verdict=f.final_verdict,
            created_at=f.created_at
        ))
    return results

@router.post("", response_model=InterviewFeedbackOut)
def record_interview_feedback(data: InterviewFeedbackCreate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    fb = InterviewFeedback(
        application_id=data.application_id,
        student_id=data.student_id,
        round_name=data.round_name,
        technical_score=data.technical_score,
        communication_score=data.communication_score,
        aptitude_score=data.aptitude_score,
        problem_solving_score=data.problem_solving_score,
        confidence_score=data.confidence_score,
        hr_feedback=data.hr_feedback,
        technical_feedback=data.technical_feedback,
        final_verdict=data.final_verdict
    )
    db.add(fb)

    # Recalculate student placement readiness
    pred = placement_predictor.predict_readiness(student, db)
    student.placement_readiness_score = pred.readiness_score

    db.commit()
    db.refresh(fb)

    avg = round((fb.technical_score + fb.communication_score + fb.aptitude_score + fb.problem_solving_score + fb.confidence_score) / 5.0, 1)
    return InterviewFeedbackOut(
        id=fb.id,
        student_id=fb.student_id,
        student_name=student.user.full_name if student.user else "",
        round_name=fb.round_name,
        technical_score=fb.technical_score,
        communication_score=fb.communication_score,
        aptitude_score=fb.aptitude_score,
        problem_solving_score=fb.problem_solving_score,
        confidence_score=fb.confidence_score,
        average_score=avg,
        hr_feedback=fb.hr_feedback,
        technical_feedback=fb.technical_feedback,
        final_verdict=fb.final_verdict,
        created_at=fb.created_at
    )

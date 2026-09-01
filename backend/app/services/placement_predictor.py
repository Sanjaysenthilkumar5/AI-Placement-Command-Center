from typing import List, Dict
from sqlalchemy.orm import Session
from app.models.models import Student
from app.schemas.schemas import PlacementPredictionOut

class PlacementPredictor:
    def predict_readiness(self, student: Student, db: Session = None) -> PlacementPredictionOut:
        """Calculates multi-factor AI Placement Readiness Index and factor breakdown."""
        # 1. CGPA Factor (Weight: 25%)
        cgpa_score = min(100.0, max(0.0, (student.cgpa / 10.0) * 100.0))

        # 2. Technical Skill Depth Factor (Weight: 30%)
        skill_count = len(student.skills)
        verified_skills = sum(1 for s in student.skills if s.verified)
        skill_score = min(100.0, (skill_count * 10.0) + (verified_skills * 5.0))

        # 3. Project & Practical Portfolio Factor (Weight: 20%)
        proj_count = len(student.projects)
        intern_count = len(student.internships)
        cert_count = len(student.certifications)
        portfolio_score = min(100.0, (proj_count * 25.0) + (intern_count * 30.0) + (cert_count * 15.0))

        # 4. Interview Feedback History Factor (Weight: 25%)
        feedbacks = student.interview_feedbacks
        if feedbacks:
            avg_tech = sum(f.technical_score for f in feedbacks) / len(feedbacks)
            avg_comm = sum(f.communication_score for f in feedbacks) / len(feedbacks)
            avg_prob = sum(f.problem_solving_score for f in feedbacks) / len(feedbacks)
            interview_score = ((avg_tech + avg_comm + avg_prob) / 3.0) * 10.0
        else:
            interview_score = 70.0  # baseline default if no mock interview recorded yet

        # Backlog penalty
        backlog_penalty = student.active_backlogs * 25.0

        # Weighted Readiness Index
        composite_score = (
            (cgpa_score * 0.25) +
            (skill_score * 0.30) +
            (portfolio_score * 0.20) +
            (interview_score * 0.25)
        ) - backlog_penalty

        composite_score = round(max(10.0, min(99.0, composite_score)), 1)

        # Categorize
        if composite_score >= 80.0:
            category = "HIGH"
        elif composite_score >= 65.0:
            category = "MEDIUM"
        elif composite_score >= 50.0:
            category = "MODERATE"
        else:
            category = "LOW"

        # Factors breakdown
        factors = {
            "Academic Performance (CGPA)": round(cgpa_score, 1),
            "Technical Skill Inventory": round(skill_score, 1),
            "Project & Internship Portfolio": round(portfolio_score, 1),
            "Interview & Communication Rating": round(interview_score, 1)
        }

        # Strengths & Improvement points
        strengths = []
        improvements = []
        if cgpa_score >= 80.0:
            strengths.append(f"Strong academic foundation ({student.cgpa:.2f} CGPA)")
        else:
            improvements.append("Aim to maximize semester grades to clear Tier-1 CGPA filters")

        if skill_count >= 5:
            strengths.append(f"Diverse technical stack ({skill_count} tracked skills)")
        else:
            improvements.append("Expand skill portfolio with high-demand frameworks like Spring Boot or React")

        if proj_count >= 2:
            strengths.append(f"Demonstrated project portfolio ({proj_count} practical projects)")
        else:
            improvements.append("Build at least 2 full-stack end-to-end projects on GitHub")

        if feedbacks and interview_score < 70.0:
            improvements.append("Participate in behavioral mock interviews to improve communication clarity")

        if student.active_backlogs > 0:
            improvements.append(f"Urgent: Clear {student.active_backlogs} pending active backlogs")

        return PlacementPredictionOut(
            student_id=student.id,
            student_name=student.user.full_name if student.user else f"Student #{student.id}",
            readiness_score=composite_score,
            category=category,
            factors=factors,
            strengths=strengths,
            areas_to_improve=improvements
        )

placement_predictor = PlacementPredictor()

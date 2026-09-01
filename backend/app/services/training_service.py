from typing import List
from sqlalchemy.orm import Session
from app.models.models import Student, Job, TrainingProgram
from app.schemas.schemas import StudentPrepPlan, PrepPlanWeek

class TrainingService:
    def generate_personalized_prep_plan(self, student: Student, target_job: Job = None) -> StudentPrepPlan:
        """Creates a personalized 4-week technical and behavioral preparation roadmap."""
        student_skills = {s.skill.name.lower() for s in student.skills if s.skill}
        
        target_title = target_job.title if target_job else "Software Engineer"
        target_skills = (target_job.required_skills_json if target_job else ["Java", "SQL", "DSA", "REST API"]) or ["Java", "SQL"]

        missing_skills = [s for s in target_skills if s.lower() not in student_skills]
        focus_1 = missing_skills[0] if len(missing_skills) > 0 else (target_skills[0] if target_skills else "SQL")
        focus_2 = missing_skills[1] if len(missing_skills) > 1 else ("DSA" if "dsa" not in student_skills else "System Design")

        week_1 = PrepPlanWeek(
            week_number=1,
            focus_title=f"Core Foundations & Relational Data ({focus_1})",
            topics=[
                f"{focus_1} Architecture and Core Syntax Fundamentals",
                "Advanced Joins, Group By, Aggregation & Subqueries",
                "Indexing, Query Optimization & Transaction Isolation"
            ],
            practical_exercises=[
                f"Solve 15 medium-level {focus_1} problems on platform",
                "Build a normalized database schema with foreign key constraints"
            ],
            target_skill=focus_1
        )

        week_2 = PrepPlanWeek(
            week_number=2,
            focus_title=f"Data Structures & Algorithmic Problem Solving ({focus_2})",
            topics=[
                "Arrays, Strings, Hash Maps & Two Pointers",
                "Trees, Binary Search, BFS/DFS Graphs",
                "Dynamic Programming & Space-Time Complexity Analysis"
            ],
            practical_exercises=[
                "Solve 20 curated LeetCode top interview questions",
                "Conduct 1 timed live coding session"
            ],
            target_skill=focus_2
        )

        week_3 = PrepPlanWeek(
            week_number=3,
            focus_title="Backend Microservices & REST API Design",
            topics=[
                "RESTful API Best Practices & HTTP Status Codes",
                "JWT Authentication, Role Authorization & Middleware",
                "Docker Containerization & CI/CD Pipeline integration"
            ],
            practical_exercises=[
                "Deploy a containerized CRUD microservice with unit tests",
                "Integrate Swagger/OpenAPI documentation"
            ],
            target_skill="REST API"
        )

        week_4 = PrepPlanWeek(
            week_number=4,
            focus_title="Mock Technical Rounds & HR Communication",
            topics=[
                "STAR Technique for Behavioral and Leadership Questions",
                "System Architecture Walkthrough for Resume Projects",
                "Handling Edge Cases in Live Coding & Resume Pitching"
            ],
            practical_exercises=[
                "Complete 2 peer mock technical interview simulations",
                "Refine 2-minute self-introduction and project elevator pitch"
            ],
            target_skill="Communication"
        )

        readiness_before = student.placement_readiness_score or 65.0
        readiness_after = min(98.0, readiness_before + 24.0)

        return StudentPrepPlan(
            student_id=student.id,
            student_name=student.user.full_name if student.user else f"Student #{student.id}",
            target_role=target_title,
            estimated_readiness_before=round(readiness_before, 1),
            estimated_readiness_after=round(readiness_after, 1),
            weekly_schedule=[week_1, week_2, week_3, week_4],
            ai_advisor_note=(
                f"Prioritize Week 1 ({focus_1}) and Week 2 ({focus_2}) diligently. "
                "Consistent problem solving over the next 28 days will substantially improve technical interview conversion."
            )
        )

training_service = TrainingService()

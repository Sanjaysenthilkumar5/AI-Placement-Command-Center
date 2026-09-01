from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import Student, Job, Skill
from app.schemas.schemas import SkillGapCategory, StudentSkillGapOut, CohortSkillDemandItem

class SkillGapService:
    def analyze_student_gaps_for_job(self, student: Student, job: Job) -> StudentSkillGapOut:
        """Categorizes student skills into Strong, Moderate, Missing against target Job."""
        student_skills = {s.skill.name.lower(): (s.skill.name, s.proficiency_level) for s in student.skills if s.skill}
        
        req_skills = job.required_skills_json or []
        pref_skills = job.preferred_skills_json or []
        all_target_skills = list(dict.fromkeys(req_skills + pref_skills))

        strong = []
        moderate = []
        missing = []

        for skill_name in all_target_skills:
            lower = skill_name.lower()
            if lower in student_skills:
                canon_name, prof = student_skills[lower]
                if prof in ["advanced", "intermediate"]:
                    strong.append(canon_name)
                else:
                    moderate.append(canon_name)
            else:
                missing.append(skill_name)

        total = len(all_target_skills)
        match_pct = round(((len(strong) + 0.5 * len(moderate)) / total * 100.0), 1) if total > 0 else 100.0

        recommendations = []
        if missing:
            recommendations.append(f"Complete hands-on tutorial and mini-project covering {', '.join(missing[:3])}.")
        if moderate:
            recommendations.append(f"Level up proficiency from beginner to intermediate in {', '.join(moderate[:2])}.")
        if not missing and not moderate:
            recommendations.append("All primary skills met! Focus on system design and mock behavioral interviews.")

        gaps = SkillGapCategory(
            strong=strong,
            moderate=moderate,
            missing=missing,
            overall_skill_match_pct=match_pct
        )

        return StudentSkillGapOut(
            student_id=student.id,
            student_name=student.user.full_name if student.user else f"Student #{student.id}",
            target_job_title=job.title,
            gaps=gaps,
            recommendations=recommendations
        )

    def analyze_cohort_skill_demand(self, db: Session) -> List[CohortSkillDemandItem]:
        """Aggregates all active job openings and compares with student pool to compute campus training priorities."""
        jobs = db.query(Job).filter(Job.status == "active").all()
        students = db.query(Student).all()
        total_students = len(students) or 1
        total_jobs = len(jobs) or 1

        # Count demand frequency across JDs
        skill_demand_counts: Dict[str, int] = {}
        for j in jobs:
            skills = (j.required_skills_json or []) + (j.preferred_skills_json or [])
            for s in set(skills):
                skill_demand_counts[s] = skill_demand_counts.get(s, 0) + 1

        # Count how many students possess each demanded skill
        student_skill_map: Dict[str, int] = {}
        for st in students:
            st_skills = {s.skill.name.lower() for s in st.skills if s.skill}
            for s in skill_demand_counts.keys():
                if s.lower() in st_skills:
                    student_skill_map[s] = student_skill_map.get(s, 0) + 1

        results = []
        for skill, job_count in skill_demand_counts.items():
            demand_pct = round((job_count / total_jobs) * 100.0, 1)
            students_with_skill = student_skill_map.get(skill, 0)
            unmet_count = max(0, total_students - students_with_skill)
            
            if demand_pct >= 50.0 or unmet_count >= int(total_students * 0.4):
                priority = "HIGH"
            elif demand_pct >= 25.0:
                priority = "MEDIUM"
            else:
                priority = "LOW"

            results.append(CohortSkillDemandItem(
                skill=skill,
                demand_pct=demand_pct,
                unmet_student_count=unmet_count,
                priority=priority
            ))

        # Sort descending by demand and unmet students
        results.sort(key=lambda x: (x.priority == "HIGH", x.demand_pct, x.unmet_student_count), reverse=True)
        return results

skill_gap_service = SkillGapService()

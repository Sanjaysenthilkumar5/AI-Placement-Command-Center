from typing import List, Dict, Any, Tuple
from app.models.models import Student, Job
from app.schemas.schemas import MatchWeightConfig, CandidateMatchBreakdown, XAIAnalysisOut, CandidateMatchOut
from app.services.ai_provider import ai_provider

class MatchingEngine:
    def __init__(self):
        self.default_weights = MatchWeightConfig()

    def evaluate_candidate(
        self,
        student: Student,
        job: Job,
        weights: MatchWeightConfig = None
    ) -> Tuple[float, CandidateMatchBreakdown, XAIAnalysisOut]:
        w = weights or self.default_weights

        # 1. Eligibility Check
        is_eligible = True
        eligibility_reasons = []
        
        # CGPA check
        if student.cgpa < job.min_cgpa:
            is_eligible = False
            eligibility_reasons.append(f"CGPA ({student.cgpa:.2f}) is below requirement ({job.min_cgpa:.2f})")
        else:
            eligibility_reasons.append(f"CGPA ({student.cgpa:.2f}) meets cutoff ({job.min_cgpa:.2f})")

        # Backlogs check
        if student.active_backlogs > job.max_backlogs:
            is_eligible = False
            eligibility_reasons.append(f"Active backlogs ({student.active_backlogs}) exceed allowed ({job.max_backlogs})")
        else:
            eligibility_reasons.append("Zero/permitted active backlogs")

        # Department check
        eligible_depts = job.eligible_departments_json or []
        if eligible_depts and student.department not in eligible_depts:
            is_eligible = False
            eligibility_reasons.append(f"Department ({student.department}) is not in eligible list ({', '.join(eligible_depts)})")
        else:
            eligibility_reasons.append(f"Department ({student.department}) is eligible")

        eligibility_score = 100.0 if is_eligible else 20.0

        # 2. Extract Student Skills
        student_skill_names = {}
        for s in (student.skills or []):
            if s and s.skill:
                student_skill_names[s.skill.name.lower()] = s.skill.name
        
        # 3. Required Skills Match
        required_skills = job.required_skills_json or []
        matched_required = []
        missing_required = []
        for req in required_skills:
            if req.lower() in student_skill_names:
                matched_required.append(req)
            else:
                missing_required.append(req)
        
        req_match_pct = (len(matched_required) / len(required_skills) * 100.0) if required_skills else 100.0

        # 4. Preferred Skills Match
        preferred_skills = job.preferred_skills_json or []
        matched_preferred = []
        missing_preferred = []
        for pref in preferred_skills:
            if pref.lower() in student_skill_names:
                matched_preferred.append(pref)
            else:
                missing_preferred.append(pref)
        
        pref_match_pct = (len(matched_preferred) / len(preferred_skills) * 100.0) if preferred_skills else 100.0

        # 5. Soft Skills Match
        soft_skills = job.soft_skills_json or []
        matched_soft = []
        for soft in soft_skills:
            if soft.lower() in student_skill_names:
                matched_soft.append(soft)
        soft_match_pct = (len(matched_soft) / len(soft_skills) * 100.0) if soft_skills else 85.0

        # 6. Projects Relevance
        relevant_projects = []
        project_score = 40.0
        job_all_skills = [s.lower() for s in (required_skills + preferred_skills)]
        
        for proj in (student.projects or []):
            tech_stack = [t.lower() for t in (proj.tech_stack_json or [])]
            overlap = [t for t in tech_stack if t in job_all_skills]
            if overlap:
                relevant_projects.append(f"{proj.title} ({', '.join(overlap)})")
                project_score += 25.0
        project_score = min(100.0, project_score)

        # 7. Internships Relevance
        relevant_internships = []
        internship_score = 30.0
        for intern in (student.internships or []):
            relevant_internships.append(f"{intern.role} at {intern.company_name} ({intern.duration_months} mos)")
            internship_score += 35.0
        internship_score = min(100.0, internship_score)

        # 8. CGPA Relative Score
        cgpa_score = min(100.0, max(0.0, (student.cgpa / 10.0) * 100.0))

        # 9. Certifications Score
        cert_score = min(100.0, 40.0 + len(student.certifications or []) * 30.0)

        # 10. Overall Technical Experience Score
        exp_score = min(100.0, 50.0 + (len(student.projects or []) * 15.0) + (len(student.internships or []) * 20.0))

        # Weighted Total
        raw_weighted_score = (
            (eligibility_score * w.eligibility_weight) +
            (req_match_pct * w.required_skills_weight) +
            (pref_match_pct * w.preferred_skills_weight) +
            (project_score * w.projects_weight) +
            (internship_score * w.internships_weight) +
            (cgpa_score * w.cgpa_weight) +
            (exp_score * w.experience_weight) +
            (soft_match_pct * w.soft_skills_weight) +
            (cert_score * w.certifications_weight)
        )

        final_score = raw_weighted_score if is_eligible else min(raw_weighted_score, 45.0)
        final_score = round(max(0.0, min(100.0, final_score)), 1)

        breakdown = CandidateMatchBreakdown(
            eligibility_score=round(eligibility_score, 1),
            required_skills_score=round(req_match_pct, 1),
            preferred_skills_score=round(pref_match_pct, 1),
            projects_score=round(project_score, 1),
            internships_score=round(internship_score, 1),
            cgpa_score=round(cgpa_score, 1),
            experience_score=round(exp_score, 1),
            soft_skills_score=round(soft_match_pct, 1),
            certifications_score=round(cert_score, 1),
            is_eligible=is_eligible,
            eligibility_reasons=eligibility_reasons
        )

        strengths = []
        for s in matched_required:
            strengths.append(f"Required technical skill '{s}' matched")
        if relevant_projects:
            strengths.append(f"Demonstrated project practical experience: {relevant_projects[0]}")
        if relevant_internships:
            strengths.append(f"Relevant industry internship: {relevant_internships[0]}")
        if is_eligible and student.cgpa >= 8.0:
            strengths.append(f"Strong academic record with {student.cgpa:.2f} CGPA")

        gaps = []
        for s in missing_required:
            gaps.append(f"Missing required core skill: '{s}'")
        for s in missing_preferred:
            gaps.append(f"Missing preferred skill: '{s}'")
        if not is_eligible:
            gaps.append(f"Eligibility constraint: {eligibility_reasons[0]}")

        if not is_eligible:
            recommendation = (
                f"Candidate does not meet mandatory drive eligibility criteria ({eligibility_reasons[0]}). "
                "Recommendation: Reject or refer for off-campus drive if special dispensation is granted."
            )
        elif final_score >= 85.0:
            recommendation = (
                f"Top Tier Candidate ({final_score}% match). Matches {len(matched_required)}/{len(required_skills)} required core skills. "
                f"Strong project portfolio aligned with {job.title}. Recommendation: Direct Shortlist for Round 1 Interview."
            )
        elif final_score >= 70.0:
            missing_str = ", ".join(missing_required[:2]) if missing_required else "secondary tools"
            recommendation = (
                f"Promising Candidate ({final_score}% match). Good foundational competencies. "
                f"Main gaps observed: {missing_str}. Recommendation: Shortlist with targeted technical preparation before drive."
            )
        else:
            recommendation = (
                f"Moderate/Low Alignment ({final_score}% match). Candidate has substantial skill gaps in {', '.join(missing_required[:3])}. "
                "Recommendation: Recommend completion of dedicated training program before re-evaluation."
            )

        st_id = student.id if student.id is not None else 1
        j_id = job.id if job.id is not None else 1
        st_name = (student.user.full_name if student.user else f"Student #{st_id}") or f"Student #{st_id}"
        comp_name = (job.company.name if job.company else "Company") or "Company"

        xai_analysis = XAIAnalysisOut(
            student_id=st_id,
            student_name=st_name,
            department=student.department or "CSE",
            cgpa=student.cgpa,
            job_id=j_id,
            job_title=job.title or "Software Engineer",
            company_name=comp_name,
            match_score=final_score,
            is_eligible=is_eligible,
            breakdown=breakdown,
            matched_required_skills=matched_required,
            missing_required_skills=missing_required,
            matched_preferred_skills=matched_preferred,
            missing_preferred_skills=missing_preferred,
            matched_soft_skills=matched_soft,
            relevant_projects=relevant_projects,
            relevant_internships=relevant_internships,
            strengths_rationale=strengths,
            skill_gaps_rationale=gaps,
            ai_recommendation=recommendation
        )

        return final_score, breakdown, xai_analysis

matching_engine = MatchingEngine()

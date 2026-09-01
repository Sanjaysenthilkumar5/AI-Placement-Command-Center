import re
from typing import Dict, Any, List
from app.services.ai_provider import extract_skills_from_text, ai_provider, normalize_skill
from app.schemas.schemas import StructuredJD

class JDAnalyzer:
    async def analyze_jd_text(self, jd_text: str, filename: str = "") -> StructuredJD:
        """Parses JD into structured model using hybrid regex extraction + LLM."""
        text = jd_text.strip()

        # Title heuristic
        title = "Software Engineer"
        first_lines = [l.strip() for l in text.split("\n") if len(l.strip()) > 3]
        if first_lines:
            for l in first_lines[:5]:
                if re.search(r'(engineer|developer|analyst|associate|intern|specialist|architect)', l, re.IGNORECASE):
                    title = re.sub(r'^(role|position|job title|title)[:\s-]*', '', l, flags=re.IGNORECASE).strip()
                    break

        # Salary heuristic
        salary = 6.0
        sal_match = re.search(r'(?:ctc|package|salary|lpa|inr|₹)[\s:]*([0-9]+(?:\.[0-9]+)?)\s*(?:lpa|lakhs|lakh)?', text, re.IGNORECASE)
        if sal_match:
            try:
                val = float(sal_match.group(1))
                if 2.0 <= val <= 80.0:
                    salary = val
            except ValueError:
                pass

        # CGPA cutoff heuristic
        min_cgpa = 6.5
        cgpa_match = re.search(r'(?:cgpa|gpa|percentage|pointer)[\s:>=]*([0-9]+(?:\.[0-9]+)?)', text, re.IGNORECASE)
        if cgpa_match:
            try:
                val = float(cgpa_match.group(1))
                if 5.0 <= val <= 10.0:
                    min_cgpa = val
                elif 50.0 <= val <= 100.0:
                    min_cgpa = round(val / 10.0, 1)
            except ValueError:
                pass

        # Backlogs cutoff
        max_backlogs = 0
        if re.search(r'no\s*(?:active\s*)?backlogs|0\s*backlogs|zero\s*backlogs', text, re.IGNORECASE):
            max_backlogs = 0
        elif re.search(r'up to (\d+) backlogs?|max (\d+) backlogs?', text, re.IGNORECASE):
            m = re.search(r'(\d+)', text)
            if m:
                max_backlogs = int(m.group(1))

        # Eligible branches
        eligible_depts = []
        if re.search(r'\b(cse|computer science)\b', text, re.IGNORECASE):
            eligible_depts.append("CSE")
        if re.search(r'\b(it|information technology)\b', text, re.IGNORECASE):
            eligible_depts.append("IT")
        if re.search(r'\b(ece|electronics)\b', text, re.IGNORECASE):
            eligible_depts.append("ECE")
        if re.search(r'\b(eee|electrical)\b', text, re.IGNORECASE):
            eligible_depts.append("EEE")
        if re.search(r'\b(mech|mechanical)\b', text, re.IGNORECASE):
            eligible_depts.append("MECH")
        if not eligible_depts:
            eligible_depts = ["CSE", "IT", "ECE"]

        # Skill Extraction
        all_skills = extract_skills_from_text(text)
        
        # Heuristically split required vs preferred vs soft skills
        soft_skills_vocab = {"Communication", "Teamwork", "Problem Solving", "Leadership", "Time Management", "Agile", "Scrum"}
        soft_skills = [s for s in all_skills if s in soft_skills_vocab]
        tech_skills = [s for s in all_skills if s not in soft_skills_vocab]

        # First 60% tech skills are required, remainder preferred
        split_idx = max(1, int(len(tech_skills) * 0.7))
        required_skills = tech_skills[:split_idx] if tech_skills else ["Java", "SQL", "DSA"]
        preferred_skills = tech_skills[split_idx:] if len(tech_skills) > split_idx else ["AWS", "Docker"]
        if not soft_skills:
            soft_skills = ["Communication", "Problem Solving"]

        # Responsibilities
        responsibilities = []
        resp_section = re.findall(r'(?:Responsibilities|Key Deliverables|What you will do)[:\n]+(.*?)(?=\n[A-Z]{3,}|\Z)', text, re.DOTALL | re.IGNORECASE)
        if resp_section:
            lines = [l.strip().lstrip('•-–* ') for l in resp_section[0].split('\n') if len(l.strip()) > 10]
            responsibilities = lines[:5]
        if not responsibilities:
            responsibilities = [
                "Design, develop, and maintain clean scalable software applications.",
                "Collaborate with cross-functional engineering and product teams.",
                "Participate in code reviews and active agile sprint cycles."
            ]

        summary = f"Opening for {title} requiring {', '.join(required_skills[:4])} with minimum CGPA {min_cgpa} and CTC ₹{salary} LPA."

        return StructuredJD(
            job_title=title,
            experience_level="Fresher",
            salary_lpa=salary,
            min_cgpa=min_cgpa,
            max_backlogs=max_backlogs,
            eligible_departments=eligible_depts,
            required_skills=required_skills,
            preferred_skills=preferred_skills,
            soft_skills=soft_skills,
            responsibilities=responsibilities,
            summary=summary
        )

jd_analyzer = JDAnalyzer()

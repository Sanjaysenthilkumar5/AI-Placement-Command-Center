import re
import os
from typing import Dict, Any, List, Optional
from pypdf import PdfReader
import docx
from app.services.ai_provider import extract_skills_from_text, normalize_skill

class ResumeParser:
    def extract_text_from_file(self, file_path: str) -> str:
        """Extracts raw text from PDF, DOCX or TXT files."""
        if not os.path.exists(file_path):
            return ""
        ext = os.path.splitext(file_path)[1].lower()
        
        text = ""
        try:
            if ext == ".pdf":
                reader = PdfReader(file_path)
                for page in reader.pages:
                    t = page.extract_text()
                    if t:
                        text += t + "\n"
            elif ext in [".docx", ".doc"]:
                doc = docx.Document(file_path)
                text = "\n".join([p.text for p in doc.paragraphs if p.text])
            else:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()
        except Exception as e:
            print(f"[ResumeParser] Error reading {file_path}: {e}")
        return text.strip()

    def parse_resume_content(self, text: str) -> Dict[str, Any]:
        """Extracts structured entities from resume text."""
        # 1. Contact information
        email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
        email = email_match.group(0) if email_match else ""

        phone_match = re.search(r'(?:\+?91[\-\s]?)?[6-9]\d{9}', text)
        phone = phone_match.group(0) if phone_match else ""

        github_match = re.search(r'github\.com/([a-zA-Z0-9_-]+)', text, re.IGNORECASE)
        github_url = f"https://{github_match.group(0)}" if github_match else ""

        linkedin_match = re.search(r'linkedin\.com/in/([a-zA-Z0-9_-]+)', text, re.IGNORECASE)
        linkedin_url = f"https://{linkedin_match.group(0)}" if linkedin_match else ""

        # 2. CGPA Extraction
        cgpa = 0.0
        cgpa_match = re.search(r'(?:cgpa|gpa|score|percentage)[\s:]*([0-9]+(?:\.[0-9]+)?)', text, re.IGNORECASE)
        if cgpa_match:
            try:
                val = float(cgpa_match.group(1))
                if val <= 10.0:
                    cgpa = val
                elif val > 10.0 and val <= 100.0:
                    cgpa = round(val / 10.0, 2)
            except ValueError:
                pass
        
        # 3. Department Extraction
        dept = "CSE"
        if re.search(r'\b(information technology|it)\b', text, re.IGNORECASE):
            dept = "IT"
        elif re.search(r'\b(electronics|ece|communication)\b', text, re.IGNORECASE):
            dept = "ECE"
        elif re.search(r'\b(electrical|eee)\b', text, re.IGNORECASE):
            dept = "EEE"
        elif re.search(r'\b(mechanical|mech)\b', text, re.IGNORECASE):
            dept = "MECH"

        # 4. Normalized Skills
        skills = extract_skills_from_text(text)

        # 5. Projects Extraction
        projects = []
        project_sections = re.findall(r'(?:Project|PROJECTS?|Academic Projects?)[:\n]+(.*?)(?=\n[A-Z]{3,}|\Z)', text, re.DOTALL | re.IGNORECASE)
        if project_sections:
            proj_text = project_sections[0]
            items = [p.strip() for p in proj_text.split('\n\n') if len(p.strip()) > 15]
            for it in items[:4]:
                lines = it.split('\n')
                title = lines[0].replace('*', '').replace('#', '').strip()
                desc = " ".join(lines[1:]).strip() if len(lines) > 1 else title
                proj_skills = extract_skills_from_text(it)
                projects.append({
                    "title": title[:100],
                    "description": desc[:300],
                    "tech_stack": proj_skills
                })

        return {
            "email": email,
            "phone": phone,
            "github_url": github_url,
            "linkedin_url": linkedin_url,
            "cgpa": cgpa,
            "department": dept,
            "skills": skills,
            "projects": projects,
            "raw_text_length": len(text)
        }

resume_parser = ResumeParser()

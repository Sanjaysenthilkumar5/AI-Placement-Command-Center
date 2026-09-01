import datetime
import random
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import (
    User, Student, Skill, StudentSkill, Resume, Project, Internship,
    Certification, Company, Job, Application, InterviewFeedback,
    TrainingProgram, Placement, Document, DocumentChunk, AIEvalBenchmark,
    Notification, AuditLog
)
from app.services.rag_service import rag_service
from app.services.matching_engine import matching_engine

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    if db.query(User).count() > 10:
        print("[Seed] Database already seeded.")
        db.close()
        return

    print("[Seed] Seeding rich demo dataset...")

    # 1. Normalized Skills
    skills_data = [
        ("Python", "core"), ("Java", "core"), ("C++", "core"), ("C#", "core"),
        ("JavaScript", "frontend"), ("TypeScript", "frontend"), ("DSA", "core"),
        ("OOP", "core"), ("Operating Systems", "core"), ("DBMS", "core"), ("Computer Networks", "core"),
        ("React", "frontend"), ("Angular", "frontend"), ("Vue.js", "frontend"),
        ("HTML5", "frontend"), ("CSS3", "frontend"), ("Tailwind CSS", "frontend"), ("Bootstrap", "frontend"),
        ("Node.js", "backend"), ("Express.js", "backend"), ("Spring Boot", "backend"),
        ("Django", "backend"), ("Flask", "backend"), ("FastAPI", "backend"),
        ("REST API", "backend"), ("GraphQL", "backend"), ("Microservices", "backend"),
        ("SQL", "database"), ("MySQL", "database"), ("PostgreSQL", "database"),
        ("MongoDB", "database"), ("Redis", "database"),
        ("AWS", "cloud"), ("Google Cloud", "cloud"), ("Azure", "cloud"),
        ("Docker", "cloud"), ("Kubernetes", "cloud"), ("Git", "core"), ("CI/CD", "cloud"),
        ("Linux", "core"), ("Apache Kafka", "backend"),
        ("Machine Learning", "ml_ai"), ("Deep Learning", "ml_ai"), ("NLP", "ml_ai"),
        ("Computer Vision", "ml_ai"), ("TensorFlow", "ml_ai"), ("PyTorch", "ml_ai"),
        ("Pandas", "ml_ai"), ("NumPy", "ml_ai"), ("Scikit-Learn", "ml_ai"),
        ("Communication", "soft_skill"), ("Teamwork", "soft_skill"),
        ("Problem Solving", "soft_skill"), ("Leadership", "soft_skill"),
        ("Time Management", "soft_skill"), ("Agile", "soft_skill")
    ]

    skill_objs = {}
    for name, cat in skills_data:
        sk = Skill(name=name, category=cat)
        db.add(sk)
        skill_objs[name] = sk
    db.commit()

    # 2. Key Admin User
    admin_user = User(
        email="admin@placement.edu",
        hashed_password=get_password_hash("password123"),
        full_name="Dr. Aris Thorne (Placement Director)",
        role="admin"
    )
    db.add(admin_user)

    # 3. Key Recruiter User
    recruiter_user = User(
        email="recruiter@technova.com",
        hashed_password=get_password_hash("password123"),
        full_name="Vikram Seth (Lead Recruiter)",
        role="recruiter"
    )
    db.add(recruiter_user)
    db.commit()

    # 4. Companies
    companies_data = [
        ("TechNova Solutions", "Software & Cloud Services", "https://technova.io", "Bengaluru", "Pioneering enterprise cloud-native transformation and AI software platforms.", "Vikram Seth", "recruiter@technova.com", "+91 98765 43210"),
        ("Google India", "Internet & Technology", "https://google.com", "Hyderabad / Bengaluru", "Global leader in search, cloud infrastructure, AI models, and consumer tech.", "Priya Nambiar", "priya.n@google.com", "+91 98765 11111"),
        ("Microsoft IDC", "Software & Enterprise Cloud", "https://microsoft.com", "Hyderabad / Noida", "Empowering individuals and organizations through Azure cloud and AI.", "Ananya Roy", "ananya.r@microsoft.com", "+91 98765 22222"),
        ("Amazon Web Services", "Cloud & E-Commerce", "https://amazon.jobs", "Bengaluru", "Building earth's most customer-centric cloud computing infrastructure.", "Rohan Mehra", "rohan.m@amazon.com", "+91 98765 33333"),
        ("Razorpay", "Fintech & Payments", "https://razorpay.com", "Bengaluru", "Leading frictionless financial infrastructure and merchant payment gateway.", "Kavita Nair", "kavita@razorpay.com", "+91 98765 44444"),
        ("Zomato", "Consumer Tech & Logistics", "https://zomato.com", "Gurugram", "Revolutionizing food delivery and quick-commerce supply chain.", "Tarun Kapoor", "tarun.k@zomato.com", "+91 98765 55555"),
        ("Goldman Sachs", "Investment Banking & Tech", "https://goldmansachs.com", "Bengaluru", "Global investment banking and financial algorithmic technology platform.", "Deepak Verma", "deepak.v@gs.com", "+91 98765 66666"),
        ("TCS", "IT Services & Consulting", "https://tcs.com", "Mumbai / Pan India", "Global consulting powerhouse leading digital business operations.", "Rajesh Iyer", "rajesh.i@tcs.com", "+91 98765 77777"),
        ("Infosys", "Digital Services & Consulting", "https://infosys.com", "Bengaluru / Pune", "Enabling enterprise digital transformation with cloud navigation.", "Suresh Menon", "suresh.m@infosys.com", "+91 98765 88888"),
        ("Deloitte USI", "Management Consulting", "https://deloitte.com", "Hyderabad", "Delivering advisory, audit, tax, and end-to-end enterprise consulting.", "Megha Bansal", "megha.b@deloitte.com", "+91 98765 99999")
    ]

    company_objs = {}
    for name, ind, web, loc, desc, r_name, r_mail, r_phone in companies_data:
        comp = Company(
            name=name, industry=ind, website=web, location=loc, description=desc,
            recruiter_name=r_name, recruiter_email=r_mail, recruiter_phone=r_phone,
            logo_url=f"https://api.dicebear.com/7.x/identicon/svg?seed={name.replace(' ', '')}"
        )
        db.add(comp)
        company_objs[name] = comp
    db.commit()

    # 5. Job Openings
    jobs_data = [
        (
            "TechNova Solutions", "Software Engineer",
            "Develop scalable backend microservices, implement high-throughput REST APIs, and optimize relational database schemas. Collaborate with senior architects in agile sprints.",
            "Bengaluru", "hybrid", 8.5, 7.0, 0,
            ["CSE", "IT", "ECE"], ["Java", "SQL", "Spring Boot", "REST API", "Git"], ["AWS", "Docker", "Microservices"], ["Communication", "Problem Solving", "Teamwork"],
            ["Build scalable backend services using Java and Spring Boot.", "Design and optimize SQL relational queries.", "Implement robust RESTful microservices."]
        ),
        (
            "Google India", "Software Development Engineer",
            "Solve complex algorithmic scale challenges in distributed systems. Design fault-tolerant distributed algorithms with high efficiency.",
            "Bengaluru", "onsite", 24.0, 8.0, 0,
            ["CSE", "IT"], ["C++", "Python", "DSA", "OOP", "Operating Systems", "SQL"], ["Google Cloud", "Linux"], ["Problem Solving", "Communication"],
            ["Develop high-performance algorithms for Google core services.", "Analyze space-time complexity in production systems."]
        ),
        (
            "Microsoft IDC", "Full Stack Developer",
            "Build next-generation enterprise interfaces and reactive micro-frontends with TypeScript, React and modern cloud backends.",
            "Hyderabad", "hybrid", 18.0, 7.5, 0,
            ["CSE", "IT", "ECE"], ["TypeScript", "React", "Node.js", "C#", "SQL"], ["Azure", "Docker", "Tailwind CSS"], ["Communication", "Teamwork"],
            ["Create responsive modern UIs using React.", "Build scalable API services integrated with Azure."]
        ),
        (
            "Razorpay", "Backend Engineer - Payments",
            "Architect high-concurrency payment gateway routing, transaction reconciliation, and ledger microservices.",
            "Bengaluru", "onsite", 14.0, 7.0, 0,
            ["CSE", "IT"], ["Python", "SQL", "PostgreSQL", "Redis", "REST API"], ["AWS", "Docker", "Apache Kafka"], ["Problem Solving", "Teamwork"],
            ["Build fault-tolerant payment processing pipelines.", "Optimize PostgreSQL queries and Redis caching."]
        ),
        (
            "Amazon Web Services", "Cloud Support Associate",
            "Troubleshoot complex cloud computing, networking, and serverless architectures for enterprise clients across AWS.",
            "Bengaluru", "hybrid", 12.0, 6.5, 1,
            ["CSE", "IT", "ECE", "EEE"], ["Linux", "Computer Networks", "Python", "AWS"], ["Docker", "Bash", "SQL"], ["Communication", "Problem Solving"],
            ["Diagnose and resolve cloud architectural issues for AWS customers.", "Write automation scripts in Python and Bash."]
        ),
        (
            "Zomato", "Frontend Engineer",
            "Craft fluid consumer-facing mobile and web experiences with micro-interactions and real-time live map tracking.",
            "Gurugram", "onsite", 11.0, 6.5, 0,
            ["CSE", "IT", "ECE"], ["JavaScript", "React", "TypeScript", "HTML5", "CSS3"], ["Tailwind CSS", "REST API"], ["Teamwork", "Communication"],
            ["Build responsive, high-performance web screens.", "Optimize client bundle size and Core Web Vitals."]
        ),
        (
            "TCS", "Digital Cadre Engineer",
            "Develop modern digital solutions across banking, retail, and manufacturing sectors using full stack and enterprise technologies.",
            "Pan India", "onsite", 7.0, 6.5, 1,
            ["CSE", "IT", "ECE", "EEE", "MECH"], ["Java", "Python", "SQL", "DSA"], ["Spring Boot", "React"], ["Communication", "Teamwork"],
            ["Collaborate on enterprise digital transformation engagements.", "Write structured code following industry standards."]
        )
    ]

    job_objs = {}
    for comp_name, title, desc, loc, mode, sal, min_cgpa, max_bk, depts, req_sk, pref_sk, soft_sk, resps in jobs_data:
        comp = company_objs.get(comp_name)
        if comp:
            job = Job(
                company_id=comp.id, title=title, description=desc, location=loc, work_mode=mode,
                salary_lpa=sal, min_cgpa=min_cgpa, max_backlogs=max_bk, eligible_departments_json=depts,
                required_skills_json=req_sk, preferred_skills_json=pref_sk, soft_skills_json=soft_sk,
                responsibilities_json=resps, application_deadline=datetime.datetime.utcnow() + datetime.timedelta(days=14),
                drive_date=datetime.datetime.utcnow() + datetime.timedelta(days=21), status="active"
            )
            db.add(job)
            job_objs[f"{comp_name} - {title}"] = job
    db.commit()

    # 6. Students (52 profiles)
    names = [
        ("Rahul", "Sharma", "CSE", 8.85, 0), ("Sneha", "Patel", "IT", 9.20, 0),
        ("Aakash", "Verma", "CSE", 8.40, 0), ("Pooja", "Reddy", "ECE", 7.90, 0),
        ("Aditya", "Nair", "CSE", 6.80, 1), ("Divya", "Iyer", "IT", 8.95, 0),
        ("Rohan", "Gupta", "CSE", 7.60, 0), ("Ananya", "Singh", "ECE", 8.10, 0),
        ("Karthik", "Rao", "CSE", 9.45, 0), ("Swati", "Choudhury", "IT", 7.30, 0),
        ("Naveen", "Bose", "MECH", 6.90, 0), ("Tanvi", "Mehta", "CSE", 8.70, 0),
        ("Siddharth", "Deshmukh", "IT", 8.25, 0), ("Meera", "Joshi", "ECE", 7.45, 0),
        ("Vikram", "Menon", "CSE", 9.10, 0), ("Isha", "Agarwal", "IT", 8.50, 0),
        ("Varun", "Mishra", "CSE", 7.20, 0), ("Rhea", "Pandey", "ECE", 8.30, 0),
        ("Manish", "Kapoor", "EEE", 6.70, 1), ("Shreya", "Saxena", "CSE", 8.90, 0),
        ("Abhishek", "Bhat", "IT", 7.80, 0), ("Deepika", "Kulkarni", "CSE", 9.05, 0),
        ("Gaurav", "Sen", "ECE", 7.15, 0), ("Kavya", "Pillai", "IT", 8.60, 0),
        ("Pranav", "Patel", "CSE", 8.35, 0), ("Nandini", "Verma", "CSE", 9.30, 0),
        ("Harish", "Reddy", "MECH", 6.50, 0), ("Ritika", "Nair", "IT", 7.95, 0),
        ("Akshay", "Iyer", "CSE", 8.15, 0), ("Bhavna", "Gupta", "ECE", 7.50, 0),
        ("Mohit", "Singh", "CSE", 7.75, 0), ("Neha", "Choudhury", "IT", 8.80, 0),
        ("Tarun", "Bose", "EEE", 6.60, 0), ("Simran", "Mehta", "CSE", 9.15, 0),
        ("Saurabh", "Deshmukh", "IT", 8.00, 0), ("Payal", "Joshi", "ECE", 7.70, 0),
        ("Mayank", "Menon", "CSE", 8.65, 0), ("Preeti", "Agarwal", "IT", 8.40, 0),
        ("Karan", "Mishra", "CSE", 7.90, 0), ("Shruti", "Pandey", "ECE", 8.20, 0),
        ("Nikhil", "Kapoor", "MECH", 6.75, 0), ("Aparna", "Saxena", "CSE", 9.00, 0),
        ("Arjun", "Bhat", "IT", 8.10, 0), ("Komal", "Kulkarni", "CSE", 8.75, 0),
        ("Vishal", "Sen", "ECE", 7.35, 0), ("Aishwarya", "Pillai", "IT", 8.90, 0),
        ("Yash", "Sharma", "CSE", 8.45, 0), ("Ankita", "Verma", "CSE", 9.25, 0),
        ("Chirag", "Patel", "EEE", 6.95, 0), ("Vidya", "Reddy", "IT", 8.30, 0),
        ("Sunny", "Nair", "CSE", 7.85, 0), ("Ritu", "Iyer", "ECE", 8.05, 0)
    ]

    all_tech_skills = ["Java", "Python", "C++", "JavaScript", "TypeScript", "React", "Node.js", "Spring Boot", "Django", "FastAPI", "SQL", "MySQL", "PostgreSQL", "MongoDB", "AWS", "Docker", "Git", "DSA", "OOP", "Machine Learning"]
    student_objs = []
    random.seed(42)

    for idx, (first, last, dept, cgpa, backlogs) in enumerate(names):
        full_name = f"{first} {last}"
        email = f"{first.lower()}.{last.lower()}@student.edu" if idx < 2 else f"{first.lower()}.{last.lower()}{idx+1}@student.edu"
        roll = f"2026{dept}{idx+1:03d}"
        
        st_user = User(
            email=email,
            hashed_password=get_password_hash("password123"),
            full_name=full_name,
            role="student"
        )
        db.add(st_user)
        db.commit()

        st_obj = Student(
            user_id=st_user.id,
            roll_number=roll,
            department=dept,
            batch_year=2026,
            cgpa=cgpa,
            active_backlogs=backlogs,
            phone=f"+91 98450 {random.randint(10000, 99999)}",
            github_url=f"https://github.com/{first.lower()}-{last.lower()}",
            linkedin_url=f"https://linkedin.com/in/{first.lower()}{last.lower()}",
            placement_status="placed" if idx < 14 else "unplaced",
            placement_readiness_score=round(random.uniform(65.0, 93.0), 1),
            ai_profile_summary=f"Strong engineering undergraduate with solid foundations in {dept} problem solving and modern software technologies.",
            strengths_json=["DSA", "SQL", "OOP"],
            gaps_json=["AWS", "Docker"],
            best_roles_json=["Software Engineer", "Backend Developer"]
        )
        db.add(st_obj)
        db.commit()

        # Skills for Rahul (index 0) - Perfect for TechNova
        if idx == 0:
            for sk_n, prof in [("Java", "advanced"), ("Spring Boot", "advanced"), ("SQL", "advanced"), ("REST API", "advanced"), ("Git", "advanced"), ("DSA", "advanced"), ("OOP", "advanced"), ("Communication", "intermediate")]:
                if sk_n in skill_objs:
                    db.add(StudentSkill(student_id=st_obj.id, skill_id=skill_objs[sk_n].id, proficiency_level=prof, verified=True))
            db.add(Project(
                student_id=st_obj.id,
                title="Scalable Microservices E-Commerce API",
                description="Built high-throughput Spring Boot REST microservices with PostgreSQL and Redis caching.",
                tech_stack_json=["Java", "Spring Boot", "SQL", "PostgreSQL", "Redis", "REST API"],
                github_link="https://github.com/rahulsharma-dev/ecommerce-microservices",
                duration_months=4
            ))
            db.add(Internship(
                student_id=st_obj.id,
                company_name="InnovateTech Solutions",
                role="Backend Engineering Intern",
                description="Migrated database stored procedures to Spring Boot REST endpoints.",
                duration_months=3
            ))
            db.add(Certification(
                student_id=st_obj.id,
                title="Oracle Certified Professional: Java SE 17",
                issuing_org="Oracle",
                issue_date="2025-08-15"
            ))
        elif idx == 1: # Sneha (index 1) - Full Stack
            for sk_n, prof in [("React", "advanced"), ("TypeScript", "advanced"), ("Java", "intermediate"), ("SQL", "advanced"), ("Node.js", "advanced"), ("DSA", "advanced")]:
                if sk_n in skill_objs:
                    db.add(StudentSkill(student_id=st_obj.id, skill_id=skill_objs[sk_n].id, proficiency_level=prof, verified=True))
            db.add(Project(
                student_id=st_obj.id,
                title="Real-Time Collaborative Canvas",
                description="Built real-time collaborative workspace using React, TypeScript, WebSockets, and Node.js.",
                tech_stack_json=["React", "TypeScript", "Node.js", "WebSocket"],
                github_link="https://github.com/snehapatel-tech/code-canvas",
                duration_months=3
            ))
        else:
            # Random skills
            assigned = random.sample(all_tech_skills, random.randint(4, 7))
            for sk_n in assigned:
                if sk_n in skill_objs:
                    db.add(StudentSkill(student_id=st_obj.id, skill_id=skill_objs[sk_n].id, proficiency_level="intermediate", verified=True))
            
            proj_title = f"{random.choice(['Cloud', 'AI', 'Full-Stack', 'Real-Time'])} {random.choice(['Task Board', 'Billing Portal', 'Sentiment Classifier', 'IoT Monitor'])}"
            db.add(Project(
                student_id=st_obj.id,
                title=proj_title,
                description=f"Developed practical application using {', '.join(assigned[:3])}.",
                tech_stack_json=assigned[:3],
                github_link=f"https://github.com/{first.lower()}/{proj_title.lower().replace(' ', '-')}",
                duration_months=3
            ))

        # Placements for first 14
        if idx < 14:
            placed_comp = list(company_objs.values())[idx % len(company_objs)]
            pkg = round(random.uniform(7.0, 22.0), 1)
            db.add(Placement(
                student_id=st_obj.id,
                company_id=placed_comp.id,
                job_id=list(job_objs.values())[0].id,
                package_lpa=pkg,
                acceptance_status="accepted"
            ))

        student_objs.append(st_obj)
    db.commit()

    # 7. Applications for TechNova Software Engineer
    technova_job = job_objs.get("TechNova Solutions - Software Engineer")
    if technova_job:
        for st in student_objs:
            score, breakdown, xai = matching_engine.evaluate_candidate(st, technova_job)
            status = "shortlisted" if score >= 85.0 else ("eligible" if breakdown.is_eligible else "ineligible")
            db.add(Application(
                job_id=technova_job.id,
                student_id=st.id,
                status=status,
                match_score=score,
                match_breakdown_json=breakdown.model_dump(),
                ai_recommendation=xai.ai_recommendation
            ))
        db.commit()

    # 8. Interview Feedback
    shortlisted_apps = db.query(Application).filter(Application.status == "shortlisted").limit(5).all()
    for ap in shortlisted_apps:
        db.add(InterviewFeedback(
            application_id=ap.id,
            student_id=ap.student_id,
            round_name="Technical Round 1",
            technical_score=8.5,
            communication_score=8.0,
            aptitude_score=8.5,
            problem_solving_score=9.0,
            confidence_score=8.5,
            hr_feedback="Articulate, polite, demonstrated strong problem-solving mindset.",
            technical_feedback="Excellent grasp of core OOP, database normalization, and REST API conventions.",
            final_verdict="selected"
        ))
    db.commit()

    # 9. Training Programs
    training_data = [
        ("Advanced SQL & Query Optimization Intensive", "Deep dive into query execution plans, indexing strategies, complex window functions, and transaction concurrency.", "SQL", "high", 45, 3, ["Database Normalization", "Window Functions & CTEs", "B-Tree Indexing", "Performance Tuning"]),
        ("DSA & Algorithmic Masterclass", "Mastering Arrays, Trees, Dynamic Programming, Graphs, and Top 100 Coding Interview Patterns.", "DSA", "high", 60, 4, ["Arrays & Two Pointers", "Trees & Graphs", "Dynamic Programming", "Live Mock Coding"]),
        ("Spring Boot Microservices & Enterprise Architecture", "Building distributed, containerized microservices with Spring Cloud, Docker, and Kafka.", "Spring Boot", "medium", 35, 4, ["RESTful API Design", "Spring Data JPA & Security", "Docker Containerization", "Microservices Routing"]),
        ("AWS Cloud Practitioner & Serverless Sprint", "Comprehensive hands-on training for AWS EC2, S3, Lambda, API Gateway, and Cloud Architecture.", "AWS", "medium", 40, 3, ["Core AWS Services", "IAM & Cloud Security", "Serverless Lambda", "Deployment CI/CD"]),
        ("Behavioral & Technical Mock Interview Clinic", "Simulated one-on-one interview panels focusing on STAR behavioral techniques and resume defense.", "Communication", "high", 50, 2, ["STAR Method Mastery", "Resume Project Defense", "Live System Architecture Walkthrough", "HR Negotiation"])
    ]

    for title, desc, target_sk, prio, size, dur, syll in training_data:
        sk_id = skill_objs.get(target_sk).id if target_sk in skill_objs else None
        db.add(TrainingProgram(
            title=title, description=desc, skill_id=sk_id, target_skill_name=target_sk,
            priority=prio, cohort_size=size, duration_weeks=dur, syllabus_json=syll, status="planned"
        ))
    db.commit()

    # 10. RAG Documents
    docs_data = [
        (
            "Institutional Placement Policy & Eligibility Rules (2026)", "policy",
            "INSTITUTIONAL CAMPUS PLACEMENT POLICY 2026\n\n1. ELIGIBILITY: All students must maintain default cutoff 6.5 CGPA with zero active backlogs.\n2. ONE-OFFER & DREAM COMPANY: Standard offers are up to 8 LPA. Candidates holding standard offers may apply only for Dream Companies offering 12+ LPA (at least 1.5x increment).\n3. ATTENDANCE: Mandatory attendance in all registered rounds."
        ),
        (
            "Company Circular: TechNova Solutions 2026", "circular",
            "TECHNOVA SOLUTIONS CAMPUS DRIVE 2026\n\nRole: Software Engineer\nLocation: Bengaluru (Hybrid)\nCTC: 8.5 LPA (7.5 Fixed + 1.0 Bonus)\nEligibility: B.Tech CSE, IT, ECE, Min CGPA 7.0, 0 backlogs.\nTechnical Skills: Core Java, Spring Boot, SQL, REST API, Git."
        ),
        (
            "Technical Interview Preparation Guidelines", "curriculum",
            "TECHNICAL INTERVIEW GUIDELINES\n\n1. Project Defense: Explain architectural tradeoffs, state management, and why specific databases were selected.\n2. Live Coding: Clarify edge cases, state time/space complexity, write clean modular code.\n3. STAR Method for Behavioral rounds."
        )
    ]

    for title, cat, content in docs_data:
        doc = Document(title=title, category=cat, content_text=content, summary=f"Official placement document: {title}")
        db.add(doc)
        db.commit()
        rag_service.index_document(db, doc)

    # 11. AI Evaluation Benchmarks
    benchmarks = [
        ("High-Match Java Developer Scenario", 1, student_objs[0].id, 92.0, True),
        ("Full-Stack React Candidate Scenario", 1, student_objs[1].id, 86.0, True),
        ("Ineligible Backlog Candidate Scenario", 1, student_objs[4].id, 40.0, False),
        ("Low-Skill Alignment Scenario", 1, student_objs[10].id, 56.0, True),
        ("Tier-1 High Cutoff Scenario", 2, student_objs[0].id, 88.0, True)
    ]

    for t_name, j_id, s_id, exp_score, exp_elig in benchmarks:
        db.add(AIEvalBenchmark(
            test_case_name=t_name, job_id=j_id, student_id=s_id,
            expected_match_score=exp_score, actual_match_score=exp_score,
            expected_eligibility=exp_elig, actual_eligibility=exp_elig,
            precision_at_k=1.0, pass_fail=True, details_json={"scenario": t_name}
        ))
    db.commit()

    # 12. Audit Log & Notifications
    db.add(AuditLog(
        user_name="Dr. Aris Thorne", role="admin",
        action="Initialized Placement Drive: TechNova Solutions (Software Engineer)",
        entity_type="Job", entity_id=1, details_json={"salary_lpa": 8.5, "min_cgpa": 7.0}
    ))
    db.add(Notification(
        user_id=student_objs[0].user_id,
        title="Shortlisted for TechNova Solutions",
        message="AI Matching Engine shortlisted your profile for Software Engineer (Round 1 Interview scheduled).",
        type="shortlist", link="/student/applications"
    ))
    db.add(Notification(
        user_id=admin_user.id,
        title="TechNova Drive Evaluation Complete",
        message="AI evaluated 52 student profiles. 6 candidates ranked in Top Tier (85%+ Match).",
        type="job", link="/matching"
    ))

    db.commit()
    db.close()
    print("[Seed] Successfully seeded complete database with 52 students, 10 companies, 7 drives, and AI benchmarks!")

if __name__ == '__main__':
    seed_database()

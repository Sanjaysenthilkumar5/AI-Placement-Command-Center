from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Company, Job, Placement
from app.schemas.schemas import CompanyCreate, CompanyOut

router = APIRouter(prefix="/companies", tags=["Companies"])

@router.get("", response_model=List[CompanyOut])
def get_companies(db: Session = Depends(get_db)):
    comps = db.query(Company).all()
    results = []
    for c in comps:
        drives_cnt = len(c.jobs)
        hired_cnt = len(c.placements)
        avg_pkg = round(sum(p.package_lpa for p in c.placements) / hired_cnt, 2) if hired_cnt > 0 else (c.jobs[0].salary_lpa if c.jobs else 7.5)
        results.append(CompanyOut(
            id=c.id,
            name=c.name,
            industry=c.industry,
            website=c.website,
            location=c.location,
            description=c.description,
            recruiter_name=c.recruiter_name,
            recruiter_email=c.recruiter_email,
            recruiter_phone=c.recruiter_phone,
            logo_url=c.logo_url,
            total_drives=drives_cnt,
            total_hired=hired_cnt,
            avg_package_lpa=avg_pkg,
            created_at=c.created_at
        ))
    return results

@router.post("", response_model=CompanyOut)
def create_company(data: CompanyCreate, db: Session = Depends(get_db)):
    existing = db.query(Company).filter(Company.name.ilike(data.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Company already exists")
    
    comp = Company(
        name=data.name,
        industry=data.industry,
        website=data.website,
        location=data.location,
        description=data.description,
        recruiter_name=data.recruiter_name,
        recruiter_email=data.recruiter_email,
        recruiter_phone=data.recruiter_phone,
        logo_url=data.logo_url or f"https://api.dicebear.com/7.x/identicon/svg?seed={data.name.replace(' ', '')}"
    )
    db.add(comp)
    db.commit()
    db.refresh(comp)
    return CompanyOut(
        id=comp.id,
        name=comp.name,
        industry=comp.industry,
        website=comp.website,
        location=comp.location,
        description=comp.description,
        recruiter_name=comp.recruiter_name,
        recruiter_email=comp.recruiter_email,
        recruiter_phone=comp.recruiter_phone,
        logo_url=comp.logo_url,
        total_drives=0,
        total_hired=0,
        avg_package_lpa=0.0,
        created_at=comp.created_at
    )

@router.delete("/{company_id}")
def delete_company(company_id: int, db: Session = Depends(get_db)):
    comp = db.query(Company).filter(Company.id == company_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Company not found")
    
    comp_name = comp.name
    # Delete associated applications, placements, jobs
    for j in comp.jobs:
        db.query(Application).filter(Application.job_id == j.id).delete()
    db.query(Placement).filter(Placement.company_id == company_id).delete()
    db.query(Job).filter(Job.company_id == company_id).delete()
    db.delete(comp)
    db.commit()

    return {"message": f"Company '{comp_name}' and associated drives deleted successfully", "id": company_id}

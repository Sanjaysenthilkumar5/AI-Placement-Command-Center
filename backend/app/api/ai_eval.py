from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import AIEvalDashboardOut
from app.services.eval_service import eval_service

router = APIRouter(prefix="/eval", tags=["AI Engineering & Benchmarking"])

@router.get("/benchmarks", response_model=AIEvalDashboardOut)
def run_ai_benchmarks(db: Session = Depends(get_db)):
    return eval_service.run_benchmark_suite(db)

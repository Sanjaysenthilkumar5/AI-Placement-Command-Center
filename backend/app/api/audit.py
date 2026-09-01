from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import AuditLog
from app.schemas.schemas import AuditLogOut

router = APIRouter(prefix="/audit", tags=["Audit Trail"])

@router.get("", response_model=List[AuditLogOut])
def get_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
    return [
        AuditLogOut(
            id=l.id,
            user_name=l.user_name,
            role=l.role,
            action=l.action,
            entity_type=l.entity_type,
            entity_id=l.entity_id,
            details=l.details_json or {},
            timestamp=l.timestamp
        )
        for l in logs
    ]

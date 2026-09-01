from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Document
from app.schemas.schemas import DocumentOut, DocumentQueryRequest, DocumentQueryResponse
from app.services.rag_service import rag_service
from app.services.resume_parser import resume_parser

router = APIRouter(prefix="/documents", tags=["RAG Documents & Policies"])

@router.get("", response_model=List[DocumentOut])
def get_documents(db: Session = Depends(get_db)):
    docs = db.query(Document).all()
    return [
        DocumentOut(
            id=d.id,
            title=d.title,
            category=d.category,
            summary=d.summary,
            chunks_count=len(d.chunks),
            created_at=d.created_at
        )
        for d in docs
    ]

@router.post("/query", response_model=DocumentQueryResponse)
async def query_rag_knowledge(req: DocumentQueryRequest, db: Session = Depends(get_db)):
    return await rag_service.query_documents(db, query=req.query, category=req.category, top_k=req.top_k)

@router.post("/upload")
async def upload_document(
    title: str = Form(...),
    category: str = Form("policy"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    import os
    from app.core.config import settings
    file_path = os.path.join(settings.UPLOAD_DIR, f"doc_{file.filename}")
    with open(file_path, "wb") as buffer:
        import shutil
        shutil.copyfileobj(file.file, buffer)

    text = resume_parser.extract_text_from_file(file_path)
    if not text:
        text = f"Document content for {title}."

    doc = Document(
        title=title,
        category=category,
        file_path=file_path,
        content_text=text,
        summary=f"Uploaded {category} document: {title}"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    rag_service.index_document(db, doc)

    return {"status": "success", "document_id": doc.id, "chunks_created": len(doc.chunks)}

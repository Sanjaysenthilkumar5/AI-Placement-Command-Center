import re
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.models import Document, DocumentChunk
from app.schemas.schemas import DocumentQueryResponse, CitationOut
from app.services.ai_provider import ai_provider

class RAGService:
    def chunk_text(self, text: str, chunk_size: int = 400, overlap: int = 80) -> List[str]:
        """Splits long document text into overlapping chunks."""
        words = text.split()
        if not words:
            return []
        chunks = []
        i = 0
        while i < len(words):
            chunk = " ".join(words[i:i + chunk_size])
            chunks.append(chunk)
            i += max(1, chunk_size - overlap)
        return chunks

    def index_document(self, db: Session, document: Document):
        """Chunks document text and generates embedding vectors for each chunk."""
        # Delete existing chunks
        db.query(DocumentChunk).filter(DocumentChunk.document_id == document.id).delete()

        chunks = self.chunk_text(document.content_text)
        for idx, chunk_text in enumerate(chunks):
            embedding = ai_provider.compute_embedding(chunk_text)
            chunk_obj = DocumentChunk(
                document_id=document.id,
                chunk_index=idx + 1,
                content=chunk_text,
                embedding_json=embedding
            )
            db.add(chunk_obj)
        db.commit()

    async def query_documents(
        self,
        db: Session,
        query: str,
        category: str = None,
        top_k: int = 3
    ) -> DocumentQueryResponse:
        """Retrieves semantically relevant chunks and synthesizes grounded answer with citations."""
        query_clean = query.strip()
        query_vec = ai_provider.compute_embedding(query_clean)
        
        chunk_query = db.query(DocumentChunk).join(Document)
        if category and category != "all":
            chunk_query = chunk_query.filter(Document.category == category)
        
        all_chunks = chunk_query.all()
        
        if not all_chunks:
            return DocumentQueryResponse(
                query=query,
                answer="No relevant placement policy or drive documents are currently indexed in the knowledge base.",
                citations=[],
                is_grounded=False,
                confidence_score=0.0
            )

        # Score chunks with hybrid cosine similarity + lexical matching
        scored_chunks: List[Tuple[float, DocumentChunk]] = []
        query_words = set(re.findall(r'\w+', query_clean.lower()))

        for chunk in all_chunks:
            cos_sim = ai_provider.cosine_similarity(query_vec, chunk.embedding_json or [])
            
            # Lexical boost
            chunk_words = set(re.findall(r'\w+', chunk.content.lower()))
            overlap_count = len(query_words.intersection(chunk_words))
            lex_boost = min(0.3, overlap_count * 0.06)
            
            hybrid_score = (cos_sim * 0.7) + lex_boost
            scored_chunks.append((hybrid_score, chunk))

        # Sort descending by hybrid score
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        top_matches = scored_chunks[:top_k]

        citations: List[CitationOut] = []
        context_snippets = []
        max_score = top_matches[0][0] if top_matches else 0.0

        for score, chunk in top_matches:
            if score >= 0.20:
                doc = chunk.document
                snippet = chunk.content[:220] + "..." if len(chunk.content) > 220 else chunk.content
                citations.append(CitationOut(
                    document_id=doc.id,
                    document_title=doc.title,
                    chunk_index=chunk.chunk_index,
                    snippet=snippet,
                    relevance_score=round(score, 3)
                ))
                context_snippets.append(f"[Source: {doc.title} | Chunk #{chunk.chunk_index}]\n{chunk.content}")

        if not citations:
            return DocumentQueryResponse(
                query=query,
                answer="I could not find sufficiently relevant information in the placement documentation to answer this question. Please contact the placement cell directly.",
                citations=[],
                is_grounded=False,
                confidence_score=round(max_score, 2)
            )

        # Synthesize Grounded Answer
        context_block = "\n\n---\n\n".join(context_snippets)
        prompt = f"""
You are an expert Placement Assistant. Answer the following question based STRICTLY and ONLY on the provided verified documents.
If the answer cannot be determined from the documents, clearly state: "The requested information is not specified in the available placement documents."
Do not hallucinate rules, salaries, or cutoff percentages.

CONTEXT DOCUMENTS:
{context_block}

USER QUESTION:
{query_clean}

GROUNDED ANSWER:
"""
        answer_text = await ai_provider.generate_text(
            prompt=prompt,
            system_instruction="You are a precise, grounded AI placement compliance officer. Only state facts present in context."
        )

        return DocumentQueryResponse(
            query=query,
            answer=answer_text.strip(),
            citations=citations,
            is_grounded=True,
            confidence_score=round(min(1.0, max_score * 1.2), 2)
        )

rag_service = RAGService()

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from ..database import get_db
from app.models.claim import Claim
import uuid

router = APIRouter(
    prefix="/claims",
    tags=["Claims"]
)

class ClaimCreate(BaseModel):
    incident_type: str
    incident_date: datetime
    location: str
    description: Optional[str] = None
    user_id: str

class ClaimStatusUpdate(BaseModel):
    status: str

@router.get("/")
async def get_claims(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Claim).order_by(desc(Claim.created_at)))
    claims = result.scalars().all()
    return {"claims": claims}

@router.get("/{claim_id}")
async def get_claim(claim_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Claim).where(Claim.id == claim_id))
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return {"claim": claim}

@router.post("/")
async def create_claim(claim: ClaimCreate, db: AsyncSession = Depends(get_db)):
    new_claim = Claim(
        id=str(uuid.uuid4()),
        incident_type=claim.incident_type,
        incident_date=claim.incident_date.replace(tzinfo=None),
        location=claim.location,
        description=claim.description,
        user_id=claim.user_id,
    )
    db.add(new_claim)
    await db.commit()
    await db.refresh(new_claim)
    return {"message": "Claim created successfully", "claim": new_claim}

@router.put("/{claim_id}/status")
async def update_claim_status(claim_id: str, update: ClaimStatusUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Claim).where(Claim.id == claim_id))
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    claim.status = update.status
    await db.commit()
    await db.refresh(claim)
    return {"message": "Status updated", "claim": claim}
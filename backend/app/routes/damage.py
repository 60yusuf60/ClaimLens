from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from ..database import get_db
from ..models.claim import Claim, DamageReport
from ..services.ai_service import analyze_damage
from ..services.storage_service import upload_photo
import uuid

router = APIRouter(
    prefix="/damage",
    tags=["Damage Analysis"]
)

@router.get("/report/{claim_id}")
async def get_damage_report(claim_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DamageReport).where(DamageReport.claim_id == claim_id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Damage report not found")
    return {"damage_report": report}

@router.get("/photos/{claim_id}")
async def get_claim_photos(claim_id: str):
    from ..services.storage_service import supabase
    try:
        files = supabase.storage.from_("claim-photos").list(claim_id)
        urls = []
        for file in files:
            signed = supabase.storage.from_("claim-photos").create_signed_url(
                f"{claim_id}/{file['name']}", 3600
            )
            urls.append(signed['signedURL'])
        return {"photos": urls}
    except Exception as e:
        return {"photos": []}


@router.post("/analyze/{claim_id}")
async def analyze_claim_damage(
    claim_id: str,
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db)
):
    if len(files) < 1:
        raise HTTPException(status_code=400, detail="At least 1 photo is required")
    
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 photos allowed")

    result = await db.execute(select(Claim).where(Claim.id == claim_id))
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    existing_report = await db.execute(
        select(DamageReport).where(DamageReport.claim_id == claim_id)
    )
    if existing_report.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Damage report already exists for this claim")

    images = []
    for i, file in enumerate(files):
        image_bytes = await file.read()
        images.append((image_bytes, file.content_type))
        await upload_photo(image_bytes, claim_id, i, file.content_type)

    ai_result = await analyze_damage(images)

    damage_report = DamageReport(
        id=str(uuid.uuid4()),
        claim_id=claim_id,
        damage_type=ai_result["damage_type"],
        vehicle_make=ai_result.get("vehicle_make", "Unknown"),
        vehicle_model=ai_result.get("vehicle_model", "Unknown"),
        vehicle_color=ai_result.get("vehicle_color", "Unknown"),
        severity=ai_result["severity"],
        estimated_cost_min=ai_result["estimated_cost_min"],
        estimated_cost_max=ai_result["estimated_cost_max"],
        confidence_score=ai_result["confidence_score"],
        ai_summary=ai_result["ai_summary"],
    )

    db.add(damage_report)
    await db.commit()
    await db.refresh(damage_report)

    return {
        "message": "Damage analysis complete",
        "photos_analyzed": len(files),
        "damage_report": damage_report
    }
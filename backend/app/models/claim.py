from sqlalchemy import Column, String, Boolean, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Claim(Base):
    __tablename__ = "Claim"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    agent_id = Column(String, nullable=True)
    status = Column(String, default="PENDING")
    incident_type = Column(String, nullable=False)
    incident_date = Column(DateTime, nullable=False)
    location = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    priority_score = Column(Integer, default=0)
    fraud_flag = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    damage_report = relationship("DamageReport", back_populates="claim", uselist=False)


class DamageReport(Base):
    __tablename__ = "DamageReport"

    id = Column(String, primary_key=True)
    claim_id = Column(String, ForeignKey("Claim.id"), unique=True, nullable=False)
    damage_type = Column(String, nullable=False)
    vehicle_make = Column(String, default="Unknown")
    vehicle_model = Column(String, default="Unknown")
    vehicle_color = Column(String, default="Unknown")
    severity = Column(String, nullable=False)
    estimated_cost_min = Column(Float, nullable=False)
    estimated_cost_max = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)
    ai_summary = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    claim = relationship("Claim", back_populates="damage_report")
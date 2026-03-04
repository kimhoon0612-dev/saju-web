import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class UserRole(str, enum.Enum):
    USER = "USER"
    EXPERT = "EXPERT"
    ADMIN = "ADMIN"

class ReservationStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER)
    point_balance = Column(Integer, default=0)
    
    # 사주 특성 (오행 등 텍스트 요약)
    saju_summary = Column(Text, nullable=True)

    expert_profile = relationship("ExpertProfile", back_populates="user", uselist=False)
    reservations_as_user = relationship("Reservation", back_populates="user", foreign_keys="[Reservation.user_id]")
    reservations_as_expert = relationship("Reservation", back_populates="expert", foreign_keys="[Reservation.expert_id]")

class ExpertProfile(Base):
    __tablename__ = "expert_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    display_name = Column(String, nullable=False)
    specialty = Column(String, nullable=False)
    short_bio = Column(String, nullable=True)
    aura_element = Column(String, nullable=True)
    rating = Column(Integer, default=5)
    price_per_session = Column(Integer, default=1000)

    user = relationship("User", back_populates="expert_profile")

class Reservation(Base):
    __tablename__ = "reservations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    expert_id = Column(Integer, ForeignKey("users.id"))
    
    scheduled_time = Column(DateTime, nullable=False)
    status = Column(Enum(ReservationStatus), default=ReservationStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    ai_context_summary = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="reservations_as_user", foreign_keys=[user_id])
    expert = relationship("User", back_populates="reservations_as_expert", foreign_keys=[expert_id])

class PointTransaction(Base):
    __tablename__ = "point_transactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Integer, nullable=False)
    description = Column(String, nullable=True)
    is_escrow_locked = Column(Boolean, default=False)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Integer, nullable=False)
    category = Column(String, default="wish") # 'elemental', 'wish', 'persona'
    theme = Column(String, nullable=True) # 'wood', 'wealth', 'love', etc.
    image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

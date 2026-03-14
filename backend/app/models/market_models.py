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
    username = Column(String, unique=True, index=True, nullable=False) # Will use email as username
    email = Column(String, unique=True, index=True, nullable=True) # Will store email or kakao id
    password_hash = Column(String, nullable=True) # Password hash for email login
    name = Column(String, nullable=True)
    
    # Birth data fields
    gender = Column(String, nullable=True)
    birth_time_iso = Column(String, nullable=True)
    is_lunar = Column(Boolean, default=False)
    is_leap_month = Column(Boolean, default=False)
    
    role = Column(Enum(UserRole), default=UserRole.USER)
    point_balance = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
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
    share_ratio_percent = Column(Integer, default=70) # 상담사 수익 배분율 (기본 70%)
    image_url = Column(String, nullable=True) # 프로필 썸네일/사진

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
    original_price = Column(Integer, nullable=True) # E-commerce 정가
    sales_tags = Column(String, nullable=True) # CSV of tags like 'BEST,무료배송'
    category = Column(String, default="wish") # 'elemental', 'wish', 'persona', 'amulet', 'goods', 'coin'
    theme = Column(String, nullable=True)     # 'wood', 'wealth', 'love', etc.
    image_url = Column(String, nullable=True)
    coin_amount = Column(Integer, default=0)
    bonus_coins = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class VirtualExpert(Base):
    __tablename__ = "virtual_experts"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, default="운세") # 운세, 타로
    display_name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    tags = Column(String, nullable=True) # Stored as comma separated or JSON string
    rating = Column(Integer, default=5) # Can be Float, using Integer based on existing mock structure or Float
    reviews_count = Column(Integer, default=0)
    avg_minutes = Column(Integer, default=10)
    total_consults = Column(Integer, default=0)
    image_url = Column(String, nullable=True)
    is_online = Column(Boolean, default=True)
    banner_text = Column(String, nullable=True)
    is_free_available = Column(Boolean, default=False)
    introduction_text = Column(Text, nullable=True)
    share_ratio_percent = Column(Integer, default=70) # 상담사 수익 배분율 (e.g. 70 for 70%)
    created_at = Column(DateTime, default=datetime.utcnow)

class ExpertReview(Base):
    __tablename__ = "expert_reviews"
    id = Column(Integer, primary_key=True, index=True)
    expert_id = Column(Integer, ForeignKey("virtual_experts.id", ondelete="CASCADE"))
    author_name = Column(String, nullable=False)
    rating = Column(Integer, default=5)
    content = Column(Text, nullable=False)
    is_hidden = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ExpertSettlement(Base):
    __tablename__ = "expert_settlements"
    id = Column(Integer, primary_key=True, index=True)
    expert_id = Column(Integer, ForeignKey("virtual_experts.id", ondelete="CASCADE"))
    amount = Column(Integer, nullable=False)
    status = Column(String, default="PENDING") # PENDING, COMPLETED, CANCELLED
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class CallTransaction(Base):
    """
    기록: 상담사와의 실제 통화 내역
    결제 수단(060 후불 vs 코인 선불)에 따른 정산 분리 목적으로 사용됩니다.
    """
    __tablename__ = "call_transactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True) # 060의 경우 비회원일 수도 있음
    expert_id = Column(Integer, ForeignKey("virtual_experts.id", ondelete="CASCADE"))
    
    payment_method = Column(String, nullable=False) # "COIN" or "060"
    duration_seconds = Column(Integer, default=0)
    amount_charged = Column(Integer, default=0) # 코인 소모량 또는 060 청구 예상 금액
    status = Column(String, default="COMPLETED") # COMPLETED, FAILED, IN_PROGRESS
    
    created_at = Column(DateTime, default=datetime.utcnow)

class EmailVerification(Base):
    __tablename__ = "email_verifications"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    code = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

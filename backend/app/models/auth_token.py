"""โมเดล Token สำหรับการเข้าสู่ระบบ รองรับ FR-AUTH-04 และ IF-TOKEN-01."""

from __future__ import annotations

import enum
import uuid
from datetime import datetime, timedelta

from sqlalchemy import DateTime, Enum, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


DEFAULT_TOKEN_TTL_MINUTES = 30


class UserRole(str, enum.Enum):
    """บทบาทผู้ใช้ทั้ง 4 ประเภทตาม ASM-01."""

    CLUB_COMMITTEE = "club_committee"
    FACULTY_OFFICER = "faculty_officer"
    ADVISOR = "advisor"
    STUDENT_AFFAIRS_OFFICER = "student_affairs_officer"


class AuthToken(Base):
    """Token ที่มีวันหมดอายุสำหรับการเข้าถึงระบบตาม FR-AUTH-04."""

    __tablename__ = "auth_tokens"

    token_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    token_value: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False)
    issued_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    @staticmethod
    def compute_expiry(issued_at: datetime | None = None) -> datetime:
        """คำนวณวันหมดอายุ Token 30 นาทีตาม IF-TOKEN-01 และ ASM-02."""
        base_time = issued_at or datetime.utcnow()
        return base_time + timedelta(minutes=DEFAULT_TOKEN_TTL_MINUTES)

    def is_expired(self, now: datetime | None = None) -> bool:
        """ตรวจว่า Token หมดอายุแล้วตาม IF-TOKEN-01."""
        check_time = now or datetime.utcnow()
        return check_time >= self.expires_at

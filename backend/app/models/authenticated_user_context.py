from dataclasses import dataclass
from datetime import datetime

from .auth_token import UserRole


@dataclass(frozen=True)
class AuthenticatedUserContext:
    """ผู้ใช้ที่ยืนยันจาก Token แล้ว ตาม CON-NFR-21, NFR-SEC-01 และ FR-AUTH-04."""

    user_id: str
    role: UserRole
    authenticated_at: datetime

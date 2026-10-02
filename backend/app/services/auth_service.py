"""บริการเข้าสู่ระบบแบบ contract/skeleton รองรับ FR-AUTH-03 และ FR-AUTH-04."""

from __future__ import annotations

import secrets
from dataclasses import dataclass
from typing import Protocol

from backend.app.models.auth_token import AuthToken, UserRole


@dataclass
class LoginResult:
    """ผลลัพธ์ Login สำเร็จสำหรับ response ของ POST /api/login."""

    token_value: str
    expires_at_iso: str
    role: UserRole


@dataclass
class VerifiedUser:
    """ผลการยืนยันบัญชีจาก CredentialVerifier."""

    user_id: str
    role: UserRole


class CredentialVerifier(Protocol):
    """สัญญาสำหรับแหล่งข้อมูลบัญชีที่ทีมจะนำมาเชื่อมภายหลัง."""

    def verify(self, username: str, password: str) -> VerifiedUser | None:
        """คืนผู้ใช้เมื่อข้อมูลถูกต้อง หรือ None โดยไม่เปิดเผยสาเหตุที่ผิด."""
        ...


def authenticate(
    verifier: CredentialVerifier,
    username: str,
    password: str,
) -> LoginResult | None:
    """ตรวจบัญชีและออก Token เมื่อสำเร็จ รองรับ FR-AUTH-03, FR-AUTH-04 และ IF-TOKEN-01."""
    verified = verifier.verify(username, password)
    if verified is None:
        return None

    token = AuthToken(
        token_value=secrets.token_urlsafe(48),
        user_id=verified.user_id,
        role=verified.role,
    )
    token.expires_at = AuthToken.compute_expiry(token.issued_at)

    return LoginResult(
        token_value=token.token_value,
        expires_at_iso=token.expires_at.isoformat(),
        role=token.role,
    )

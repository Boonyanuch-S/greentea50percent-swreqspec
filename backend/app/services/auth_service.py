"""บริการเข้าสู่ระบบแบบ contract/skeleton รองรับ FR-AUTH-03 และ FR-AUTH-04."""

from __future__ import annotations

import secrets
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Protocol

from ..models.auth_token import AuthToken, UserRole
from ..models.authenticated_user_context import AuthenticatedUserContext


@dataclass
class LoginResult:
    """ผลลัพธ์ Login สำเร็จสำหรับ response ของ POST /api/login."""

    token_value: str
    expires_at_iso: str
    role: UserRole
    user_id: str = ""
    display_name: str = ""
    unit: str = ""
    expires_at: datetime | None = None


@dataclass
class VerifiedUser:
    """ผลการยืนยันบัญชีจาก CredentialVerifier."""

    user_id: str
    role: UserRole
    display_name: str = ""
    unit: str = ""


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
        user_id=verified.user_id,
        display_name=verified.display_name,
        unit=verified.unit,
        expires_at=token.expires_at,
    )


# บัญชีตัวอย่างของ prototype ตามคำสั่งทีม ยังไม่ใช่แหล่งบัญชีจริง
SAMPLE_ACCOUNTS = (
    ("boonliang_t@silpakorn.edu", "club1234", UserRole.CLUB_COMMITTEE, "นางสาวธิติมาพร บุญเลี้ยง", "สโมสรนักศึกษาคณะวิทยาศาสตร์"),
    ("faculty@silpakorn.edu", "faculty1234", UserRole.FACULTY_OFFICER, "เจ้าหน้าที่คณะวิทยาศาสตร์ (บัญชีตัวอย่าง)", "คณะวิทยาศาสตร์"),
    ("intuwet_p@silpakorn.edu", "advisor1234", UserRole.ADVISOR, "ผู้ช่วยศาสตราจารย์ ดร.พชรพล อินทุเวศ", "คณะวิทยาศาสตร์"),
    ("preechawai_p@silpakorn.edu", "affairs1234", UserRole.STUDENT_AFFAIRS_OFFICER, "นางสาวปัทมรัตน์ ปรีชาไว", "กองกิจการนักศึกษา"),
)


class SampleAccountVerifier:
    """ตรวจบัญชีตัวอย่างโดยไม่บอกว่าผิดที่ใด ตาม FR-AUTH-03 และ SEC-AUTHMSG-01."""

    def verify(self, username: str, password: str) -> VerifiedUser | None:
        for account_name, account_password, role, display_name, unit in SAMPLE_ACCOUNTS:
            if account_name == username and secrets.compare_digest(
                account_password.encode(),
                password.encode(),
            ):
                return VerifiedUser(account_name, role, display_name, unit)
        return None


class TokenRegistry:
    """เก็บ Token ที่ออกแล้วใน memory และตรวจวันหมดอายุ ตาม IF-TOKEN-01 และ CON-NFR-21."""

    def __init__(self) -> None:
        self._tokens: dict[str, tuple[AuthenticatedUserContext, datetime]] = {}

    def register(
        self,
        token_value: str,
        context: AuthenticatedUserContext,
        expires_at: datetime,
    ) -> None:
        self._tokens[token_value] = (context, expires_at)

    def resolve(self, token_value: str | None) -> AuthenticatedUserContext | None:
        """คืนผู้ใช้ของ Token ที่ยังไม่หมดอายุ หรือ None ตาม IF-TOKEN-01 และ NFR-SEC-01."""
        entry = self._tokens.get(token_value or "")
        if entry is None:
            return None
        context, expires_at = entry
        if datetime.now(timezone.utc).replace(tzinfo=None) >= expires_at:
            del self._tokens[token_value]
            return None
        return context


token_registry = TokenRegistry()

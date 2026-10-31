"""Login API contract รองรับ FR-AUTH-03 และ FR-AUTH-04."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from ..models.authenticated_user_context import AuthenticatedUserContext
from ..services.auth_service import (
    CredentialVerifier,
    SampleAccountVerifier,
    authenticate,
    token_registry,
)

# หลังบ้านไม่มีคำนำหน้า /api เพราะ Vite ตัดออกก่อนส่งต่อ
router = APIRouter(tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginProfile(BaseModel):
    username: str
    displayName: str
    unit: str


class LoginResponse(BaseModel):
    token: str
    expires_at: str
    role: str
    profile: LoginProfile


GENERIC_INVALID_CREDENTIALS_MESSAGE = "บัญชีหรือรหัสผ่านไม่ถูกต้อง"


def get_credential_verifier() -> CredentialVerifier:
    """ใช้บัญชีตัวอย่างตามคำสั่งทีมจนกว่าจะมีแหล่งบัญชีจริง."""
    return SampleAccountVerifier()


@router.post("/login", response_model=LoginResponse)
def login(
    payload: LoginRequest,
    verifier: CredentialVerifier = Depends(get_credential_verifier),
) -> LoginResponse:
    """รับ username/password และคืน token, expires_at, role ตาม FR-AUTH-03/04."""
    result = authenticate(verifier, payload.username, payload.password)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=GENERIC_INVALID_CREDENTIALS_MESSAGE,
        )

    token_registry.register(
        result.token_value,
        AuthenticatedUserContext(
            user_id=result.user_id,
            role=result.role,
            authenticated_at=datetime.now(timezone.utc),
        ),
        result.expires_at,
    )
    return LoginResponse(
        token=result.token_value,
        # ระบุ UTC ให้ชัด เบราว์เซอร์จึงไม่อ่านเป็นเวลาท้องถิ่นตาม IF-TOKEN-01
        expires_at=result.expires_at.replace(tzinfo=timezone.utc).isoformat(),
        role=result.role.value,
        profile=LoginProfile(
            username=result.user_id,
            displayName=result.display_name,
            unit=result.unit,
        ),
    )

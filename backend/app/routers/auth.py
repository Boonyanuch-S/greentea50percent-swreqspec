"""Login API contract รองรับ FR-AUTH-03 และ FR-AUTH-04."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from backend.app.services.auth_service import CredentialVerifier, VerifiedUser, authenticate

router = APIRouter(prefix="/api", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str
    expires_at: str
    role: str


GENERIC_INVALID_CREDENTIALS_MESSAGE = "บัญชีหรือรหัสผ่านไม่ถูกต้อง"


class _UnconfiguredVerifier:
    """ตัวแทนรอแหล่งข้อมูลบัญชีจริงตาม Open Questions ของ spec."""

    def verify(self, username: str, password: str) -> VerifiedUser | None:
        raise NotImplementedError("ยังไม่มีแหล่งข้อมูลบัญชีผู้ใช้ที่ทีมยืนยัน")


def get_credential_verifier() -> CredentialVerifier:
    """จุด inject verifier เพื่อไม่เดาแหล่งข้อมูลบัญชีผู้ใช้."""
    return _UnconfiguredVerifier()


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

    return LoginResponse(
        token=result.token_value,
        expires_at=result.expires_at_iso,
        role=result.role.value,
    )

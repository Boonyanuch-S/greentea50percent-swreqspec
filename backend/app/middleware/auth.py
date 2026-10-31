from collections.abc import Awaitable, Callable

from fastapi import Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.types import ASGIApp, Receive, Scope, Send

from ..models.auth_token import UserRole
from ..models.authenticated_user_context import AuthenticatedUserContext
from ..services.auth_service import token_registry


class ReviewAuthenticationMiddleware:
    """ปฏิเสธคิวและรายละเอียดเอกสารที่ไม่มี Login ตาม CON-NFR-21 และ NFR-SEC-01."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http" and self._requires_authentication(scope["path"]):
            headers = dict(scope.get("headers", []))
            if not headers.get(b"authorization"):
                response = JSONResponse(
                    {"detail": "ต้องยืนยันตัวตนก่อนเข้าถึงเอกสาร"},
                    status_code=401,
                )
                await response(scope, receive, send)
                return
        await self.app(scope, receive, send)

    @staticmethod
    def _requires_authentication(path: str) -> bool:
        return path == "/review-queue" or path.startswith("/submissions/")


def require_authenticated_user(request: Request) -> str:
    """ตรวจ authentication reference สำหรับ router ตาม CON-NFR-21 และ NFR-SEC-01."""
    authorization = request.headers.get("Authorization")
    if not authorization:
        raise HTTPException(status_code=401, detail="ต้องยืนยันตัวตนก่อนเข้าถึงเอกสาร")
    return authorization


def require_authenticated_context(request: Request) -> AuthenticatedUserContext:
    """ตรวจ Token ที่ออกจาก Login จริงตาม CON-NFR-21, NFR-SEC-01 และ IF-TOKEN-01."""
    context = token_registry.resolve(request.headers.get("Authorization"))
    if context is None:
        raise HTTPException(status_code=401, detail="ต้องยืนยันตัวตนก่อนเข้าถึงเอกสาร")
    return context


def require_roles(*roles: UserRole) -> Callable[..., AuthenticatedUserContext]:
    """จำกัดฟังก์ชันตามบทบาทจาก Token ตาม FR-APR-03, FR-APR-05, FR-APR-06 และ DOM-PDPA-02."""

    def dependency(
        context: AuthenticatedUserContext = Depends(require_authenticated_context),
    ) -> AuthenticatedUserContext:
        if context.role not in roles:
            raise HTTPException(status_code=403, detail="บทบาทนี้ไม่มีสิทธิ์ดำเนินการ")
        return context

    return dependency


def require_late_submission_user(request: Request) -> str:
    """ตรวจ session ก่อนใช้ฟีเจอร์ย้อนหลังตาม CON-NFR-21 และ NFR-SEC-01."""
    session_reference = request.headers.get("Authorization")
    if not session_reference:
        raise HTTPException(status_code=401, detail="ต้องยืนยันตัวตนก่อนใช้คำขอย้อนหลัง")
    return session_reference

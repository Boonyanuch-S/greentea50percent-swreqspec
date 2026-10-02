from collections.abc import Awaitable, Callable

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.types import ASGIApp, Receive, Scope, Send


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

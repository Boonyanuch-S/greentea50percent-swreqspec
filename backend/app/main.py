from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.types import ASGIApp, Receive, Scope, Send

from .routers.auth import router as auth_router
from .routers.checklists import checklist_router
from .api.activity_hours import activity_hours_router
from .api.activity_data import activity_data_router
from .api.hours_submission import hours_submission_router
from .routers.project_approvals import project_approval_router
from .routers.project_documents import project_document_router
from .routers.review_queue import review_queue_router
from .routers.review_decisions import review_decision_router


# Рวบรวม API คิวและรายละเอียดโครงการตาม FR-VDC-01, FR-VDC-02, CON-NFR-21 และ NFR-SEC-01
app = FastAPI()
app.include_router(auth_router)
app.include_router(activity_hours_router)
app.include_router(review_queue_router)
app.include_router(checklist_router)
app.include_router(activity_data_router)
# เปิด API หน้าส่งข้อมูลชั่วโมงตาม FR-SBH-01 และ CON-NFR-21
app.include_router(hours_submission_router)
app.include_router(review_decision_router)
app.include_router(project_approval_router)
app.include_router(project_document_router)


class StripApiPrefix:
    """รับ /api เหมือน proxy ของ Vite เพื่อให้หน้าเว็บที่ build แล้วเรียก API ผ่านพอร์ตเดียวกันได้ (ไม่ผูก FR)."""

    def __init__(self, inner: ASGIApp) -> None:
        self.inner = inner

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http" and scope["path"].startswith("/api/"):
            scope = {**scope, "path": scope["path"].removeprefix("/api")}
        await self.inner(scope, receive, send)


app.add_middleware(StripApiPrefix)

# แสดงหน้าเว็บที่ build แล้วที่พอร์ตเดียวกับ API ต้องวางท้ายสุดเพื่อไม่ทับเส้นทาง API
FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if FRONTEND_DIST.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")

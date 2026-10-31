from fastapi import FastAPI

from .routers.auth import router as auth_router
from .routers.checklists import checklist_router
from .routers.project_approvals import project_approval_router
from .routers.review_queue import review_queue_router
from .routers.review_decisions import review_decision_router


# Рวบรวม API คิวและรายละเอียดโครงการตาม FR-VDC-01, FR-VDC-02, CON-NFR-21 และ NFR-SEC-01
app = FastAPI()
app.include_router(auth_router)
app.include_router(review_queue_router)
app.include_router(checklist_router)
app.include_router(review_decision_router)
app.include_router(project_approval_router)

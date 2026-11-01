from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from backend.app.models.authenticated_user_context import AuthenticatedUserContext
from backend.auth.activity_hours_guard import require_activity_hours_user


def test_AC_HRS_08_unauthenticated_user_is_denied() -> None:
    """ผู้ไม่มี Login ถูกปฏิเสธเมื่อเปิดคิวตาม AC-HRS-08."""
    app = FastAPI()

    @app.get("/activity-hours/documents/pending")
    def pending_documents(
        user_context: AuthenticatedUserContext = Depends(require_activity_hours_user),
    ) -> dict[str, str]:
        return {"user_id": user_context.user_id}

    response = TestClient(app).get("/activity-hours/documents/pending")

    assert response.status_code == 401

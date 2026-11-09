from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.api.template_config import get_template_session
from backend.app.main import app
from backend.app.models.activity import Base
from backend.app.models.authenticated_user_context import AuthenticatedUserContext
from backend.app.models.auth_token import UserRole
from backend.app.models.template_config import SubmissionTemplateConfig
from backend.app.services.auth_service import token_registry


def test_template_registry_returns_only_configured_ready_templates():
    """ยืนยันว่า API คืนเฉพาะ template พร้อมใช้จาก config และไม่ hardcode รายการตาม IF-TPL-01."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session = Session(engine)
    token = "test-template-registry-token"
    now = datetime.now(timezone.utc)
    token_registry.register(
        token,
        AuthenticatedUserContext("committee-1", UserRole.CLUB_COMMITTEE, now),
        now.replace(tzinfo=None) + timedelta(minutes=30),
    )
    app.dependency_overrides[get_template_session] = lambda: session

    try:
        session.add_all(
            [
                SubmissionTemplateConfig(
                    template_id="TEMPLATE-A",
                    version="2.1",
                    active_flag=True,
                    uploaded_by="officer-1",
                ),
                SubmissionTemplateConfig(
                    template_id="TEMPLATE-B",
                    version="1.0",
                    active_flag=False,
                    uploaded_by="officer-1",
                ),
            ]
        )
        session.commit()

        response = TestClient(app, headers={"Authorization": token}).get(
            "/config/templates"
        )

        assert response.status_code == 200
        assert response.json() == [{"template_id": "TEMPLATE-A", "version": "2.1"}]
    finally:
        app.dependency_overrides.pop(get_template_session, None)
        session.close()
        engine.dispose()


def test_template_registry_rejects_unauthenticated_access():
    """ยืนยันว่า API registry ต้องผ่าน Login ตาม CON-NFR-21."""
    response = TestClient(app).get("/config/templates")

    assert response.status_code == 401

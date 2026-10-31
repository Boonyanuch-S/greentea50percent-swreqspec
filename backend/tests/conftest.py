from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.models.auth_token import UserRole
from backend.app.models.authenticated_user_context import AuthenticatedUserContext
from backend.app.routers.project_approvals import get_project_approval_service
from backend.app.services.auth_service import token_registry
from backend.app.services.project_approval_service import create_sample_project_approval_service

ADVISOR_ID = "intuwet_p@silpakorn.edu"
OFFICE_ID = "preechawai_p@silpakorn.edu"


def _client_for(user_id, role):
    token = f"test-token-{role.value}"
    now = datetime.now(timezone.utc)
    token_registry.register(
        token,
        AuthenticatedUserContext(user_id, role, now),
        now.replace(tzinfo=None) + timedelta(minutes=30),
    )
    return TestClient(app, headers={"Authorization": token})


@pytest.fixture
def service():
    sample_service = create_sample_project_approval_service()
    app.dependency_overrides[get_project_approval_service] = lambda: sample_service
    yield sample_service
    app.dependency_overrides.pop(get_project_approval_service)


@pytest.fixture
def advisor(service):
    return _client_for(ADVISOR_ID, UserRole.ADVISOR)


@pytest.fixture
def office(service):
    return _client_for(OFFICE_ID, UserRole.STUDENT_AFFAIRS_OFFICER)


@pytest.fixture
def club(service):
    return _client_for("boonliang_t@silpakorn.edu", UserRole.CLUB_COMMITTEE)

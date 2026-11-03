from fastapi import Depends

from backend.app.middleware.auth import require_roles
from backend.app.models.auth_token import UserRole
from backend.app.models.authenticated_user_context import AuthenticatedUserContext


def require_activity_hours_user(
    user_context: AuthenticatedUserContext = Depends(require_roles(UserRole.STUDENT_AFFAIRS_OFFICER)),
) -> AuthenticatedUserContext:
    """จำกัดคิวชั่วโมงกิจกรรมให้เจ้าหน้าที่กองกิจที่ Login แล้ว ตาม CON-NFR-21, NFR-SEC-01 และ UC-07."""
    return user_context

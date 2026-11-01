from fastapi import Depends

from backend.app.middleware.auth import require_authenticated_context
from backend.app.models.authenticated_user_context import AuthenticatedUserContext


def require_activity_hours_user(
    user_context: AuthenticatedUserContext = Depends(require_authenticated_context),
) -> AuthenticatedUserContext:
    """กำหนดให้เข้าคิวชั่วโมงกิจกรรมต้องผ่าน Login ตาม CON-NFR-21 และ NFR-SEC-01."""
    return user_context

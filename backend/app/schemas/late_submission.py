from datetime import date

from pydantic import BaseModel, ConfigDict


class LateActivityResponse(BaseModel):
    """ข้อมูลกิจกรรมที่เลยกำหนดสำหรับ FR-LATE-01."""

    model_config = ConfigDict(from_attributes=True)

    activity_id: int
    owner_user_id: str
    name: str
    activity_date: date
    regular_submission_deadline: date

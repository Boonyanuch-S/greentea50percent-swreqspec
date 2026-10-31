from datetime import date

from pydantic import BaseModel, ConfigDict


class HoursSubmissionActivityResponse(BaseModel):
    """ข้อมูลกิจกรรมที่เปิดหน้าส่งชั่วโมงได้ตาม FR-SBH-01 และ FR-SBH-06."""

    model_config = ConfigDict(from_attributes=True)

    activity_id: int
    activity_name: str
    status: str
    end_date: date
    project_number_status: str | None
    category_template_id: str | None


class HoursSubmissionDetailResponse(HoursSubmissionActivityResponse):
    """ข้อมูลกิจกรรมพร้อมสถานะเกินกำหนดตาม FR-SBH-07 และ ASM-03."""

    deadline_exceeded: bool


class ActivityPersonResponse(BaseModel):
    """ข้อมูลผู้เกี่ยวข้องของกิจกรรมตาม FR-SBH-02."""

    model_config = ConfigDict(from_attributes=True)

    participant_id: int | None = None
    staff_id: int | None = None
    activity_id: int
    user_id: str
    role_type: str


class ActivityPeopleResponse(BaseModel):
    """รายชื่อผู้เข้าร่วมและ Staff ตาม FR-SBH-02."""

    participants: list[ActivityPersonResponse]
    staff: list[ActivityPersonResponse]


class ActivityHourTypeResponse(BaseModel):
    """ประเภทชั่วโมงที่ผูกระดับกิจกรรมตาม FR-SBH-02 และ ASM-05."""

    model_config = ConfigDict(from_attributes=True)

    hour_type_id: int
    activity_id: int
    name: str
    code: str

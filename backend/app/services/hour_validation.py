from collections.abc import Sequence

from ..models.activity_hours import ActivityParticipantHour
from ..models.hour_criteria import HourCriteria


def mark_participants_with_unmatched_hour_types(
    participants: Sequence[ActivityParticipantHour],
    criteria: Sequence[HourCriteria],
) -> list[ActivityParticipantHour]:
    """ทำเครื่องหมายเฉพาะประเภทชั่วโมงที่ไม่อยู่ในเกณฑ์ active ตาม FR-HRS-03, FR-HRS-06 และ ASM-03."""
    allowed_hour_types = {item.hour_type for item in criteria}
    invalid_participants: list[ActivityParticipantHour] = []

    for participant in participants:
        if participant.reported_hour_type not in allowed_hour_types:
            participant.validation_status = "ไม่ตรงเกณฑ์"
            participant.validation_message = "ไม่พบประเภทชั่วโมงในเกณฑ์ของปีการศึกษานี้"
            invalid_participants.append(participant)

    return invalid_participants

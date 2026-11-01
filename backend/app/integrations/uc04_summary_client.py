from collections.abc import Callable
from typing import TypeAlias

from fastapi import HTTPException, Request

SummaryPayload: TypeAlias = dict[str, object]
SummaryProvider: TypeAlias = Callable[[int, str], SummaryPayload]


class UC04SummaryClient:
    """ส่งคำขอสรุปรายบุคคลไปยัง provider จำลองตาม FR-HRS-08 และ AC-HRS-07."""

    def __init__(self, summary_provider: SummaryProvider) -> None:
        self._summary_provider = summary_provider

    def get_individual_summary(
        self,
        document_id: int,
        participant_id: str,
    ) -> SummaryPayload:
        """เรียก provider สำหรับเอกสารและผู้เข้าร่วมที่เลือกตาม FR-HRS-08."""
        return self._summary_provider(document_id, participant_id)


def get_uc04_summary_client(request: Request) -> UC04SummaryClient:
    """รับ provider จำลองจาก app state ตาม FR-HRS-08."""
    summary_provider = getattr(request.app.state, "uc04_summary_provider", None)
    if not callable(summary_provider):
        raise HTTPException(
            status_code=503,
            detail="ยังไม่ได้ตั้งค่า provider สรุปข้อมูล UC-04",
        )
    return UC04SummaryClient(summary_provider)

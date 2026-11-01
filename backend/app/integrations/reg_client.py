from collections.abc import Callable
from datetime import datetime, timezone
from typing import Protocol, TypeAlias

from ..models.reg_submission import (
    RegClientResponse,
    RegSubmission,
    RegSubmissionPayload,
)

RegTransport: TypeAlias = Callable[[RegSubmissionPayload], RegClientResponse]
Clock: TypeAlias = Callable[[], datetime]


class RegTimeoutTransport(Protocol):
    """Transport ที่ต้องบังคับ timeout ณ ชั้นเชื่อมต่อจริงตาม IF-REG-01 และ Q-03."""

    def __call__(
        self,
        payload: RegSubmissionPayload,
        *,
        timeout_seconds: float,
    ) -> RegClientResponse: ...


class RegClient:
    """ส่งข้อมูลชั่วโมงผ่าน transport ที่กำหนดจากภายนอกตาม IF-REG-01 และ FR-HRS-04."""

    def __init__(
        self,
        transport: RegTransport | None = None,
        clock: Clock | None = None,
        *,
        timeout_transport: RegTimeoutTransport | None = None,
        timeout_seconds: float | None = None,
    ) -> None:
        if (transport is None) == (timeout_transport is None):
            raise ValueError("ต้องกำหนด transport เพียงแบบเดียว")
        if (timeout_transport is None) != (timeout_seconds is None):
            raise ValueError("ต้องกำหนด timeout พร้อม timeout transport")
        self._transport = transport
        self._timeout_transport = timeout_transport
        self._timeout_seconds = timeout_seconds
        self._clock = clock or (lambda: datetime.now(timezone.utc))

    def submit(self, payload: RegSubmissionPayload) -> RegSubmission:
        """ส่งข้อมูลหนึ่งครั้งและเก็บผลตอบกลับกับ metadata ตาม IF-REG-01 และ FR-HRS-04."""
        attempted_at = self._clock()
        if self._timeout_transport is not None:
            if self._timeout_seconds is None:
                raise RuntimeError("ไม่พบค่า timeout สำหรับ REG")
            try:
                response = self._timeout_transport(
                    payload,
                    timeout_seconds=self._timeout_seconds,
                )
            except TimeoutError:
                response = RegClientResponse(
                    response_status="timeout",
                    error_message="ส่งข้อมูลไม่สำเร็จ",
                )
        else:
            if self._transport is None:
                raise RuntimeError("ไม่พบ transport สำหรับ REG")
            response = self._transport(payload)
        return RegSubmission(
            document_id=payload.document_id,
            submitted_data=payload.to_dict(),
            submitted_at=attempted_at,
            response_status=response.response_status,
            error_message=response.error_message,
            last_attempt_at=attempted_at,
            attempt_count=1,
        )

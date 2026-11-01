from datetime import datetime, timezone
from decimal import Decimal

import pytest

from app.integrations.reg_client import RegClient
from app.models.reg_submission import (
    RegClientResponse,
    RegParticipantHour,
    RegSubmission,
    RegSubmissionPayload,
)


@pytest.mark.parametrize(
    ("response_status", "error_message"),
    [("success", None), ("failed", "REG ปฏิเสธคำขอ")],
)
def test_reg_client_contract_records_payload_response_and_attempt(
    response_status: str,
    error_message: str | None,
) -> None:
    attempted_at = datetime(2026, 10, 31, 23, 0, tzinfo=timezone.utc)
    payload = RegSubmissionPayload(
        document_id=41,
        participant_hours=(
            RegParticipantHour(
                student_reference="S-001",
                reported_hour_type="จิตอาสา",
                reported_hours=Decimal("2.50"),
            ),
        ),
    )
    sent_payloads: list[RegSubmissionPayload] = []

    def transport(request: RegSubmissionPayload) -> RegClientResponse:
        sent_payloads.append(request)
        return RegClientResponse(
            response_status=response_status,
            error_message=error_message,
        )

    submission = RegClient(transport, clock=lambda: attempted_at).submit(payload)

    assert sent_payloads == [payload]
    assert isinstance(submission, RegSubmission)
    assert submission.document_id == 41
    assert submission.submitted_data == {
        "document_id": 41,
        "participant_hours": [
            {
                "student_reference": "S-001",
                "reported_hour_type": "จิตอาสา",
                "reported_hours": "2.50",
            },
        ],
    }
    assert submission.response_status == response_status
    assert submission.error_message == error_message
    assert submission.submitted_at == attempted_at
    assert submission.last_attempt_at == attempted_at
    assert submission.attempt_count == 1

from time import perf_counter

from backend.app.config import REG_TIMEOUT_SECONDS
from backend.app.integrations.reg_client import RegClient
from backend.app.models.reg_submission import (
    RegClientResponse,
    RegSubmissionPayload,
)


def test_reg_performance_nfr_perf_01_success_within_configured_timeout() -> None:
    """ตรวจ success response ภายใน 5 วินาทีตาม NFR-PERF-01, IF-REG-01 และ Q-03."""
    payload = RegSubmissionPayload(document_id=41, participant_hours=())
    timeout_values: list[float] = []

    def timeout_transport(
        request: RegSubmissionPayload,
        *,
        timeout_seconds: float,
    ) -> RegClientResponse:
        timeout_values.append(timeout_seconds)
        return RegClientResponse(response_status="success")

    started_at = perf_counter()
    submission = RegClient(
        timeout_transport=timeout_transport,
        timeout_seconds=REG_TIMEOUT_SECONDS,
    ).submit(payload)
    elapsed_seconds = perf_counter() - started_at

    assert REG_TIMEOUT_SECONDS == 5
    assert timeout_values == [REG_TIMEOUT_SECONDS]
    assert submission.response_status == "success"
    assert elapsed_seconds <= REG_TIMEOUT_SECONDS

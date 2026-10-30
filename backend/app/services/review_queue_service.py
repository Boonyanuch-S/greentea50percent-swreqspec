from collections.abc import Iterable

from ..models.project_submission import ProjectSubmission


class ReviewQueueService:
    """จัดเรียงและค้นหาเอกสารโครงการ รองรับ FR-VDC-01 และ FR-VDC-02."""

    def __init__(self, submissions: Iterable[ProjectSubmission] = ()) -> None:
        self._submissions = list(submissions)

    def list_pending(self) -> list[ProjectSubmission]:
        """เรียงคิวรอตรวจตามเวลาส่งและ submission_id ตาม FR-VDC-01 และ Q-06."""
        return sorted(
            (submission for submission in self._submissions if submission.status == "รอตรวจสอบ"),
            key=lambda submission: (
                submission.submitted_at,
                submission.submission_id,
            ),
        )

    def get_submission(self, submission_id: int) -> ProjectSubmission | None:
        return next(
            (submission for submission in self._submissions if submission.submission_id == submission_id),
            None,
        )

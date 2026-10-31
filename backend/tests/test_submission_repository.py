from datetime import datetime, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from backend.app.models.activity import Activity, Base
from backend.app.models.hours_submission import (
    HoursSubmission,
    ProjectNumberStatus,
    ReviewQueueEntry,
)
from backend.app.repositories.submission import SubmissionRepository


def test_submission_repository_persists_project_number_submission_and_queue():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        activity = Activity(
            activity_id=1,
            owner_user_id="club-1",
            name="กิจกรรมทดสอบ",
            activity_date=datetime(2026, 10, 1).date(),
            regular_submission_deadline=datetime(2026, 10, 30).date(),
            status="จบแล้ว",
        )
        session.add(activity)
        session.flush()

        number_status = SubmissionRepository.add_project_number_status(
            session,
            ProjectNumberStatus(
                project_number_id=1,
                activity_id=1,
                status="พร้อม",
                updated_at=datetime(2026, 10, 31, tzinfo=timezone.utc),
            ),
        )
        submission = SubmissionRepository.add_hours_submission(
            session,
            HoursSubmission(
                submission_id=1,
                activity_id=1,
                generated_file_ref="file-reference",
                created_by="club-1",
                submitted_at=datetime(2026, 10, 31, tzinfo=timezone.utc),
                status="ส่งแล้ว",
            ),
        )
        queue_entry = SubmissionRepository.add_review_queue_entry(
            session,
            ReviewQueueEntry(
                queue_entry_id=1,
                submission_id=submission.submission_id,
                reviewer_group="เจ้าหน้าที่กองกิจ",
                queue_status="รอตรวจ",
            ),
        )
        session.commit()

        assert session.get(ProjectNumberStatus, number_status.project_number_id) is not None
        assert session.get(HoursSubmission, submission.submission_id) is not None
        assert session.get(ReviewQueueEntry, queue_entry.queue_entry_id) is not None

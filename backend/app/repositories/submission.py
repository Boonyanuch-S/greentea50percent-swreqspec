from sqlalchemy.orm import Session

from ..models.hours_submission import HoursSubmission, ProjectNumberStatus, ReviewQueueEntry


class SubmissionRepository:
    """บันทึกข้อมูลเลขสรุป รายการส่ง และคิวตรวจตาม FR-SBH-05, FR-SBH-06, IF-PRJNUM-01 และ IF-UC07-01."""

    @staticmethod
    def add_project_number_status(
        session: Session,
        project_number_status: ProjectNumberStatus,
    ) -> ProjectNumberStatus:
        """เพิ่มสถานะเลขสรุปที่ได้รับจาก UC-04 ตาม FR-SBH-06 และ IF-PRJNUM-01."""
        session.add(project_number_status)
        session.flush()
        return project_number_status

    @staticmethod
    def add_hours_submission(
        session: Session,
        hours_submission: HoursSubmission,
    ) -> HoursSubmission:
        """เพิ่มรายการส่งชั่วโมงตาม FR-SBH-05."""
        session.add(hours_submission)
        session.flush()
        return hours_submission

    @staticmethod
    def add_review_queue_entry(
        session: Session,
        queue_entry: ReviewQueueEntry,
    ) -> ReviewQueueEntry:
        """เพิ่มรายการเข้าคิว UC-07 ตาม FR-SBH-05 และ IF-UC07-01."""
        session.add(queue_entry)
        session.flush()
        return queue_entry

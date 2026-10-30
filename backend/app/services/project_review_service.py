from sqlalchemy import Boolean, ForeignKey, Integer, String, UniqueConstraint, delete, select
from sqlalchemy.orm import Mapped, Session, mapped_column

from ..models.checklist_item import ChecklistBase
from .checklist_service import ChecklistService


class ChecklistEvaluation(ChecklistBase):
    """เก็บการเลือกรายการและผลตรวจรายเอกสาร ตาม FR-VDC-03 และ ASM-03."""

    __tablename__ = "checklist_evaluations"
    __table_args__ = (
        UniqueConstraint(
            "submission_id",
            "checklist_item_id",
            name="uq_submission_checklist_item",
        ),
    )

    evaluation_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    submission_id: Mapped[int] = mapped_column(Integer, nullable=False)
    checklist_item_id: Mapped[int] = mapped_column(
        ForeignKey("checklist_items.checklist_item_id"),
        nullable=False,
    )
    selected: Mapped[bool] = mapped_column(Boolean, nullable=False)
    result: Mapped[str | None] = mapped_column(String, nullable=True)


class ProjectReviewService:
    """อ่านและบันทึก Checklist ฉบับล่าสุดแยกตามเอกสาร ตาม FR-VDC-02, FR-VDC-03 และ IF-CHK-02."""

    @staticmethod
    def list_latest_evaluations(
        session: Session,
        submission_id: int,
    ) -> list[dict[str, int | str | bool | None]]:
        """รวมรายการฉบับล่าสุดกับผลตรวจของเอกสาร ตาม FR-VDC-03, FR-VDC-07 และ IF-CHK-02."""
        rule = ChecklistService.latest_rule(session)
        if rule is None:
            return []

        latest_items = ChecklistService.latest_items(session)
        evaluations = {
            evaluation.checklist_item_id: evaluation
            for evaluation in session.scalars(
                select(ChecklistEvaluation).where(
                    ChecklistEvaluation.submission_id == submission_id
                )
            )
        }

        return [
            {
                "checklist_item_id": item.checklist_item_id,
                "item_name": item.item_name,
                "selected": (
                    evaluations[item.checklist_item_id].selected
                    if item.checklist_item_id in evaluations
                    else False
                ),
                "result": (
                    evaluations[item.checklist_item_id].result
                    if item.checklist_item_id in evaluations
                    else None
                ),
            }
            for item in latest_items
        ]

    @staticmethod
    def save_evaluations(
        session: Session,
        submission_id: int,
        evaluations: list[dict[str, int | str | bool | None]],
    ) -> list[dict[str, int | str | bool | None]]:
        """บันทึกผลตามรายการที่ส่งมาโดยผูกกับ stable item ID ตาม FR-VDC-03 และ ASM-03."""
        latest_item_ids = {
            item.checklist_item_id
            for item in ChecklistService.latest_items(session)
        }
        submitted_item_ids = {int(item["checklist_item_id"]) for item in evaluations}
        if not submitted_item_ids.issubset(latest_item_ids):
            raise ValueError("มีรายการ Checklist ที่ไม่อยู่ในฉบับล่าสุด")

        session.execute(
            delete(ChecklistEvaluation).where(
                ChecklistEvaluation.submission_id == submission_id
            )
        )
        session.add_all(
            [
                ChecklistEvaluation(
                    submission_id=submission_id,
                    checklist_item_id=int(item["checklist_item_id"]),
                    selected=bool(item["selected"]),
                    result=item["result"],
                )
                for item in evaluations
            ]
        )
        session.flush()
        return ProjectReviewService.list_latest_evaluations(session, submission_id)

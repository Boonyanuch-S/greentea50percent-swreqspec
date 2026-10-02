from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Project(Base):
    """โมเดลโครงการที่ใช้กรองกิจกรรมจบแล้วตาม FR-SUM-01 และ FR-SUM-02."""

    __tablename__ = "projects"

    project_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    activity_end_status: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    faculty_id: Mapped[str] = mapped_column(String, nullable=False)

    evaluations: Mapped[list["ProjectEvaluation"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
    )

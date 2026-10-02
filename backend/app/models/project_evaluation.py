from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .project import Base, Project


class ProjectEvaluation(Base):
    """โมเดลผลประเมินที่เชื่อมกับโครงการตาม FR-SUM-02."""

    __tablename__ = "project_evaluations"

    evaluation_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.project_id"), nullable=False)
    evaluation_data: Mapped[str] = mapped_column(Text, nullable=False)

    project: Mapped[Project] = relationship(back_populates="evaluations")

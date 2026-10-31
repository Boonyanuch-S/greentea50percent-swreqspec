from datetime import date


class DeadlineCheckService:
    """ตรวจ deadline ที่กำหนดไว้โดยไม่สร้างกำหนดส่งใหม่ ตาม FR-SBH-07 และ ASM-03."""

    @staticmethod
    def is_deadline_exceeded(
        deadline: date | None,
        as_of: date | None = None,
    ) -> bool:
        """คืนจริงเมื่อ deadline ที่มีอยู่ผ่านไปแล้ว; ไม่มี deadline จะไม่ถือว่าเกิน."""
        if deadline is None:
            return False
        current_date = as_of if as_of is not None else date.today()
        return deadline < current_date

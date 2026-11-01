# ชนิดไฟล์ใบปะหน้าที่รับได้และลายเซ็นต้นไฟล์ ตาม IF-UPLOAD-01 และคำตอบ Q-03 ของ specs/005
COVER_SHEET_SIGNATURES = {
    ".pdf": b"%PDF",
    ".jpg": b"\xff\xd8\xff",
    ".jpeg": b"\xff\xd8\xff",
    ".png": b"\x89PNG",
}
COVER_SHEET_ALLOWED_EXTENSIONS = tuple(COVER_SHEET_SIGNATURES)
# ขนาดไฟล์ใบปะหน้าสูงสุด ตาม IF-UPLOAD-01 และคำตอบ Q-03 ของ specs/005
COVER_SHEET_MAX_MEGABYTES = 10
COVER_SHEET_MAX_BYTES = COVER_SHEET_MAX_MEGABYTES * 1024 * 1024
# Timeout ส่งข้อมูลไป REG ตาม IF-REG-01, NFR-PERF-01 และ Q-03
REG_TIMEOUT_SECONDS = 5
# จำนวนครั้งที่ส่ง REG รวมการลองครั้งแรกและการส่งซ้ำด้วยตนเองตาม IF-REG-01 และ Q-03
REG_MAX_ATTEMPTS = 2

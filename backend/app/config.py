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

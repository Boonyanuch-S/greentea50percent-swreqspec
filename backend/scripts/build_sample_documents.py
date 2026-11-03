"""สร้าง PDF เอกสารตัวอย่างของ prototype: ใช้ตอนพัฒนาเท่านั้น ระบบไม่ได้เรียกสคริปต์นี้ตอนทำงาน

โครงเอกสารอ้างอิงแบบฟอร์มจาก https://dsa.su.ac.th/ksu/?page_id=306 แต่เนื้อหาและชื่อบุคคลเป็นข้อมูลสมมติทั้งหมด
PyMuPDF และฟอนต์ IBM Plex Sans Thai ทีมเลือกเอง ไม่ได้มาจาก spec

วิธีใช้: PYTHONPATH=. python backend/scripts/build_sample_documents.py <โฟลเดอร์ที่มีไฟล์ฟอนต์ .ttf>
"""
import io
import sys
from pathlib import Path

import pymupdf

from backend.app.services.project_approval_service import (
    INCOMPLETE_SAMPLE_APPROVAL_ID,
    OFFICE_REVIEW_SAMPLES,
    SAMPLE_ACTIVITY_DATE,
    SAMPLE_APPROVAL_ID,
    URGENT_SAMPLE_ACTIVITY_DATE,
    URGENT_SAMPLE_ID,
)
from backend.app.services.project_document_service import CLUB_SAMPLE_PROJECTS
from backend.app.storage.project_document import SAMPLE_DOCUMENT_DIR

BANNER = "เอกสารตัวอย่างสำหรับทดสอบระบบ ไม่ใช่เอกสารจริงของมหาวิทยาลัย ข้อมูลทั้งหมดเป็นข้อมูลสมมติ"
UNSIGNED = "(ตัวอย่าง ไม่มีการลงนามจริง)"
ADVISOR = "อาจารย์ ดร.สมมติ ตัวอย่าง"
OWNER = "นางสาวทดสอบ ใจดี"
CSS = """
@font-face {font-family: thai; src: url(IBMPlexSansThai-Regular.ttf)}
@font-face {font-family: thai; font-weight: bold; src: url(IBMPlexSansThai-Bold.ttf)}
* {font-family: thai; font-size: 12pt; line-height: 1.5}
h1 {font-size: 17pt; text-align: center; margin: 0 0 4pt 0}
h2 {font-size: 13pt; margin: 10pt 0 3pt 0}
p {margin: 0 0 3pt 0}
ul, ol {margin: 0 0 4pt 0}
.center {text-align: center}
.code {text-align: right; font-weight: bold}
table {border-collapse: collapse; width: 100%; margin-top: 4pt}
td, th {border: 1px solid #94a3b8; padding: 3pt 5pt; text-align: left}
.sign {margin-top: 26pt; text-align: center}
"""
SCHEDULE = (
    ("08.30 - 09.00 น.", "ลงทะเบียนและชี้แจงรายละเอียดกิจกรรม"),
    ("09.00 - 10.30 น.", "กิจกรรมฐานที่ 1 การทำงานเป็นทีม"),
    ("10.45 - 12.00 น.", "กิจกรรมฐานที่ 2 ทักษะตามวัตถุประสงค์โครงการ"),
    ("13.00 - 15.00 น.", "กิจกรรมกลุ่มและนำเสนอผล"),
    ("15.00 - 16.00 น.", "สรุปกิจกรรมและตอบแบบประเมิน"),
)


def _items(lines):
    return "".join(f"<li>{line}</li>" for line in lines)


def project_book(project):
    return f"""
    <h1>{project['name']}</h1>
    <p class="center">สโมสรนักศึกษาคณะวิทยาศาสตร์ มหาวิทยาลัยศิลปากร</p>
    <table>
      <tr><th>หน่วยงานผู้รับผิดชอบ</th><td>สโมสรนักศึกษาคณะวิทยาศาสตร์</td></tr>
      <tr><th>อาจารย์ที่ปรึกษาโครงการ</th><td>{ADVISOR}</td></tr>
      <tr><th>นักศึกษาผู้รับผิดชอบโครงการ</th><td>{OWNER}</td></tr>
      <tr><th>สถานที่ดำเนินการ</th><td>{project['location']}</td></tr>
      <tr><th>วันที่ดำเนินการ</th><td>{project['date']}</td></tr>
      <tr><th>ประเภทของโครงการ</th><td>โครงการใหม่</td></tr>
      <tr><th>ชั่วโมงกิจกรรม</th><td>ผู้จัดทำโครงการ 12 ชั่วโมง ผู้เข้าร่วมโครงการ 6 ชั่วโมง</td></tr>
    </table>
    <h2>หลักการและเหตุผล</h2>
    <p>สโมสรนักศึกษาเห็นความสำคัญของการพัฒนานักศึกษานอกห้องเรียน จึงจัด{project['name']}
    เพื่อให้นักศึกษาได้ฝึกทำงานร่วมกัน เรียนรู้จากการปฏิบัติจริง และนำความรู้ไปใช้ประโยชน์ได้</p>
    <h2>วัตถุประสงค์ของโครงการ</h2><ol>{_items(project['objectives'])}</ol>
    <h2>ตัวชี้วัดความสำเร็จ</h2><ol>{_items(project['indicators'])}</ol>
    <h2>ผู้เข้าร่วมโครงการ</h2><p>นักศึกษาคณะวิทยาศาสตร์ จำนวน 80 คน</p>
    <h2>งบประมาณ</h2><p>งบประมาณที่ใช้ 15,000 บาท จากงบประมาณรายได้คณะ</p>
    <h2>ผลที่คาดว่าจะได้รับ</h2>
    <p>นักศึกษาได้พัฒนาทักษะตามวัตถุประสงค์ และสามารถนำประสบการณ์ไปใช้ในการเรียนและการทำงาน</p>
    """


def ks_002(project):
    return f"""
    <p class="code">กส 002</p>
    <h1>แบบเสนอขออนุมัติโครงการ</h1>
    <p class="center">องค์กรกิจกรรมนักศึกษา มหาวิทยาลัยศิลปากร</p>
    <p><b>รหัสโครงการ</b> ตัวอย่าง-2569-001</p>
    <h2>1. เรียน รองอธิการบดีฝ่ายกิจการนักศึกษา</h2>
    <p>ด้วยข้าพเจ้า {OWNER} สังกัดสโมสรนักศึกษาคณะวิทยาศาสตร์ มีความประสงค์ขออนุมัติจัด{project['name']}</p>
    <table>
      <tr><th>กำหนดจัดโครงการ</th><td>{project['date']}</td></tr>
      <tr><th>สถานที่</th><td>{project['location']}</td></tr>
      <tr><th>งบประมาณที่ใช้</th><td>15,000 บาท (หนึ่งหมื่นห้าพันบาทถ้วน)</td></tr>
      <tr><th>แหล่งงบประมาณ</th><td>งบประมาณรายได้คณะ</td></tr>
    </table>
    <p style="margin-top:8pt">จึงเรียนมาเพื่อโปรดพิจารณาโครงการและงบประมาณ</p>
    <div class="sign"><p>{UNSIGNED}</p><p>{OWNER}</p><p>ผู้รับผิดชอบโครงการ</p></div>
    <div class="sign"><p>{UNSIGNED}</p><p>{ADVISOR}</p><p>ที่ปรึกษาโครงการ</p></div>
    """


def activity_attachment(project):
    rows = "".join(f"<tr><td>{time}</td><td>{activity}</td></tr>" for time, activity in SCHEDULE)
    return f"""
    <h1>ใบแนบรายละเอียดกิจกรรม</h1>
    <p class="center">{project['name']}</p>
    <p><b>วันที่</b> {project['date']}</p>
    <p><b>สถานที่</b> {project['location']}</p>
    <h2>กำหนดการ</h2>
    <table><tr><th>เวลา</th><th>กิจกรรม</th></tr>{rows}</table>
    <h2>การประเมินผล</h2>
    <p>ประเมินจากการเข้าร่วมกิจกรรมและแบบประเมินความพึงพอใจหลังจบกิจกรรม</p>
    <p>หมายเหตุ กำหนดการอาจเปลี่ยนแปลงได้ตามความเหมาะสม</p>
    """


def cover_sheet(project):
    return f"""
    <h1>ใบปะหน้าเอกสารโครงการ</h1>
    <p class="center">ส่วนงบประมาณเพื่อขอลายเซ็นอาจารย์ที่ปรึกษา</p>
    <table>
      <tr><th>ชื่อโครงการ</th><td>{project['name']}</td></tr>
      <tr><th>ผู้รับผิดชอบโครงการ</th><td>{OWNER}</td></tr>
      <tr><th>งบประมาณที่ขออนุมัติ</th><td>15,000 บาท</td></tr>
    </table>
    <div class="sign"><p>{UNSIGNED}</p><p>{ADVISOR}</p><p>อาจารย์ที่ปรึกษาโครงการ</p></div>
    """


TEMPLATES = {
    "project-book": project_book,
    "ks-002": ks_002,
    "activity-attachment": activity_attachment,
    "cover-sheet": cover_sheet,
}


def render_pdf(html, archive):
    buffer = io.BytesIO()
    writer = pymupdf.DocumentWriter(buffer)
    story = pymupdf.Story(html=html, user_css=CSS, archive=archive)
    more = True
    while more:
        device = writer.begin_page(pymupdf.paper_rect("a4"))
        more, _ = story.place(pymupdf.Rect(56, 62, 539, 790))
        story.draw(device)
        writer.end_page()
    writer.close()

    document = pymupdf.open("pdf", buffer.getvalue())
    for page in document:
        page.insert_htmlbox(
            pymupdf.Rect(40, 22, 555, 48),
            f'<p style="text-align:center;font-size:9.5pt;color:#be123c;font-weight:bold">{BANNER}</p>',
            css=CSS,
            archive=archive,
        )
    document.subset_fonts()
    return document.tobytes(garbage=4, deflate=True)


def write_set(project, target, names, archive):
    target.mkdir(parents=True, exist_ok=True)
    for item_id, file_name in names.items():
        (target / file_name).write_bytes(render_pdf(TEMPLATES[item_id](project), archive))


def sample_projects():
    objectives = ("พัฒนาทักษะการทำงานเป็นทีมของนักศึกษา", "ส่งเสริมการเรียนรู้ผ่านกิจกรรมวิทยาศาสตร์")
    indicators = ("ผู้เข้าร่วมไม่น้อยกว่า 80 คน", "ผู้เข้าร่วมประเมินความพึงพอใจเฉลี่ยไม่น้อยกว่า 4.00")
    approvals = (
        (SAMPLE_APPROVAL_ID, "โครงการค่ายวิทยาศาสตร์ 2569"),
        ("approval-005-002", "โครงการอบรมทักษะห้องปฏิบัติการ"),
        (INCOMPLETE_SAMPLE_APPROVAL_ID, "โครงการวันวิทยาศาสตร์"),
        *((sample[0], sample[2]) for sample in OFFICE_REVIEW_SAMPLES),
    )
    for key, name in approvals:
        yield key, {
            "name": name,
            "date": (URGENT_SAMPLE_ACTIVITY_DATE if key == URGENT_SAMPLE_ID else SAMPLE_ACTIVITY_DATE)[1],
            "location": "คณะวิทยาศาสตร์ พระราชวังสนามจันทร์",
            "objectives": objectives,
            "indicators": indicators,
        }
    for index, project in enumerate(CLUB_SAMPLE_PROJECTS, start=1):
        yield f"club-{index}", {
            "name": project["name"],
            "date": project["date_text"],
            "location": project["location"],
            "objectives": project["objectives"],
            "indicators": project["indicators"],
        }


def main(font_dir):
    archive = pymupdf.Archive(font_dir)
    for key, project in sample_projects():
        write_set(project, SAMPLE_DOCUMENT_DIR / key, {item: f"{item}.pdf" for item in TEMPLATES}, archive)

    upload_project = {
        "name": "โครงการทดลองอัปโหลดเอกสาร",
        "date": "20 ธันวาคม 2569",
        "location": "คณะวิทยาศาสตร์ พระราชวังสนามจันทร์",
        "objectives": ("เพื่อทดลองส่งเอกสารผ่านระบบ", "เพื่อฝึกการทำงานเป็นทีมของนักศึกษา"),
        "indicators": ("ผู้เข้าร่วมไม่น้อยกว่า 50 คน", "ความพึงพอใจเฉลี่ยไม่น้อยกว่า 3.51 จาก 5"),
    }
    write_set(
        upload_project,
        Path("docs/mock-documents"),
        {
            "project-book": "เล่มโครงการ.pdf",
            "ks-002": "กส-002.pdf",
            "activity-attachment": "ใบแนบกิจกรรม.pdf",
            "cover-sheet": "ใบปะหน้า.pdf",
        },
        archive,
    )


if __name__ == "__main__":
    main(sys.argv[1])

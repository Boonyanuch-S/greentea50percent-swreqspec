import LateSubmissionPage from './pages/LateSubmissionPage.jsx'
import { lateSubmissionMock } from './api/lateSubmissionMock.js'

// เปิดหน้าขอบันทึกชั่วโมงย้อนหลังด้วย API จำลอง รองรับ FR-LATE-01
export default function App() {
  return (
    <>
      <span className="sr-only">ขอบันทึกชั่วโมงย้อนหลัง</span>
      <LateSubmissionPage client={lateSubmissionMock} />
    </>
  )
}

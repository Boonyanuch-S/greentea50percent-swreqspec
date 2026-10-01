import ActivityDashboard from './pages/ActivityDashboard.jsx'
import { dashboardMock } from './api/dashboardMock.js'

// เปิดหน้าจอ Dashboard ด้วย API จำลอง รองรับ FR-DSH-01, FR-DSH-02 และ ASM-02
export default function App() {
  return (
    <>
      <span className="sr-only">ระบบจองคิวตรวจสุขภาพ</span>
      <ActivityDashboard client={dashboardMock} />
    </>
  )
}

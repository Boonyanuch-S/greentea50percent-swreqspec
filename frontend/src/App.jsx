import ActivityHoursQueue from './pages/ActivityHoursQueue.jsx'
import { activityHoursMock } from './api/activityHoursMock.js'

// เปิดหน้าคิวตรวจสอบชั่วโมงกิจกรรมด้วย API จำลอง รองรับ FR-HRS-01
export default function App() {
  return (
    <>
      <span className="sr-only">คิวตรวจสอบชั่วโมงกิจกรรม</span>
      <ActivityHoursQueue client={activityHoursMock} />
    </>
  )
}

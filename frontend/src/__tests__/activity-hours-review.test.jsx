import { fireEvent, render, screen, within } from '@testing-library/react'
import { activityHoursMock } from '../services/activityHoursMock.js'
import ActivityHoursReview from '../pages/ActivityHoursReview.jsx'

test('test_AC_HRS_04_display_all_excel_participants_and_hour_types แสดงผู้เข้าร่วมและประเภทชั่วโมงครบ', async () => {
  // Given เอกสาร Excel มีผู้เข้าร่วมหลายคนและ API จำลองส่งข้อมูลครบทุกแถว
  render(<ActivityHoursReview client={activityHoursMock} documentId={41} />)

  // When เจ้าหน้าที่เปิดรายละเอียดเอกสาร
  fireEvent.click(await screen.findByRole('tab', { name: 'รายชื่อผู้เข้าร่วม' }))
  const participantsTable = await screen.findByRole('table', {
    name: 'รายชื่อผู้เข้าร่วมและประเภทชั่วโมง',
  })

  // Then ระบบแสดงรายชื่อและประเภทชั่วโมงที่แจ้งไว้ครบทุกรายการ
  const rows = within(participantsTable).getAllByRole('row')
  expect(rows).toHaveLength(3)
  expect(within(rows[1]).getByText('Participant One')).toBeTruthy()
  expect(within(rows[1]).getByText('จิตอาสา')).toBeTruthy()
  expect(within(rows[2]).getByText('Participant Two')).toBeTruthy()
  expect(within(rows[2]).getByText('การศึกษา')).toBeTruthy()
})

test('test_AC_HRS_04_mock_participant_details_use_existing_data เปิดและปิดรายละเอียดจากข้อมูลที่มี', async () => {
  // Given เจ้าหน้าที่เปิดรายชื่อผู้เข้าร่วมที่มีข้อมูลจำลองอยู่แล้ว
  render(<ActivityHoursReview client={activityHoursMock} documentId={41} />)

  // When เจ้าหน้าที่เลือกดูรายละเอียดของผู้เข้าร่วม
  fireEvent.click(await screen.findByRole('tab', { name: 'รายชื่อผู้เข้าร่วม' }))
  fireEvent.click(await screen.findByRole('button', { name: 'ดูรายละเอียดของ Participant One' }))

  // Then แสดงเฉพาะข้อมูลรายละเอียดที่มีอยู่ในข้อมูลจำลอง
  const detailDialog = screen.getByRole('dialog', { name: 'รายละเอียดผู้เข้าร่วม' })
  expect(within(detailDialog).getByText('Participant One')).toBeTruthy()
  expect(within(detailDialog).getByText('รหัสอ้างอิง S-001')).toBeTruthy()
  expect(within(detailDialog).getByText('จิตอาสา')).toBeTruthy()
  expect(within(detailDialog).getByText('2')).toBeTruthy()

  // When เจ้าหน้าที่เลือกกลับไปยังรายชื่อ
  fireEvent.click(within(detailDialog).getByRole('button', { name: 'กลับไปยังรายชื่อ' }))

  // Then ปิดรายละเอียดและกลับมาเห็นรายชื่อเดิม
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(screen.getByRole('button', { name: 'ดูรายละเอียดของ Participant One' })).toBeTruthy()
})

test('T-11 แสดงผลตรวจ รายการผิด และสถานะคืนเอกสารจากข้อมูลจำลอง', async () => {
  // Given mock service ส่งผลตรวจที่มีรายการชั่วโมงไม่ตรงเกณฑ์
  render(<ActivityHoursReview client={activityHoursMock} documentId={41} />)

  // When เจ้าหน้าที่เปิดหน้าตรวจสอบ
  const result = await screen.findByRole('region', { name: 'ผลการตรวจสอบ' })

  // Then ระบบแสดงรายการที่ผิดพร้อมสถานะคืนเอกสาร และระบุผลตรวจในรายชื่อ
  expect(within(result).getByRole('alert').textContent).toBe(
    'พบรายการไม่ตรงเกณฑ์ 1 รายการ',
  )
  expect(within(result).getByText('สถานะเอกสาร: ส่งคืน UC-02')).toBeTruthy()
  expect(within(result).getByText('S-002 · การศึกษา')).toBeTruthy()
  fireEvent.click(screen.getByRole('tab', { name: 'รายชื่อผู้เข้าร่วม' }))
  const participantsTable = screen.getByRole('table', {
    name: 'รายชื่อผู้เข้าร่วมและประเภทชั่วโมง',
  })
  expect(within(participantsTable).getByText('ไม่ตรงเกณฑ์')).toBeTruthy()
  expect(within(participantsTable).getByText('ตรงเกณฑ์')).toBeTruthy()
})

test('แสดงข้อผิดพลาดเมื่อโหลดรายชื่อผู้เข้าร่วมไม่สำเร็จ', async () => {
  const client = {
    getDocumentParticipants: async () => {
      throw new Error('ไม่สามารถอ่านไฟล์ได้')
    },
  }

  render(<ActivityHoursReview client={client} documentId={41} />)

  fireEvent.click(await screen.findByRole('tab', { name: 'รายชื่อผู้เข้าร่วม' }))
  expect((await screen.findByRole('alert')).textContent).toBe(
    'โหลดรายชื่อผู้เข้าร่วมไม่สำเร็จ: ไม่สามารถอ่านไฟล์ได้',
  )
})

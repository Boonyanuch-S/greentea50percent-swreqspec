// ชื่อบทบาท 4 บทบาทตาม ASM-01 ของ specs/009 ค่า key ตรงกับ UserRole ฝั่ง backend
export const ROLE_LABELS = {
  club_committee: 'กรรมการสโมสรนักศึกษา',
  faculty_officer: 'เจ้าหน้าที่คณะวิทยาศาสตร์',
  advisor: 'อาจารย์ที่ปรึกษาสโมสร',
  student_affairs_officer: 'เจ้าหน้าที่กองกิจการนักศึกษา',
}

export function roleLabel(role) {
  return ROLE_LABELS[role] ?? role
}

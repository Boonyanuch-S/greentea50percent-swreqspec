// อักษรแรกของชื่อสำหรับรูปโปรไฟล์ (ตัดคำนำหน้า และข้ามสระหน้า เ แ โ ใ ไ)
export function nameInitial(name) {
  const bare = (name ?? '').replace(/^(นางสาว|นาง|นาย|ผู้ช่วยศาสตราจารย์ ดร\.)/, '')
  return bare.match(/[ก-ฮA-Za-z]/)?.[0] ?? '?'
}

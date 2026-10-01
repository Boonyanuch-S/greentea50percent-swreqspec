// Mock upload client for FR-IMP-01 and ASM-04.
export const legacyDataImportMock = {
  async upload(file) {
    return {
      importId: 'mock-import-001',
      filename: file.name,
      status: 'รอตรวจสอบโครงสร้าง',
    }
  },
}

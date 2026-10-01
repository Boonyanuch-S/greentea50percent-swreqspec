const emptyProjectDocument = {
  projectName: '',
  objectives: '',
  activityDate: '',
  location: '',
  indicators: '',
}

// ให้สัญญาฟอร์มเอกสารโครงการเปล่า รองรับ FR-PRJ-01 และ FR-PRJ-02
export const projectDocumentMock = {
  async getNewProjectForm() {
    return { ...emptyProjectDocument }
  },
}

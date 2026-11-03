import { useEffect, useMemo, useState } from 'react'
import { useAuth } from './hooks/useAuth.js'
import { useUrlParams } from './hooks/useUrlParams.js'
import Button from './components/Button.jsx'
import TabNav from './components/TabNav.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import ActivityHoursQueue from './pages/ActivityHoursQueue.jsx'
import ActivityHoursReview from './pages/ActivityHoursReview.jsx'
import ChecklistManagementPage from './pages/ChecklistManagementPage.jsx'
import DocumentReviewPage from './pages/DocumentReviewPage.jsx'
import HoursSubmission from './pages/HoursSubmission.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ProjectApprovalListPage from './pages/ProjectApprovalListPage.jsx'
import ProjectApprovalPage from './pages/ProjectApprovalPage.jsx'
import ProjectDocumentsPage from './pages/ProjectDocumentsPage.jsx'
import ProjectOfficeReviewPanel from './pages/ProjectOfficeReviewPanel.jsx'
import ReviewQueuePage from './pages/ReviewQueuePage.jsx'
import RoleHomePage from './pages/RoleHomePage.jsx'
import { authApi } from './services/auth.js'
import { checklistApi, createProjectApprovalClient, createProjectDocumentClient, createReviewClient } from './api/client.js'
import { hoursSubmissionMock } from './services/hoursSubmissionMock.js'
import { activityHoursMock } from './services/activityHoursMock.js'
import { projectOfficeReviewMock } from './services/projectOfficeReviewMock.js'
import { AuthProvider } from './store/AuthContext.jsx'
import { confirmAction, showToast, showWarning } from './utils/alerts.js'

// หน้าหลักตามบทบาท (FR-AUTH-04) ตามคำตอบทีมใน Q-01
const homeSections = {
  club_committee: 'กรรมการสโมสรนักศึกษา',
  faculty_officer: 'เจ้าหน้าที่คณะ',
  advisor: 'อาจารย์ที่ปรึกษาสโมสร',
  student_affairs_officer: 'เจ้าหน้าที่กองกิจ',
}

const clubTabs = [
  { id: 'projects', label: 'เอกสารโครงการ', icon: 'document' },
  { id: 'hours', label: 'ส่งข้อมูลชั่วโมงกิจกรรม', icon: 'clock' },
]

const studentAffairsTabs = [
  { id: 'projects', label: 'ตรวจเอกสารโครงการ', icon: 'document' },
  { id: 'activity-hours', label: 'ตรวจสอบชั่วโมงกิจกรรม', icon: 'clock' },
]

const facultyTabs = [
  { id: 'queue', label: 'คิวเอกสาร', icon: 'inbox' },
  { id: 'checklist', label: 'รายการเอกสาร', icon: 'checklist' },
]

// รายการเอกสารและหน้ารายละเอียดของ UC-05 ตาม FR-APR-01 และ FR-APR-05
function ProjectApprovalHome({ client, DetailPage, eyebrow, heading, description, actionableStatus }) {
  const [params, updateParams] = useUrlParams()
  const selectedId = params.get('approval')
  const detailClient = useMemo(
    () => (selectedId ? client.forApproval(selectedId) : null),
    [client, selectedId],
  )

  if (detailClient) {
    return <DetailPage client={detailClient} onBack={() => updateParams({ approval: null })} />
  }
  return (
    <ProjectApprovalListPage
      client={client}
      eyebrow={eyebrow}
      heading={heading}
      description={description}
      actionableStatus={actionableStatus}
      onOpen={(approvalId) => updateParams({ approval: approvalId })}
    />
  )
}

// เปิดเอกสารชั่วโมงจาก URL ได้เมื่อรีเฟรช โดยอ่านรายละเอียดซ้ำจากคิวตาม FR-HRS-01
function ActivityHoursDetail({ client, documentId, openedDocument, onBack }) {
  const [loadedDocument, setLoadedDocument] = useState(null)
  const isOpened = String(openedDocument?.documentId) === documentId
  const details = isOpened ? openedDocument : loadedDocument

  useEffect(() => {
    if (isOpened) return undefined
    let active = true
    Promise.resolve()
      .then(() => client.getPendingDocuments())
      .then((documents) => {
        const found = documents.find((document) => String(document.documentId) === documentId)
        if (active && found) setLoadedDocument(found)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [client, documentId, isOpened])

  return (
    <section>
      <ActivityHoursReview client={client} documentId={documentId} documentDetails={details ?? { documentId }} />
      <Button type="button" variant="secondary" className="mt-4" onClick={onBack}>
        กลับไปคิวเอกสาร
      </Button>
    </section>
  )
}

function RoleHome({
  role,
  session,
  checklistClient,
  reviewClient,
  approvalClient,
  hoursSubmissionClient,
  activityHoursClient,
  projectDocumentClient,
}) {
  const [params, updateParams] = useUrlParams()
  const [openedHoursDocument, setOpenedHoursDocument] = useState(null)
  const tab = params.get('tab')
  const hoursDocumentId = params.get('hoursDocument')
  const selectedSubmissionId = params.get('submission') ? Number(params.get('submission')) : null
  const sessionApprovalClient = useMemo(() => createProjectApprovalClient(session), [session])
  const sessionReviewClient = useMemo(() => reviewClient ?? createReviewClient(session), [reviewClient, session])
  const sessionProjectClient = useMemo(
    () => projectDocumentClient ?? createProjectDocumentClient(session),
    [projectDocumentClient, session],
  )
  const isProjectQueueMockup = params.get('mockup') === 'project-queue'
  // ใช้คิวจำลองชั่วคราวจน backend ตั้งค่าแหล่งข้อมูลจริงตาม FR-HRS-01; ยัง inject API client ได้
  const sessionActivityHoursClient = useMemo(
    () => activityHoursClient ?? activityHoursMock,
    [activityHoursClient],
  )
  // ใช้ข้อมูลจำลองชั่วคราวจนกว่าจะเชื่อมแหล่งข้อมูลกิจกรรมจริงตาม FR-SBH-01
  const sessionHoursSubmissionClient = hoursSubmissionClient ?? hoursSubmissionMock

  if (role === 'club_committee') {
    // สลับจาก UC-01 ไปหน้าส่งข้อมูลชั่วโมงตาม FR-SBH-01 และ FR-SBH-03
    return (
      <>
        <TabNav
          label="เมนูกรรมการสโมสร"
          tabs={clubTabs}
          active={tab ?? 'projects'}
          onChange={(view) => updateParams({ tab: view, project: null, edit: null })}
        />
        {tab === 'hours' ? (
          <HoursSubmission client={sessionHoursSubmissionClient} />
        ) : (
          <ProjectDocumentsPage client={sessionProjectClient} />
        )}
      </>
    )
  }
  if (role === 'advisor') {
    return (
      <ProjectApprovalHome
        client={approvalClient ?? sessionApprovalClient}
        DetailPage={ProjectApprovalPage}
        eyebrow="อาจารย์ที่ปรึกษา · เอกสารโครงการ"
        heading="อนุมัติเอกสารโครงการ"
        description="เลือกโครงการที่ส่งต่อมาเพื่อตรวจเอกสารทั้งชุด"
        actionableStatus="ส่งต่ออาจารย์"
      />
    )
  }
  if (role === 'student_affairs_officer') {
    return (
      <>
        <TabNav
          label="เมนูเจ้าหน้าที่กองกิจ"
          tabs={studentAffairsTabs}
          active={tab ?? 'projects'}
          onChange={(view) => updateParams({ tab: view, approval: null, hoursDocument: null })}
        />
        {tab === 'activity-hours' ? (
          hoursDocumentId === null ? (
            <ActivityHoursQueue
              client={sessionActivityHoursClient}
              onSelectDocument={(document) => {
                setOpenedHoursDocument(document)
                updateParams({ hoursDocument: document.documentId })
              }}
            />
          ) : (
            <ActivityHoursDetail
              client={sessionActivityHoursClient}
              documentId={hoursDocumentId}
              openedDocument={openedHoursDocument}
              onBack={() => updateParams({ hoursDocument: null })}
            />
          )
        ) : (
          <ProjectApprovalHome
            client={
              approvalClient ??
              (isProjectQueueMockup ? projectOfficeReviewMock : sessionApprovalClient)
            }
            DetailPage={ProjectOfficeReviewPanel}
            eyebrow="กองกิจการนักศึกษา · เอกสารโครงการ"
            heading="ตรวจเอกสารโครงการ"
            description="เอกสารที่อาจารย์ส่งใบปะหน้าแล้วและรอการตรวจ"
            actionableStatus="รออนุมัติ"
          />
        )}
      </>
    )
  }
  if (role === 'faculty_officer') {
    return (
      <>
        <TabNav
          label="เมนูเจ้าหน้าที่คณะ"
          tabs={facultyTabs}
          active={tab ?? 'queue'}
          onChange={(view) => updateParams({ tab: view, submission: null })}
        />
        {selectedSubmissionId ? (
          <DocumentReviewPage
            client={sessionReviewClient}
            session={session}
            submissionId={selectedSubmissionId}
            onBack={() => updateParams({ submission: null })}
          />
        ) : tab !== 'checklist' ? (
          <ReviewQueuePage
            client={sessionReviewClient}
            onOpenSubmission={(submission) => updateParams({ submission: submission.submission_id })}
          />
        ) : (
          <ChecklistManagementPage
            client={checklistClient}
            session={session}
          />
        )}
      </>
    )
  }
  return <RoleHomePage role={role} />
}

// ยังไม่มี Token แสดงหน้า login (FR-AUTH-01) มี Token แล้วเข้าหน้าตามบทบาท (FR-AUTH-04)
function AppRoutes({
  authClient,
  checklistClient,
  reviewClient,
  approvalClient,
  hoursSubmissionClient,
  activityHoursClient,
  projectDocumentClient,
}) {
  const { session, tokenExpired, signIn, signOut, dismissExpiredNotice } = useAuth()
  const [params, updateParams] = useUrlParams()
  const isProfile = params.get('view') === 'profile' // หน้าโปรไฟล์: นอก spec ทีมสั่งเพิ่ม

  // แจ้ง Token หมดอายุแล้วอยู่ที่หน้า login (AC-AUTH-04)
  useEffect(() => {
    if (!tokenExpired) return
    showWarning({ title: 'Token หมดอายุ', text: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง' }).then(dismissExpiredNotice)
  }, [tokenExpired, dismissExpiredNotice])


  // ออกจากระบบ: นอก spec 009 ทีมสั่งเพิ่ม
  async function handleSignOut() {
    const confirmed = await confirmAction({
      title: 'ออกจากระบบ?',
      text: 'ข้อมูลที่ยังไม่ได้ส่งจะไม่ถูกบันทึก',
      confirmText: 'ออกจากระบบ',
      danger: true,
    })
    if (!confirmed) return
    signOut()
    updateParams({}, { reset: true, replace: true })
    showToast('ออกจากระบบแล้ว')
  }

  if (!session) {
    return <LoginPage client={authClient} onLoginSuccess={signIn} />
  }

  return (
    <AppLayout
      session={session}
      section={isProfile ? 'โปรไฟล์' : homeSections[session.role]}
      onHome={() => updateParams({}, { reset: true })}
      onProfile={() => updateParams({ view: 'profile' })}
      onLogout={handleSignOut}
    >
      {isProfile ? (
        <ProfilePage session={session} onBack={() => updateParams({ view: null })} onLogout={handleSignOut} />
      ) : (
        <RoleHome
          role={session.role}
          session={session}
          checklistClient={checklistClient}
          reviewClient={reviewClient}
          approvalClient={approvalClient}
          hoursSubmissionClient={hoursSubmissionClient}
          activityHoursClient={activityHoursClient}
          projectDocumentClient={projectDocumentClient}
        />
      )}
    </AppLayout>
  )
}

export default function App({
  authClient = authApi,
  checklistClient = checklistApi,
  reviewClient,
  approvalClient,
  hoursSubmissionClient,
  activityHoursClient,
  projectDocumentClient,
}) {
  return (
    <AuthProvider>
      <AppRoutes
        authClient={authClient}
        checklistClient={checklistClient}
        reviewClient={reviewClient}
        approvalClient={approvalClient}
        hoursSubmissionClient={hoursSubmissionClient}
        activityHoursClient={activityHoursClient}
        projectDocumentClient={projectDocumentClient}
      />
    </AuthProvider>
  )
}

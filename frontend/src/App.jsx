import { useEffect, useMemo, useState } from 'react'
import { useAuth } from './hooks/useAuth.js'
import AppLayout from './layouts/AppLayout.jsx'
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
import { checklistApi, createProjectApprovalClient } from './api/client.js'
import { projectDocumentMock } from './services/projectDocumentMock.js'
import { reviewQueueMock } from './services/reviewQueue.js'
import { hoursSubmissionMock } from './services/hoursSubmissionMock.js'
import { AuthProvider } from './store/AuthContext.jsx'
import { confirmAction, showToast, showWarning } from './utils/alerts.js'

// หน้าหลักตามบทบาท (FR-AUTH-04) ตามคำตอบทีมใน Q-01
const homeSections = {
  club_committee: 'Project Document',
  faculty_officer: 'Project Review',
  advisor: 'Project Approval',
  student_affairs_officer: 'Project Approval Review',
}

// รายการเอกสารและหน้ารายละเอียดของ UC-05 ตาม FR-APR-01 และ FR-APR-05
function ProjectApprovalHome({ client, DetailPage, eyebrow, heading, description }) {
  const [selectedId, setSelectedId] = useState(null)
  const detailClient = useMemo(
    () => (selectedId ? client.forApproval(selectedId) : null),
    [client, selectedId],
  )

  if (detailClient) {
    return <DetailPage client={detailClient} onBack={() => setSelectedId(null)} />
  }
  return (
    <ProjectApprovalListPage
      client={client}
      eyebrow={eyebrow}
      heading={heading}
      description={description}
      onOpen={setSelectedId}
    />
  )
}

function RoleHome({
  role,
  session,
  checklistClient,
  reviewClient,
  approvalClient,
  hoursSubmissionClient,
}) {
  const [facultyView, setFacultyView] = useState('queue')
  const [clubView, setClubView] = useState('projects')
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null)
  const sessionApprovalClient = useMemo(() => createProjectApprovalClient(session), [session])
  // ใช้ข้อมูลจำลองชั่วคราวจนกว่าจะเชื่อมแหล่งข้อมูลกิจกรรมจริงตาม FR-SBH-01
  const sessionHoursSubmissionClient = hoursSubmissionClient ?? hoursSubmissionMock

  if (role === 'club_committee') {
    // สลับจาก UC-01 ไปหน้าส่งข้อมูลชั่วโมงตาม FR-SBH-01 และ FR-SBH-03
    return (
      <>
        <div className="mx-auto mb-6 max-w-5xl">
          <nav
            className="inline-flex max-w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"
            aria-label="เมนูกรรมการสโมสร"
          >
            <button
              type="button"
              aria-pressed={clubView === 'projects'}
              onClick={() => setClubView('projects')}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 ${
                clubView === 'projects'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              เอกสารโครงการ
            </button>
            <button
              type="button"
              aria-pressed={clubView === 'hours'}
              onClick={() => setClubView('hours')}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 ${
                clubView === 'hours'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              ส่งข้อมูลชั่วโมงกิจกรรม
            </button>
          </nav>
        </div>
        {clubView === 'hours' ? (
          <HoursSubmission client={sessionHoursSubmissionClient} />
        ) : (
          <ProjectDocumentsPage client={projectDocumentMock} />
        )}
      </>
    )
  }
  if (role === 'advisor') {
    return (
      <ProjectApprovalHome
        client={approvalClient ?? sessionApprovalClient}
        DetailPage={ProjectApprovalPage}
        eyebrow="Advisor Approval / Project Documents"
        heading="อนุมัติเอกสารโครงการ"
        description="เลือกโครงการที่ส่งต่อมาเพื่อตรวจเอกสารทั้งชุด"
      />
    )
  }
  if (role === 'student_affairs_officer') {
    return (
      <ProjectApprovalHome
        client={approvalClient ?? sessionApprovalClient}
        DetailPage={ProjectOfficeReviewPanel}
        eyebrow="Student Affairs Review / Project Documents"
        heading="ตรวจเอกสารโครงการ"
        description="เอกสารที่อาจารย์ส่งใบปะหน้าแล้วและรอการตรวจ"
      />
    )
  }
  if (role === 'faculty_officer') {
    return (
      <>
        <div className="mx-auto mb-6 max-w-5xl">
          <nav
            className="inline-flex max-w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"
            aria-label="เมนูเจ้าหน้าที่คณะ"
          >
            <button
              type="button"
              aria-pressed={facultyView === 'queue'}
              onClick={() => {
                setSelectedSubmissionId(null)
                setFacultyView('queue')
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 ${
                facultyView === 'queue'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                <path d="M4 5.5h12M4 10h12M4 14.5h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                <circle cx="2.5" cy="5.5" r=".7" fill="currentColor" />
                <circle cx="2.5" cy="10" r=".7" fill="currentColor" />
                <circle cx="2.5" cy="14.5" r=".7" fill="currentColor" />
              </svg>
              คิวเอกสาร
            </button>
            <button
              type="button"
              aria-pressed={facultyView === 'checklist'}
              onClick={() => {
                setSelectedSubmissionId(null)
                setFacultyView('checklist')
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 ${
                facultyView === 'checklist'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                <rect x="3.5" y="3.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="m6.5 10 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Checklist กลาง
            </button>
          </nav>
        </div>
        {selectedSubmissionId ? (
          <DocumentReviewPage
            client={reviewClient}
            session={session}
            submissionId={selectedSubmissionId}
            onBack={() => setSelectedSubmissionId(null)}
          />
        ) : facultyView === 'queue' ? (
          <ReviewQueuePage
            client={reviewClient}
            onOpenSubmission={(submission) => setSelectedSubmissionId(submission.submission_id)}
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
}) {
  const { session, tokenExpired, signIn, signOut, dismissExpiredNotice } = useAuth()
  const [view, setView] = useState('home') // 'home' | 'profile' (หน้าโปรไฟล์: นอก spec ทีมสั่งเพิ่ม)

  // แจ้ง Token หมดอายุแล้วอยู่ที่หน้า login (AC-AUTH-04)
  useEffect(() => {
    if (!tokenExpired) return
    showWarning({ title: 'Token หมดอายุ', text: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง' }).then(dismissExpiredNotice)
  }, [tokenExpired, dismissExpiredNotice])

  function handleSignIn(result) {
    setView('home')
    signIn(result)
  }

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
    showToast('ออกจากระบบแล้ว')
  }

  if (!session) {
    return <LoginPage client={authClient} onLoginSuccess={handleSignIn} />
  }

  return (
    <AppLayout
      session={session}
      section={view === 'profile' ? 'Profile' : homeSections[session.role]}
      onHome={() => setView('home')}
      onProfile={() => setView('profile')}
      onLogout={handleSignOut}
    >
      {view === 'profile' ? (
        <ProfilePage session={session} onBack={() => setView('home')} onLogout={handleSignOut} />
      ) : (
        <RoleHome
          role={session.role}
          session={session}
          checklistClient={checklistClient}
          reviewClient={reviewClient}
          approvalClient={approvalClient}
          hoursSubmissionClient={hoursSubmissionClient}
        />
      )}
    </AppLayout>
  )
}

export default function App({
  authClient = authApi,
  checklistClient = checklistApi,
  reviewClient = reviewQueueMock,
  approvalClient,
  hoursSubmissionClient,
}) {
  return (
    <AuthProvider>
      <AppRoutes
        authClient={authClient}
        checklistClient={checklistClient}
        reviewClient={reviewClient}
        approvalClient={approvalClient}
        hoursSubmissionClient={hoursSubmissionClient}
      />
    </AuthProvider>
  )
}

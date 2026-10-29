import { useEffect, useState } from 'react'
import { useAuth } from './hooks/useAuth.js'
import AppLayout from './layouts/AppLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ProjectDocumentsPage from './pages/ProjectDocumentsPage.jsx'
import RoleHomePage from './pages/RoleHomePage.jsx'
import { authMock } from './services/authMock.js'
import { projectDocumentMock } from './services/projectDocumentMock.js'
import { AuthProvider } from './store/AuthContext.jsx'
import { confirmAction, showToast, showWarning } from './utils/alerts.js'

// หน้าหลักตามบทบาท (FR-AUTH-04) ทีมตอบ Q-01 แล้วเฉพาะกรรมการสโมสร -> UC-01
// บทบาทอื่นยังรอ Q-01 จึงใช้ RoleHomePage ชั่วคราว
const homeSections = {
  club_committee: 'Project Document',
}

function RoleHome({ role }) {
  if (role === 'club_committee') {
    return <ProjectDocumentsPage client={projectDocumentMock} />
  }
  return <RoleHomePage role={role} />
}

// ยังไม่มี Token แสดงหน้า login (FR-AUTH-01) มี Token แล้วเข้าหน้าตามบทบาท (FR-AUTH-04)
function AppRoutes({ authClient }) {
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
        <RoleHome role={session.role} />
      )}
    </AppLayout>
  )
}

export default function App({ authClient = authMock }) {
  return (
    <AuthProvider>
      <AppRoutes authClient={authClient} />
    </AuthProvider>
  )
}

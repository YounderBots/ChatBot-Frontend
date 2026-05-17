import './App.css'
import AppLayout from './layout/AppLayout'

import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { useAuth, usePermission } from './Context/AuthContext'
import Login from './BasePages/Login'
import Register from './BasePages/Register'
import SuperAdminLogin from './pages/Management/SuperAdminLogin'
import ManagementLayout from './pages/Management/ManagementLayout'
import ManagementDashboard from './pages/Management/ManagementDashboard'
import OrgDetail from './pages/Management/OrgDetail'
import AuditLogViewer from './pages/Management/AuditLogViewer'
import AdminUsersPage from './pages/Management/AdminUsersPage'
import AdminRolesPage from './pages/Management/AdminRolesPage'
import PlatformAnalytics from './pages/Management/PlatformAnalytics'
import PlatformBilling from './pages/Management/PlatformBilling'
import PlatformChannels from './pages/Management/PlatformChannels'
import PlatformIntents from './pages/Management/PlatformIntents'
import PlatformKnowledgeBase from './pages/Management/PlatformKnowledgeBase'
import PlatformUsers from './pages/Management/PlatformUsers'
import Analytics from './pages/Analytics/Analytics'
import Billing from './pages/Billing/Billing'
import Channels from './pages/Channels/Channels'
import ConversationManager from './pages/ConversationManager/ConversationManager'
import Dashboard from './pages/Dashboard/Dashboard'
import IntentManager from './pages/IntentManager/IntentManager'
import KnowledgeBaseManager from './pages/KnowledgeBaseManager/KnowledgeBaseManager'
import FlowBuilder from './pages/FlowBuilder/FlowBuilder'
import LiveAgent from './pages/LiveAgent/LiveAgent'
import Organization from './pages/Organization/Organization'
import UserProfile from './pages/Profile/UserProfile'
import Security from './pages/Security/Security'
import Settings from './pages/Settings/Settings'
import TicketManagement from './pages/Ticketmanagement/TicketManagerment'
import UserMgmt from './pages/UserManagement/UserMgmt'

/** Redirect unauthenticated users to /login */
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  const token = sessionStorage.getItem('token')  // token lives in sessionStorage (see AuthContext)
  if (!user && !token) return <Navigate to="/login" replace />
  return children
}

/** Redirect to /Dashboard if user lacks view permission for a menu-driven route */
const PermissionRoute = ({ path, children }) => {
  const { canView } = usePermission(path);
  if (!canView) return <Navigate to="/Dashboard" replace />;
  return children;
};

/** Catch-all: send unknown paths to dashboard (or login if not authed) */
const NotFound = () => {
  const { user } = useAuth()
  const token = sessionStorage.getItem('token')
  return <Navigate to={user || token ? '/Dashboard' : '/login'} replace />
}

/** Guard for super-admin management routes — checks sa_token, not the tenant token */
const SuperAdminRoute = ({ children }) => {
  const saToken = sessionStorage.getItem('sa_token')
  if (!saToken) return <Navigate to="/management/login" replace />
  return children
}

const App = () => {
  return (
    <Router basename='/admin'>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* All authenticated routes share AppLayout */}
        <Route element={
          <ProtectedRoute><AppLayout /></ProtectedRoute>
        }>
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Analytics" element={<PermissionRoute path="/Analytics"><Analytics /></PermissionRoute>} />
          <Route path="/Conversations" element={<PermissionRoute path="/Conversations"><ConversationManager /></PermissionRoute>} />
          <Route path="/Intents" element={<PermissionRoute path="/Intents"><IntentManager /></PermissionRoute>} />
          <Route path="/Knowledge-Base" element={<PermissionRoute path="/Knowledge-Base"><KnowledgeBaseManager /></PermissionRoute>} />
          <Route path="/User-Management" element={<PermissionRoute path="/User-Management"><UserMgmt /></PermissionRoute>} />
          <Route path="/Settings" element={<PermissionRoute path="/Settings"><Settings /></PermissionRoute>} />
          <Route path="/Profile" element={<UserProfile />} />
          <Route path="/Ticket-Management" element={<PermissionRoute path="/Ticket-Management"><TicketManagement /></PermissionRoute>} />
          {/* ── Workspace ── */}
          <Route path="/Organization" element={<PermissionRoute path="/Organization"><Organization /></PermissionRoute>} />
          <Route path="/Billing" element={<PermissionRoute path="/Billing"><Billing /></PermissionRoute>} />
          <Route path="/Channels" element={<PermissionRoute path="/Channels"><Channels /></PermissionRoute>} />
          {/* ── AI / NLP ── */}
          <Route path="/Flow-Builder" element={<PermissionRoute path="/Flow-Builder"><FlowBuilder /></PermissionRoute>} />
          {/* ── Operations & Security ── */}
          <Route path="/Live-Agent" element={<PermissionRoute path="/Live-Agent"><LiveAgent /></PermissionRoute>} />
          <Route path="/Security" element={<PermissionRoute path="/Security"><Security /></PermissionRoute>} />
        </Route>

        {/* ── Platform management (super-admin only) ── */}
        {/* Uses sa_token in sessionStorage — structurally separate from tenant auth */}
        <Route path="/management/login" element={<SuperAdminLogin />} />
        <Route path="/management" element={<Navigate to="/management/login" replace />} />
        <Route element={<SuperAdminRoute><ManagementLayout /></SuperAdminRoute>}>
          <Route path="/management/dashboard"      element={<ManagementDashboard />} />
          <Route path="/management/org/:orgId"   element={<OrgDetail />} />
          <Route path="/management/analytics"    element={<PlatformAnalytics />} />
          <Route path="/management/intents"      element={<PlatformIntents />} />
          <Route path="/management/knowledge-base" element={<PlatformKnowledgeBase />} />
          <Route path="/management/users"        element={<PlatformUsers />} />
          <Route path="/management/billing"      element={<PlatformBilling />} />
          <Route path="/management/channels"     element={<PlatformChannels />} />
          <Route path="/management/audit-logs"   element={<AuditLogViewer />} />
          <Route path="/management/admins"       element={<AdminUsersPage />} />
          <Route path="/management/admin-roles"  element={<AdminRolesPage />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App

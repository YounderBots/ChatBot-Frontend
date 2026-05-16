import './App.css'
import AppLayout from './layout/AppLayout'

import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { useAuth, usePermission } from './Context/AuthContext'
import Login from './BasePages/Login'
import Register from './BasePages/Register'
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

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App

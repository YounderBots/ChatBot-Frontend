import './App.css'
import AppLayout from './layout/AppLayout'


import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Login from './BasePages/Login'
import Analytics from './pages/Analytics/Analytics'
import ConversationManager from './pages/ConversationManager/ConversationManager'
import Dashboard from './pages/Dashboard/Dashboard'
import IntentManager from './pages/IntentManager/IntentManager'
import KnowledgeBaseManager from './pages/KnowledgeBaseManager/KnowledgeBaseManager'
import UserProfile from './pages/Profile/UserProfile'
import Settings from './pages/Settings/Settings'
import TicketManagement from './pages/Ticketmanagement/TicketManagerment'
import UserMgmt from './pages/UserManagement/UserMgmt'
// import ChatbotWidget from './components/ChatBotWidgetBS'


const App = () => {
  return (
    <Router basename='/admin'>
      {/* <ChatbotWidget /> */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route element={<AppLayout />}>
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Analytics" element={<Analytics />} />
          <Route path="/Conversations" element={<ConversationManager />} />
          <Route path="/Intents" element={<IntentManager />} />
          <Route path="/Knowledge-Base" element={<KnowledgeBaseManager />} />
          <Route path="/User-Management" element={<UserMgmt />} />
          <Route path="/Settings" element={<Settings />} />
          <Route path="/Profile" element={<UserProfile />} />
          <Route path="/Ticket-Management" element={<TicketManagement />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
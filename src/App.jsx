import React from 'react'
import AppLayout from './layout/AppLayout'
import './App.css'


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './BasePages/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Analytics from './pages/Analytics/Analytics'
import ConversationManager from './pages/ConversationManager/ConversationManager'
import IntentManager from './pages/IntentManager/IntentManager'
import KnowledgeBaseManager from './pages/KnowledgeBaseManager/KnowledgeBaseManager'
import Settings from './pages/Settings/Settings'
import UserMgmt from './pages/UserManagement/UserMgmt'



const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/Analytics" element={<Analytics />} />
          <Route path="/Conversations" element={<ConversationManager />} />
          <Route path="/Intents" element={<IntentManager />} />
          <Route path="/Knowledge-Base" element={<KnowledgeBaseManager />} />
          <Route path="/Settings" element={<Settings />} />
          <Route path="/User-Management" element={<UserMgmt />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
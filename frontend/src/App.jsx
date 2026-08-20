import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Registration from './pages/Registration'
import Kavach from './pages/Kavach'
import Frontline from './pages/Frontline'
import Enlistment from './pages/Enlistment'
import Telemetry from './pages/Telemetry'
import EngineTelemetry from './pages/EngineTelemetry'
import Dynamometer from './pages/Dynamometer'
import TankOverhaul from './pages/TankOverhaul'
import DyGmOffice from './pages/DyGmOffice'
import OfficerLetters from './pages/OfficerLetters'
import PredictiveAI from './pages/PredictiveAI'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Kavach />} />
        <Route path="/kavach" element={<Kavach />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/predictive-ai" element={<ProtectedRoute><PredictiveAI /></ProtectedRoute>} />
        <Route path="/registration" element={<ProtectedRoute><Registration /></ProtectedRoute>} />
        <Route path="/frontline" element={<ProtectedRoute><Frontline /></ProtectedRoute>} />
        <Route path="/enlistment" element={<ProtectedRoute><Enlistment /></ProtectedRoute>} />
        <Route path="/telemetry" element={<ProtectedRoute><Telemetry /></ProtectedRoute>} />
        <Route path="/engine-telemetry" element={<ProtectedRoute><EngineTelemetry /></ProtectedRoute>} />
        <Route path="/dynamometer" element={<ProtectedRoute><Dynamometer /></ProtectedRoute>} />
        <Route path="/tank-overhaul" element={<ProtectedRoute><TankOverhaul /></ProtectedRoute>} />
        <Route path="/dygm-office" element={<ProtectedRoute><DyGmOffice /></ProtectedRoute>} />
        <Route path="/officer-letters" element={<ProtectedRoute><OfficerLetters /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

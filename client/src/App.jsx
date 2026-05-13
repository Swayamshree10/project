// client/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'
import AppShell from './pages/AppShell'
import useLearnStore from './store/useLearnStore'

function Protected({ children }) {
  const token = useLearnStore((s) => s.token)
  return token ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<Protected><Onboarding /></Protected>} />
        <Route path="/app" element={<Protected><AppShell /></Protected>} />
      </Routes>
    </BrowserRouter>
  )
}

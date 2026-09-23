import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ElderlyDashboard from './pages/ElderlyDashboard';
import GamesHub from './pages/GamesHub';
import MemoryMatchGame from './pages/MemoryMatchGame';
import PatternRecognitionGame from './pages/PatternRecognitionGame';
import RemindersPage from './pages/RemindersPage';
import CaregiverDashboard from './pages/CaregiverDashboard';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ roles, children }) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  if (roles && !roles.includes(role)) return <Navigate to={role === 'caregiver' ? '/caregiver' : '/elderly'} replace />;
  return children;
};

export const App = () => (
  <div className="app-container">
    <Navbar />
    <main className="main-content" role="main">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/elderly" element={<ProtectedRoute roles={['elderly']}><ElderlyDashboard /></ProtectedRoute>} />
        <Route path="/games" element={<ProtectedRoute roles={['elderly']}><GamesHub /></ProtectedRoute>} />
        <Route path="/games/memory" element={<ProtectedRoute roles={['elderly']}><MemoryMatchGame /></ProtectedRoute>} />
        <Route path="/games/pattern" element={<ProtectedRoute roles={['elderly']}><PatternRecognitionGame /></ProtectedRoute>} />
        <Route path="/reminders" element={<ProtectedRoute roles={['elderly']}><RemindersPage /></ProtectedRoute>} />
        <Route path="/caregiver" element={<ProtectedRoute roles={['caregiver']}><CaregiverDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  </div>
);

export default App;

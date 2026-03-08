// React router imports follow
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLight from './pages/AuthLight';
import AuthDark from './pages/AuthDark';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import { isSessionValid } from './auth';

function App() {
  const hasSession = isSessionValid();

  return (
    <div className="dark text-slate-100 min-h-screen border-none">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth-light" element={<AuthLight />} />
        <Route path="/auth-dark" element={<AuthDark />} />
        <Route
          path="/dashboard"
          element={
            window.location.hash.includes('id_token')
              ? <Dashboard />
              : hasSession
                ? <Dashboard />
                : <Navigate to="/auth-dark" replace />
          }
        />
      </Routes>
    </div>
  );
}

export default App;

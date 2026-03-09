// React router imports follow
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLight from './pages/AuthLight';
import AuthDark from './pages/AuthDark';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import { isSessionValid } from './auth';

const ProtectedRoute = ({ children }) => {
  if (window.location.hash.includes('id_token') || isSessionValid()) {
    return children;
  }
  return <Navigate to="/auth-dark" replace />;
};

function App() {
  return (
    <div className="dark text-slate-100 min-h-screen border-none">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth-light" element={<AuthLight />} />
        <Route path="/auth-dark" element={<AuthDark />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;

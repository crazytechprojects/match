import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import CreateAgent from "./pages/CreateAgent";
import Dashboard from "./pages/Dashboard";
import Conversation from "./pages/Conversation";
import { ProfilePage, AgentPage, Billing } from "./pages/Settings";

function ProtectedRoute({ children, requireOnboarded = true }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (requireOnboarded && !user.onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

function AuthRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user && user.onboarded) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute requireOnboarded={false}><CreateAgent /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/chat/:id" element={<ProtectedRoute><Conversation /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/agent" element={<ProtectedRoute><AgentPage /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

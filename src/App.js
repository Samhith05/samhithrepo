// src/App.js
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ContractorDashboard from "./pages/ContractorDashboard";
import { useAuth } from "./components/AuthContext";
import UserStatusMessage from "./components/UserStatusMessage";
import RoleAccessDenied from "./components/RoleAccessDenied";

function App() {
  const {
    user,
    isAdmin,
    isApprovedUser,
    isPendingApproval,
    isDeniedUser,
    roleError,
  } = useAuth();

  // Show login page if user is not authenticated
  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }

  // Show role access denied if user tried to access unauthorized role
  if (roleError) {
    return <RoleAccessDenied />;
  }

  // Show status message for pending or denied users
  if (isPendingApproval || isDeniedUser) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <UserStatusMessage />
      </div>
    );
  }

  // Main application with authenticated and approved users
  return (
    <Router>
      <Routes>
        {/* Admin Dashboard - Prioritize admins to their dashboard */}
        <Route
          path="/"
          element={
            isAdmin ? (
              <AdminDashboard />
            ) : isApprovedUser ? (
              <UserDashboard />
            ) : (
              <div className="min-h-screen bg-gray-100 p-4">
                <UserStatusMessage />
              </div>
            )
          }
        />

        {/* Admin Dashboard - Direct route for admins */}
        <Route
          path="/admin"
          element={isAdmin ? <AdminDashboard /> : <Navigate to="/" replace />}
        />

        {/* User Dashboard - Direct route for users */}
        <Route
          path="/user"
          element={
            isApprovedUser ? <UserDashboard /> : <Navigate to="/" replace />
          }
        />

        {/* Contractor Dashboard - Redirect to appropriate dashboard based on role */}
        <Route
          path="/contractor"
          element={
            isAdmin ? (
              <Navigate to="/admin" replace />
            ) : isApprovedUser ? (
              <Navigate to="/user" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

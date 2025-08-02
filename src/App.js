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
import LoadingSpinner from "./components/LoadingSpinner";

function App() {
  const {
    user,
    isAdmin,
    isApprovedUser,
    isContractor,
    isPendingApproval,
    isDeniedUser,
    roleError,
    userStatus,
    userRole,
  } = useAuth();

  console.log("🚀 App render - roleError:", roleError);
  console.log("🚀 App render - user:", user?.email);
  console.log("🚀 App render - isAdmin:", isAdmin);
  console.log("🚀 App render - isContractor:", isContractor);
  console.log("🚀 App render - userStatus:", userStatus);
  console.log("🚀 App render - userRole:", userRole);

  // Show loading spinner while checking authentication
  if (userStatus === "loading") {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  // Show login page if user is not authenticated OR if they are new and need to choose a role
  if (!user || userStatus === "new" || userStatus === "unauthenticated") {
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
        {/* Home route - Direct users to appropriate dashboard */}
        <Route
          path="/"
          element={
            isAdmin ? (
              <AdminDashboard />
            ) : isContractor ? (
              <ContractorDashboard />
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
            isApprovedUser && !isContractor ? (
              <UserDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Contractor Dashboard - Direct route for contractors */}
        <Route
          path="/contractor"
          element={
            isContractor ? <ContractorDashboard /> : <Navigate to="/" replace />
          }
        />

        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

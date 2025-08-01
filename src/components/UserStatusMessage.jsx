// src/components/UserStatusMessage.jsx
import { useAuth } from "./AuthContext";

export default function UserStatusMessage() {
  const { user, isPendingApproval, isDeniedUser, logout } = useAuth();

  if (!user) return null;

  if (isPendingApproval) {
    return (
      <div className="max-w-md mx-auto p-6 bg-yellow-100 border border-yellow-300 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold text-yellow-800 mb-3">
          ⏳ Approval Pending
        </h2>
        <p className="text-yellow-700 mb-4">
          Your account is waiting for admin approval. You'll be able to access
          the system once an admin approves your request.
        </p>
        <p className="text-sm text-yellow-600 mb-4">
          Logged in as: {user.displayName || user.email}
        </p>
        <button
          onClick={logout}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Sign Out
        </button>
      </div>
    );
  }

  if (isDeniedUser) {
    return (
      <div className="max-w-md mx-auto p-6 bg-red-100 border border-red-300 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold text-red-800 mb-3">
          ❌ Access Denied
        </h2>
        <p className="text-red-700 mb-4">
          Your access request has been denied by an admin. You don't have
          permission to use this system.
        </p>
        <p className="text-sm text-red-600 mb-4">
          Logged in as: {user.displayName || user.email}
        </p>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return null;
}

// src/components/RoleAccessDenied.jsx

import { useAuth } from "./AuthContext";

export default function RoleAccessDenied() {
  const { roleError, clearRoleError, logout } = useAuth();

  if (!roleError) return null;

  const handleContinueAsUser = () => {
    clearRoleError();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-red-200">
        {/* Header */}
        <div className="bg-red-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚫</span>
            <div>
              <h2 className="text-lg font-bold">Access Denied</h2>
              <p className="text-red-100 text-sm">
                Administrator privileges required
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">{roleError.message}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 text-sm">⚠️</span>
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> You can still access the system as a
                  regular user to report and track maintenance issues.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleContinueAsUser}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded transition-colors"
            >
              Continue as User
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded transition-colors"
            >
              Logout & Try Different Account
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            If you believe you should have administrator access, please contact
            your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

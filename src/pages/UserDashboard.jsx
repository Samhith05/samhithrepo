// src/pages/UserDashboard.jsx

import { useAuth } from "../components/AuthContext";
import { Link } from "react-router-dom";
import UploadForm from "../components/UploadForm";
import IssueList from "../components/IssueList";

export default function UserDashboard() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">
                🛠️ AI Maintenance System
              </h1>
              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                User Dashboard
              </span>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm text-gray-600">
                  Welcome, {user.displayName || user.email}
                </span>
              )}
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Form Section */}
          <div>
            <UploadForm />
          </div>

          {/* Issues List Section */}
          <div>
            <IssueList />
          </div>
        </div>
      </div>
    </div>
  );
}

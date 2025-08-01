// src/pages/AdminDashboard.jsx

import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import StatusProgress from "../components/StatusProgress";
import { useAuth } from "../components/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import UserApprovalManager from "../components/UserApprovalManager";
import VerifiedUsersManager from "../components/VerifiedUsersManager";
import ContractorApprovalManager from "../components/ContractorApprovalManager";
import VerifiedContractorsManager from "../components/VerifiedContractorsManager";

export default function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Calculate dashboard stats
  const dashboardStats = {
    total: issues.length,
    open: issues.filter(issue => issue.status === 'Open').length,
    inProgress: issues.filter(issue => issue.status === 'In Progress').length,
    resolved: issues.filter(issue => issue.status === 'Resolved').length,
  };

  useEffect(() => {
    if (!isAdmin) {
      alert("Access Denied: Admins only.");
      navigate("/");
    }
  }, [isAdmin]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "issues"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIssues(data);
    });

    return () => unsub();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    const issueRef = doc(db, "issues", id);
    await updateDoc(issueRef, {
      status: newStatus,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">
                🛠 Admin Dashboard
              </h1>
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                Administrator
              </span>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Welcome,</span>{" "}
                  {user.displayName || user.email}
                </div>
              )}
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="premium-card hover-lift neon-blue floating-element">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold mb-1">Total Issues</p>
                <p className="text-3xl font-bold gradient-text-premium">{dashboardStats.total}</p>
                <p className="text-xs text-blue-500 mt-1">📊 System Overview</p>
              </div>
              <div className="text-4xl opacity-80">📋</div>
            </div>
          </div>

          <div className="premium-card hover-lift neon-orange" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-semibold mb-1">Open Issues</p>
                <p className="text-3xl font-bold text-orange-700">{dashboardStats.open}</p>
                <p className="text-xs text-orange-500 mt-1">🆕 Needs Attention</p>
              </div>
              <div className="text-4xl opacity-80">🚨</div>
            </div>
          </div>

          <div className="premium-card hover-lift" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-semibold mb-1">In Progress</p>
                <p className="text-3xl font-bold text-yellow-700">{dashboardStats.inProgress}</p>
                <p className="text-xs text-yellow-500 mt-1">⚡ Active Work</p>
              </div>
              <div className="text-4xl opacity-80">🔧</div>
            </div>
          </div>

          <div className="premium-card hover-lift neon-green floating-element" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold mb-1">Resolved</p>
                <p className="text-3xl font-bold text-green-700">{dashboardStats.resolved}</p>
                <p className="text-xs text-green-500 mt-1">✅ Completed</p>
              </div>
              <div className="text-4xl opacity-80">🎉</div>
            </div>
          </div>
        </div>
        {/* User Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Approval Manager */}
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <div className="bg-orange-600 px-4 py-3">
              <h3 className="text-lg font-bold text-white">
                🕐 Pending User Approvals
              </h3>
            </div>
            <div className="p-4">
              <UserApprovalManager />
            </div>
          </div>

          {/* Contractor Approval Manager */}
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <div className="bg-green-600 px-4 py-3">
              <h3 className="text-lg font-bold text-white">
                👷 Contractor Applications
              </h3>
            </div>
            <div className="p-4">
              <ContractorApprovalManager />
            </div>
          </div>
        </div>

        {/* Verified Users Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Verified Users Manager */}
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 px-4 py-3">
              <h3 className="text-lg font-bold text-white">
                ✅ Verified Users
              </h3>
            </div>
            <div className="p-4">
              <VerifiedUsersManager />
            </div>
          </div>

          {/* Verified Contractors Manager */}
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <div className="bg-purple-600 px-4 py-3">
              <h3 className="text-lg font-bold text-white">
                👷 Active Contractors
              </h3>
            </div>
            <div className="p-4">
              <VerifiedContractorsManager />
            </div>
          </div>
        </div>

        {/* Issues Management Section */}
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 px-4 py-3">
            <h3 className="text-lg font-bold text-white">🛠 Issue Management</h3>
            <p className="text-blue-100 text-sm mt-1">
              Manage and track all maintenance issues
            </p>
          </div>

          <div className="p-4">
            {issues.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-600 text-lg mb-2">
                  No issues available yet
                </p>
                <p className="text-gray-500 text-sm">
                  Issues will appear here once users start reporting them
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:border-blue-300"
                  >
                    {/* Issue Image */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-3">
                      <img
                        src={issue.imageUrl}
                        alt="issue"
                        className="w-full sm:w-28 h-28 object-cover rounded-lg shadow-sm transition-transform duration-200 hover:scale-105"
                      />

                      {/* Issue Details */}
                      <div className="flex-1 space-y-2">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-700 font-medium mb-1 flex items-center gap-1">
                            📝 Description
                          </p>
                          <p className="text-gray-800 text-sm leading-relaxed">
                            {issue.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
                            <p className="text-sm text-purple-700 font-medium flex items-center gap-1">
                              🏷️ Category
                            </p>
                            <p className="text-gray-800 font-semibold text-sm">
                              {issue.category}
                            </p>
                          </div>

                          <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                            <p className="text-sm text-green-700 font-medium flex items-center gap-1">
                              👨‍🔧 Assigned To
                            </p>
                            <p className="text-gray-800 font-semibold text-sm">
                              {issue.assignedTo}
                            </p>
                          </div>
                        </div>

                        {/* Additional Info */}
                        {(issue.userEmail || issue.createdAt) && (
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
                            {issue.userEmail && (
                              <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                                <span className="font-medium">👤 Reported by:</span>
                                <span className="text-blue-600">{issue.userEmail}</span>
                              </p>
                            )}
                            {issue.createdAt && (
                              <p className="text-xs text-gray-600 flex items-center gap-1">
                                <span className="font-medium">📅 Date:</span>
                                <span>{issue.createdAt.toDate().toLocaleDateString()}</span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Progress Bar */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                        📊 Progress Timeline
                      </p>
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
                        <StatusProgress currentStatus={issue.status} />
                      </div>
                    </div>

                    {/* Status and Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          Current Status:
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${issue.status === "Open"
                              ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300"
                              : issue.status === "Assigned"
                                ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300"
                                : issue.status === "In Progress"
                                  ? "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300"
                                  : "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300"
                            }`}
                        >
                          {issue.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-600">
                          Update Status:
                        </label>
                        <select
                          value={issue.status}
                          onChange={(e) =>
                            handleStatusChange(issue.id, e.target.value)
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-sm bg-white hover:border-blue-500 focus:border-blue-500 focus:outline-none"
                        >
                          <option value="Open">Open</option>
                          <option value="Assigned">Assigned</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

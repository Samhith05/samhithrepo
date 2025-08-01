// src/pages/AdminDashboard.jsx

import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import StatusProgress from "../components/StatusProgress";
import { useAuth } from "../components/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import UserApprovalManager from "../components/UserApprovalManager";
import VerifiedUsersManager from "../components/VerifiedUsersManager";

export default function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

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
        {/* User Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Approval Manager */}
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <div className="bg-orange-600 px-4 py-3">
              <h3 className="text-lg font-bold text-white">
                🕐 Pending Approvals
              </h3>
            </div>
            <div className="p-4">
              <UserApprovalManager />
            </div>
          </div>

          {/* Verified Users Manager */}
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <div className="bg-green-600 px-4 py-3">
              <h3 className="text-lg font-bold text-white">
                ✅ Verified Users
              </h3>
            </div>
            <div className="p-4">
              <VerifiedUsersManager />
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
                    className="bg-white border border-gray-200 rounded p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Issue Image */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-3">
                      <img
                        src={issue.imageUrl}
                        alt="issue"
                        className="w-full sm:w-28 h-28 object-cover rounded"
                      />

                      {/* Issue Details */}
                      <div className="flex-1 space-y-2">
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-sm text-blue-700 font-medium mb-1">
                            Description
                          </p>
                          <p className="text-gray-800 text-sm">
                            {issue.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="bg-purple-50 p-2 rounded">
                            <p className="text-sm text-purple-700 font-medium">
                              Category
                            </p>
                            <p className="text-gray-800 font-semibold text-sm">
                              {issue.category}
                            </p>
                          </div>

                          <div className="bg-green-50 p-2 rounded">
                            <p className="text-sm text-green-700 font-medium">
                              Assigned To
                            </p>
                            <p className="text-gray-800 font-semibold text-sm">
                              {issue.assignedTo}
                            </p>
                          </div>
                        </div>

                        {/* Additional Info */}
                        {(issue.userEmail || issue.createdAt) && (
                          <div className="bg-gray-50 p-2 rounded">
                            {issue.userEmail && (
                              <p className="text-xs text-gray-600 mb-1">
                                <span className="font-medium">
                                  Reported by:
                                </span>{" "}
                                {issue.userEmail}
                              </p>
                            )}
                            {issue.createdAt && (
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Date:</span>{" "}
                                {issue.createdAt.toDate().toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Progress Bar */}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Progress Timeline
                      </p>
                      <div className="bg-gray-50 p-2 rounded">
                        <StatusProgress currentStatus={issue.status} />
                      </div>
                    </div>

                    {/* Status and Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">
                          Current Status:
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            issue.status === "Open"
                              ? "bg-yellow-100 text-yellow-800"
                              : issue.status === "Assigned"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
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

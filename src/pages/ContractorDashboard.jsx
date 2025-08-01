// src/pages/ContractorDashboard.jsx

import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../components/AuthContext";
import StatusProgress from "../components/StatusProgress";

export default function ContractorDashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout, contractorCategory } = useAuth();

  console.log("🚀 ContractorDashboard - contractorCategory:", contractorCategory);

  useEffect(() => {
    if (!contractorCategory) {
      console.log("No contractor category found");
      setLoading(false);
      return;
    }

    console.log("🔍 Contractor Dashboard: Querying for issues with category:", contractorCategory);

    // First, let's see ALL issues to debug category matching
    const allIssuesQuery = collection(db, "issues");
    const unsubAll = onSnapshot(allIssuesQuery, (snapshot) => {
      console.log("🔍 ALL ISSUES DEBUG:");
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        console.log(`Issue ${doc.id}: category="${data.category}" | contractorCategory="${contractorCategory}" | match=${data.category === contractorCategory}`);
      });
    });

    // Query for issues that match the contractor's category
    const q = query(
      collection(db, "issues"),
      where("category", "==", contractorCategory)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      console.log(
        "🔍 Firestore snapshot received for contractor category, docs count:",
        snapshot.docs.length
      );
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by creation date (newest first)
      data.sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB - dateA;
      });

      console.log("🔍 Filtered issues for contractor:", data);
      setIssues(data);
      setLoading(false);
    });

    return () => {
      unsub();
      unsubAll();
    };
  }, [contractorCategory]);

  const updateStatus = async (id, newStatus) => {
    try {
      const ref = doc(db, "issues", id);
      await updateDoc(ref, {
        status: newStatus,
        lastUpdated: new Date(),
        updatedBy: user?.displayName || user?.email || "Contractor",
      });
      console.log(`Issue ${id} status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-yellow-100 text-yellow-800";
      case "Assigned":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const openIssues = issues.filter((issue) => issue.status === "Open");
  const assignedIssues = issues.filter((issue) => issue.status === "Assigned");
  const resolvedIssues = issues.filter((issue) => issue.status === "Resolved");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">
                👷 Contractor Dashboard
              </h1>
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {contractorCategory}
                </span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                  Contractor
                </span>
              </div>
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
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading your assigned issues...</p>
          </div>
        ) : !contractorCategory ? (
          <div className="bg-white rounded-lg shadow border p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Category Assigned
            </h3>
            <p className="text-gray-600">
              Your contractor category is not set. Please contact an
              administrator.
            </p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {openIssues.length}
                    </p>
                    <p className="text-sm text-gray-600">Open Issues</p>
                  </div>
                  <div className="text-2xl">🚨</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {assignedIssues.length}
                    </p>
                    <p className="text-sm text-gray-600">In Progress</p>
                  </div>
                  <div className="text-2xl">🔧</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {resolvedIssues.length}
                    </p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <div className="text-2xl">✅</div>
                </div>
              </div>
            </div>

            {/* Issues List */}
            <div className="bg-white rounded-lg shadow border">
              <div className="bg-green-600 px-6 py-4 rounded-t-lg">
                <h3 className="text-xl font-bold text-white">
                  📋 Issues in Your Category: {contractorCategory}
                </h3>
                <p className="text-green-100 text-sm mt-1">
                  Manage and update the status of maintenance issues assigned to
                  your expertise
                </p>
              </div>

              <div className="p-6">
                {issues.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-gray-600 text-lg mb-2">
                      No issues in your category yet
                    </p>
                    <p className="text-gray-500 text-sm">
                      Issues related to "{contractorCategory}" will appear here
                      when reported
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Pending Issues */}
                    {(openIssues.length > 0 || assignedIssues.length > 0) && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">
                          🚧 Active Issues (
                          {openIssues.length + assignedIssues.length})
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {[...openIssues, ...assignedIssues].map((issue) => (
                            <IssueCard
                              key={issue.id}
                              issue={issue}
                              onStatusUpdate={updateStatus}
                              getStatusColor={getStatusColor}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resolved Issues */}
                    {resolvedIssues.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">
                          ✅ Completed Issues ({resolvedIssues.length})
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {resolvedIssues.map((issue) => (
                            <IssueCard
                              key={issue.id}
                              issue={issue}
                              onStatusUpdate={updateStatus}
                              getStatusColor={getStatusColor}
                              isResolved={true}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Issue Card Component
function IssueCard({
  issue,
  onStatusUpdate,
  getStatusColor,
  isResolved = false,
}) {
  return (
    <div
      className={`border rounded-lg p-4 ${isResolved ? "bg-green-50" : "bg-white"
        } hover:shadow-md transition-shadow`}
    >
      <div className="flex gap-4 mb-3">
        <img
          src={issue.imageUrl}
          alt="Issue"
          className="w-20 h-20 object-cover rounded"
        />

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                issue.status
              )}`}
            >
              {issue.status}
            </span>
            {issue.createdAt && (
              <span className="text-xs text-gray-500">
                {issue.createdAt.toDate().toLocaleDateString()}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-800 mb-1">
            <strong>Description:</strong> {issue.description}
          </p>

          {issue.userEmail && (
            <p className="text-xs text-gray-600">
              <strong>Reported by:</strong> {issue.userEmail}
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <StatusProgress currentStatus={issue.status} />
      </div>

      {/* Status Update Controls */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {issue.lastUpdated && (
            <span>
              Updated:{" "}
              {new Date(issue.lastUpdated.seconds * 1000).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Status:</label>
          <select
            value={issue.status}
            onChange={(e) => onStatusUpdate(issue.id, e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm bg-white hover:border-green-500 focus:border-green-500 focus:outline-none"
            disabled={isResolved}
          >
            <option value="Open">Open</option>
            <option value="Assigned">In Progress</option>
            <option value="Resolved">Completed</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// src/pages/AdminDashboard.jsx

import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import StatusProgress from "../components/StatusProgress";
import { useAuth } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";
import UserApprovalManager from "../components/UserApprovalManager";

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">🛠 Admin Dashboard</h2>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-600">
              Welcome, {user.displayName || user.email}
            </span>
          )}
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* User Approval Manager */}
      <UserApprovalManager />

      {/* Issues Section */}
      <div className="bg-white border rounded p-4">
        <h3 className="text-lg font-semibold mb-4">🛠 Issue Management</h3>

        {issues.length === 0 && (
          <p className="text-gray-500">No issues available yet.</p>
        )}

        {issues.map((issue) => (
          <div
            key={issue.id}
            className="bg-white border rounded p-4 mb-4 shadow"
          >
            <img
              src={issue.imageUrl}
              alt="issue"
              className="w-32 h-32 object-cover rounded mb-2"
            />
            <p>
              <strong>Description:</strong> {issue.description}
            </p>
            <p>
              <strong>Category:</strong> {issue.category}
            </p>
            <p>
              <strong>Assigned To:</strong> {issue.assignedTo}
            </p>

            {/* Status Progress Bar */}
            <div style={{ margin: "16px 0" }}>
              <strong>Progress Timeline:</strong>
              <StatusProgress currentStatus={issue.status} />
            </div>

            <p>
              <strong>Current Status:</strong> {issue.status}
            </p>

            <div className="mt-2">
              <label className="mr-2 font-medium">Update Status:</label>
              <select
                value={issue.status}
                onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                className="border px-2 py-1 rounded"
              >
                <option value="Open">Open</option>
                <option value="Assigned">Assigned</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

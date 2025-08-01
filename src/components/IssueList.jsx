// src/components/IssueList.jsx

import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import StatusProgress from "./StatusProgress";
import { useAuth } from "./AuthContext";

export default function IssueList() {
  const [issues, setIssues] = useState([]);
  const { user, isApprovedUser } = useAuth();

  useEffect(() => {
    // Only fetch issues if user is authenticated and approved
    if (!user || !isApprovedUser) {
      setIssues([]);
      return;
    }

    // 📡 Listen to Firestore changes in real-time, filtered by current user's email
    const q = query(
      collection(db, "issues"),
      where("userEmail", "==", user.email)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setIssues(data);
    });

    return () => unsub(); // cleanup the listener on unmount
  }, [user, isApprovedUser]);

  // Organize issues into pending and resolved
  const pendingIssues = issues.filter((issue) => issue.status !== "Resolved");
  const resolvedIssues = issues.filter((issue) => issue.status === "Resolved");

  // Show message if user is not authenticated or approved
  if (!user) {
    return (
      <div className="bg-white border rounded p-4">
        <h2 className="text-xl font-semibold mb-4">Your Issues</h2>
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800">Please log in to view your issues.</p>
        </div>
      </div>
    );
  }

  if (!isApprovedUser) {
    return (
      <div className="bg-white border rounded p-4">
        <h2 className="text-xl font-semibold mb-4">Your Issues</h2>
        <div className="p-3 bg-orange-50 border border-orange-200 rounded">
          <p className="text-orange-800">
            Your account is pending approval. You cannot view issues until
            approved by an admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded p-4">
      <h2 className="text-xl font-semibold mb-4">Your Issues</h2>

      {issues.length === 0 && (
        <p className="text-gray-500">You haven't reported any issues yet.</p>
      )}

      {/* Pending Issues Section */}
      {pendingIssues.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3 text-yellow-700">
            🚧 Pending Issues ({pendingIssues.length})
          </h3>
          {pendingIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}

      {/* Resolved Issues Section */}
      {resolvedIssues.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3 text-green-700">
            ✅ Resolved Issues ({resolvedIssues.length})
          </h3>
          {resolvedIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}

// Component for individual issue card
function IssueCard({ issue }) {
  return (
    <div className="border bg-gray-50 rounded p-3 mb-3">
      <img
        src={issue.imageUrl}
        alt="Issue"
        className="w-28 h-28 object-cover rounded mb-2"
      />

      <p className="text-sm mb-1">
        <strong>Description:</strong> {issue.description}
      </p>
      <p className="text-sm mb-1">
        <strong>Category:</strong> {issue.category}
      </p>
      <p className="text-sm mb-1">
        <strong>Assigned To:</strong> {issue.assignedTo || "N/A"}
      </p>
      <p className="text-sm mb-1">
        <strong>Contact:</strong> {issue.contact || "N/A"}
      </p>
      <p className="text-sm mb-2">
        <strong>Submitted:</strong>{" "}
        {issue.createdAt?.toDate().toLocaleDateString() || "Unknown"}
      </p>

      {/* Status Progress Bar */}
      <div className="mb-2">
        <strong className="text-sm">Progress:</strong>
        <StatusProgress currentStatus={issue.status} />
      </div>

      <p className="text-sm">
        <strong>Status:</strong>{" "}
        <span
          className={
            issue.status === "Open"
              ? "text-yellow-600"
              : issue.status === "Assigned"
              ? "text-blue-600"
              : "text-green-600"
          }
        >
          {issue.status}
        </span>
      </p>
    </div>
  );
}

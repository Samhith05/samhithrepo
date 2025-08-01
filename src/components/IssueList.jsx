// src/components/IssueList.jsx

import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import StatusProgress from "./StatusProgress";

export default function IssueList() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    // 📡 Listen to Firestore changes in real-time
    const unsub = onSnapshot(collection(db, "issues"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setIssues(data);
    });

    return () => unsub(); // cleanup the listener on unmount
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">All Reported Issues</h2>

      {issues.length === 0 && (
        <p className="text-gray-500">No issues reported yet.</p>
      )}

      {issues.map((issue) => (
        <div
          key={issue.id}
          className="border bg-white rounded-lg p-4 mb-4 shadow"
        >
          <img
            src={issue.imageUrl}
            alt="Issue"
            className="w-32 h-32 object-cover rounded mb-3"
          />

          <p>
            <strong>Description:</strong> {issue.description}
          </p>
          <p>
            <strong>Category:</strong> {issue.category}
          </p>
          <p>
            <strong>Assigned To:</strong> {issue.assignedTo || "N/A"}
          </p>
          <p>
            <strong>Contact:</strong> {issue.contact || "N/A"}
          </p>

          {/* Status Progress Bar */}
          <div style={{ margin: "16px 0" }}>
            <strong>Progress:</strong>
            <StatusProgress currentStatus={issue.status} />
          </div>

          <p>
            <strong>Status:</strong>{" "}
            <span
              className={
                issue.status === "Open"
                  ? "text-yellow-500"
                  : issue.status === "Assigned"
                  ? "text-blue-500"
                  : "text-green-600"
              }
            >
              {issue.status}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}

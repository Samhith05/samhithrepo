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

export default function ContractorDashboard() {
  const [issues, setIssues] = useState([]);
  const { user } = useAuth();
  const technicianName = user?.displayName || "Unknown";

  console.log("ContractorDashboard - user:", user);
  console.log("ContractorDashboard - technicianName:", technicianName);

  useEffect(() => {
    console.log("useEffect triggered - technicianName:", technicianName);

    if (!technicianName || technicianName === "Unknown") {
      console.log("Skipping query - user not loaded or unknown");
      return;
    }

    console.log("Querying for issues assigned to:", technicianName);

    const q = query(
      collection(db, "issues"),
      where("assignedTo", "==", technicianName)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      console.log(
        "Firestore snapshot received, docs count:",
        snapshot.docs.length
      );
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Issues data:", data);
      setIssues(data);
    });

    return () => unsub();
  }, [technicianName]);

  const updateStatus = async (id, newStatus) => {
    const ref = doc(db, "issues", id);
    await updateDoc(ref, { status: newStatus });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">👷 Contractor Dashboard</h2>

      <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
        <p>
          <strong>Debug Info:</strong>
        </p>
        <p>
          User:{" "}
          {user
            ? JSON.stringify(user.displayName || user.email)
            : "Not logged in"}
        </p>
        <p>Technician Name: {technicianName}</p>
        <p>Issues Count: {issues.length}</p>
      </div>

      {issues.length === 0 ? (
        <div>
          <p className="text-gray-500">No issues assigned to you.</p>
          <p className="text-sm text-gray-400 mt-2">
            Make sure you're logged in and have issues assigned to "
            {technicianName}"
          </p>
        </div>
      ) : (
        issues.map((issue) => (
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
              <strong>Current Status:</strong> {issue.status}
            </p>

            <div className="mt-2">
              <label className="mr-2 font-medium">Update Status:</label>
              <select
                value={issue.status}
                onChange={(e) => updateStatus(issue.id, e.target.value)}
                className="border px-2 py-1 rounded"
              >
                <option value="Assigned">Assigned</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

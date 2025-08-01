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

export default function ContractorDashboard() {
  const [issues, setIssues] = useState([]);
  const technicianName = "Ravi Kumar"; // TODO: replace with logged-in user later

  useEffect(() => {
    const q = query(
      collection(db, "issues"),
      where("assignedTo", "==", technicianName)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIssues(data);
    });

    return () => unsub();
  }, []);

  const updateStatus = async (id, newStatus) => {
    const ref = doc(db, "issues", id);
    await updateDoc(ref, { status: newStatus });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">👷 Contractor Dashboard</h2>

      {issues.length === 0 ? (
        <p className="text-gray-500">No issues assigned to you.</p>
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

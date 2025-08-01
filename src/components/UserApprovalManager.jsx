// src/components/UserApprovalManager.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";

export default function UserApprovalManager() {
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "approvalRequests"), (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPendingRequests(
        requests.filter((req) => req.status === "waiting_approval")
      );
    });

    return () => unsub();
  }, []);

  const handleApproval = async (request, approved) => {
    try {
      const status = approved ? "approved" : "denied";

      // Update or create in approvedUsers collection
      await setDoc(doc(db, "approvedUsers", request.uid), {
        uid: request.uid,
        email: request.email,
        displayName: request.displayName,
        photoURL: request.photoURL,
        status: status,
        approvedAt: Timestamp.now(),
        joinedAt: request.requestedAt,
      });

      // Update the approval request status
      await updateDoc(doc(db, "approvalRequests", request.id), {
        status: approved ? "approved" : "denied",
        processedAt: Timestamp.now(),
      });

      // Remove from pending approvals
      await deleteDoc(doc(db, "pendingApprovals", request.uid));

      console.log(`User ${request.email} ${approved ? "approved" : "denied"}`);
    } catch (error) {
      console.error("Error processing approval:", error);
      alert("Error processing approval. Please try again.");
    }
  };

  if (pendingRequests.length === 0) {
    return (
      <div className="bg-white border rounded p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">
          👥 User Approval Requests
        </h3>
        <p className="text-gray-500">No pending approval requests.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4">
        👥 User Approval Requests ({pendingRequests.length})
      </h3>

      {pendingRequests.map((request) => (
        <div key={request.id} className="border rounded p-4 mb-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {request.photoURL && (
                <img
                  src={request.photoURL}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium">
                  {request.displayName || "No name"}
                </p>
                <p className="text-sm text-gray-600">{request.email}</p>
                <p className="text-xs text-gray-500">
                  Requested: {request.requestedAt?.toDate().toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleApproval(request, true)}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => handleApproval(request, false)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                ✗ Deny
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

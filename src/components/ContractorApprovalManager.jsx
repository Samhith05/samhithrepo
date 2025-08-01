// src/components/ContractorApprovalManager.jsx

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

export default function ContractorApprovalManager() {
  const [pendingContractors, setPendingContractors] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "contractorRequests"),
      (snapshot) => {
        const requests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPendingContractors(
          requests.filter((req) => req.status === "waiting_approval")
        );
      }
    );

    return () => unsub();
  }, []);

  const handleApproval = async (request, approved) => {
    try {
      const status = approved ? "approved" : "denied";

      // Update contractor approvals collection
      await setDoc(doc(db, "contractorApprovals", request.uid), {
        uid: request.uid,
        email: request.email,
        displayName: request.displayName,
        photoURL: request.photoURL,
        category: request.contractorCategory,
        contractorCategory: request.contractorCategory,
        status: status,
        approvedAt: Timestamp.now(),
        joinedAt: request.requestedAt,
        role: "contractor",
      });

      // Also add to approvedUsers collection if approved
      if (approved) {
        await setDoc(doc(db, "approvedUsers", request.uid), {
          uid: request.uid,
          email: request.email,
          displayName: request.displayName,
          photoURL: request.photoURL,
          status: "approved",
          role: "contractor",
          contractorCategory: request.contractorCategory,
          approvedAt: Timestamp.now(),
          joinedAt: request.requestedAt,
        });
      }

      // Update the contractor request status
      await updateDoc(doc(db, "contractorRequests", request.id), {
        status: approved ? "approved" : "denied",
        processedAt: Timestamp.now(),
      });

      console.log(
        `Contractor ${request.email} ${approved ? "approved" : "denied"}`
      );
    } catch (error) {
      console.error("Error processing contractor approval:", error);
      alert("Error processing approval. Please try again.");
    }
  };

  if (pendingContractors.length === 0) {
    return (
      <div className="bg-white border rounded p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">
          👷 Contractor Approval Requests
        </h3>
        <p className="text-gray-500">No pending contractor applications.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4">
        👷 Contractor Approval Requests ({pendingContractors.length})
      </h3>

      {pendingContractors.map((request) => (
        <div key={request.id} className="border rounded p-4 mb-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {request.photoURL && (
                <img
                  src={request.photoURL}
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-medium">
                  {request.displayName || "No name"}
                </p>
                <p className="text-sm text-gray-600">{request.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    👷 Contractor
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    {request.contractorCategory}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Applied: {request.requestedAt?.toDate().toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleApproval(request, true)}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => handleApproval(request, false)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
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

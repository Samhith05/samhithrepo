// src/components/VerifiedContractorsManager.jsx

import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

export default function VerifiedContractorsManager() {
  const [verifiedContractors, setVerifiedContractors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to approved contractors in real-time
    const q = query(
      collection(db, "approvedUsers"),
      where("role", "==", "contractor"),
      where("status", "==", "approved")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const contractors = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by approval date (most recent first)
      contractors.sort((a, b) => {
        const dateA = a.approvedAt?.toDate() || new Date(0);
        const dateB = b.approvedAt?.toDate() || new Date(0);
        return dateB - dateA;
      });

      setVerifiedContractors(contractors);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleDeleteContractor = async (contractor) => {
    if (
      !window.confirm(
        `Are you sure you want to delete contractor "${contractor.email}" specializing in ${contractor.contractorCategory}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      // Delete from approvedUsers collection
      await deleteDoc(doc(db, "approvedUsers", contractor.uid));

      // Also try to delete from contractor approvals if it exists
      try {
        await deleteDoc(doc(db, "contractorApprovals", contractor.uid));
      } catch (error) {
        // It's okay if this fails - the contractor might not be in contractor approvals
        console.log("Contractor not in contractor approvals (this is normal)");
      }

      console.log(`Contractor ${contractor.email} deleted successfully`);
    } catch (error) {
      console.error("Error deleting contractor:", error);
      alert("Error deleting contractor. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="bg-white border rounded p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">👷 Verified Contractors</h3>
        <p className="text-gray-500">Loading verified contractors...</p>
      </div>
    );
  }

  if (verifiedContractors.length === 0) {
    return (
      <div className="bg-white border rounded p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">👷 Verified Contractors</h3>
        <p className="text-gray-500">No verified contractors yet.</p>
      </div>
    );
  }

  // Group contractors by category
  const contractorsByCategory = verifiedContractors.reduce(
    (acc, contractor) => {
      const category = contractor.contractorCategory || "Unknown";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(contractor);
      return acc;
    },
    {}
  );

  return (
    <div className="bg-white border rounded p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4">
        👷 Verified Contractors ({verifiedContractors.length})
      </h3>

      <div className="space-y-4">
        {Object.entries(contractorsByCategory).map(
          ([category, contractors]) => (
            <div key={category} className="border rounded p-3 bg-green-50">
              <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                <span className="bg-green-100 px-2 py-1 rounded text-sm">
                  {category}
                </span>
                <span className="text-sm text-green-600">
                  ({contractors.length} contractor
                  {contractors.length !== 1 ? "s" : ""})
                </span>
              </h4>

              <div className="space-y-2">
                {contractors.map((contractor) => (
                  <div
                    key={contractor.id}
                    className="bg-white border rounded p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {contractor.photoURL && (
                          <img
                            src={contractor.photoURL}
                            alt="Profile"
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            {contractor.displayName || "No name"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {contractor.email}
                          </p>
                          <div className="text-xs text-gray-500 space-y-1">
                            {contractor.joinedAt && (
                              <p>
                                Joined:{" "}
                                {contractor.joinedAt
                                  .toDate()
                                  .toLocaleDateString()}
                              </p>
                            )}
                            {contractor.approvedAt && (
                              <p>
                                Approved:{" "}
                                {contractor.approvedAt
                                  .toDate()
                                  .toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 items-center">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                          ✓ Active
                        </span>
                        <button
                          onClick={() => handleDeleteContractor(contractor)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                          title="Delete contractor"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

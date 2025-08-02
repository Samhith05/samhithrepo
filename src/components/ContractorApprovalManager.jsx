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
      <div style={{
        backgroundColor: 'rgba(31, 41, 55, 0.8)',
        border: '1px solid rgba(75, 85, 99, 0.5)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <p style={{
          color: '#9ca3af',
          textAlign: 'center',
          margin: 0
        }}>No pending contractor applications.</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '12px',
      padding: '0',
      marginBottom: '16px'
    }}>
      {pendingContractors.map((request) => (
        <div key={request.id} style={{
          backgroundColor: 'rgba(31, 41, 55, 0.8)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '12px',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flex: 1,
              minWidth: '200px'
            }}>
              {request.photoURL && (
                <img
                  src={request.photoURL}
                  alt="Profile"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '2px solid rgba(34, 197, 94, 0.5)'
                  }}
                />
              )}
              <div>
                <p style={{
                  fontWeight: 'bold',
                  color: 'white',
                  margin: '0 0 4px 0',
                  fontSize: '14px'
                }}>
                  {request.displayName || "No name"}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  margin: '0 0 8px 0'
                }}>{request.email}</p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    color: '#86efac',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                  }}>
                    👷 Contractor
                  </span>
                  <span style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    color: '#93c5fd',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}>
                    {request.contractorCategory}
                  </span>
                </div>
                <p style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  margin: '4px 0 0 0'
                }}>
                  Applied: {request.requestedAt?.toDate().toLocaleDateString() || "Unknown"}
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              flexShrink: 0
            }}>
              <button
                onClick={() => handleApproval(request, true)}
                style={{
                  backgroundColor: '#22c55e',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#16a34a';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#22c55e';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                ✓ Approve
              </button>
              <button
                onClick={() => handleApproval(request, false)}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#dc2626';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ef4444';
                  e.target.style.transform = 'scale(1)';
                }}
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

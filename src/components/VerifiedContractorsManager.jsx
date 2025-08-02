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
        }}>Loading verified contractors...</p>
      </div>
    );
  }

  if (verifiedContractors.length === 0) {
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
        }}>No verified contractors yet.</p>
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
    <div style={{
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '12px',
      padding: '0',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {Object.entries(contractorsByCategory).map(
          ([category, contractors]) => (
            <div key={category} style={{
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              border: '1px solid rgba(168, 139, 250, 0.3)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <h4 style={{
                fontWeight: 'bold',
                color: '#a78bfa',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}>
                <span style={{
                  backgroundColor: 'rgba(168, 139, 250, 0.2)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  border: '1px solid rgba(168, 139, 250, 0.3)'
                }}>
                  {category}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#c4b5fd'
                }}>
                  ({contractors.length} contractor
                  {contractors.length !== 1 ? "s" : ""})
                </span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {contractors.map((contractor) => (
                  <div
                    key={contractor.id}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flex: 1,
                        minWidth: '150px'
                      }}>
                        {contractor.photoURL && (
                          <img
                            src={contractor.photoURL}
                            alt="Profile"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              border: '1px solid rgba(168, 139, 250, 0.3)'
                            }}
                          />
                        )}
                        <div>
                          <p style={{
                            fontWeight: 'bold',
                            fontSize: '12px',
                            color: 'white',
                            margin: '0 0 2px 0'
                          }}>
                            {contractor.displayName || "No name"}
                          </p>
                          <p style={{
                            fontSize: '10px',
                            color: '#9ca3af',
                            margin: '0 0 4px 0'
                          }}>
                            {contractor.email}
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                            {contractor.joinedAt && (
                              <p style={{
                                fontSize: '9px',
                                color: '#6b7280',
                                margin: 0
                              }}>
                                Joined:{" "}
                                {contractor.joinedAt
                                  .toDate()
                                  .toLocaleDateString()}
                              </p>
                            )}
                            {contractor.approvedAt && (
                              <p style={{
                                fontSize: '9px',
                                color: '#6b7280',
                                margin: 0
                              }}>
                                Approved:{" "}
                                {contractor.approvedAt
                                  .toDate()
                                  .toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                        flexShrink: 0
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
                          ✓ Active
                        </span>
                        <button
                          onClick={() => handleDeleteContractor(contractor)}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            fontSize: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#dc2626';
                            e.target.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#ef4444';
                            e.target.style.transform = 'scale(1)';
                          }}
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

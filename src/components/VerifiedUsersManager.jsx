// src/components/VerifiedUsersManager.jsx
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

export default function VerifiedUsersManager() {
  const [verifiedUsers, setVerifiedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to approved users in real-time
    const q = query(
      collection(db, "approvedUsers"),
      where("status", "==", "approved")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by approval date (most recent first)
      users.sort((a, b) => {
        const dateA = a.approvedAt?.toDate() || new Date(0);
        const dateB = b.approvedAt?.toDate() || new Date(0);
        return dateB - dateA;
      });

      setVerifiedUsers(users);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleDeleteUser = async (user) => {
    if (
      !window.confirm(
        `Are you sure you want to delete user "${user.email}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      // Delete from approvedUsers collection
      await deleteDoc(doc(db, "approvedUsers", user.uid));

      // Also try to delete from pendingApprovals if it exists
      try {
        await deleteDoc(doc(db, "pendingApprovals", user.uid));
      } catch (error) {
        // It's okay if this fails - the user might not be in pending approvals
        console.log("User not in pending approvals (this is normal)");
      }

      console.log(`User ${user.email} deleted successfully`);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user. Please try again.");
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
        }}>Loading verified users...</p>
      </div>
    );
  }

  if (verifiedUsers.length === 0) {
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
        }}>No verified users yet.</p>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {verifiedUsers.map((user) => (
          <div key={user.id} style={{
            backgroundColor: 'rgba(31, 41, 55, 0.8)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            padding: '16px',
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
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    style={{
                      width: '40px',
                      height: '40px',
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
                  }}>{user.displayName || "No name"}</p>
                  <p style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    margin: '0 0 2px 0'
                  }}>{user.email}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <p style={{
                      fontSize: '10px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      Joined: {user.joinedAt?.toDate().toLocaleDateString() || "Unknown"}
                    </p>
                    <p style={{
                      fontSize: '10px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      Approved: {user.approvedAt?.toDate().toLocaleDateString() || "Unknown"}
                    </p>
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
                  ✓ Approved
                </span>
                <button
                  onClick={() => handleDeleteUser(user)}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
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
                  title="Delete user"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

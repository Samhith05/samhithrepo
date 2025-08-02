// src/components/IssueList.jsx

import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import StatusProgress from "./StatusProgress";
import { useAuth } from "./AuthContext";

export default function IssueList() {
  const [issues, setIssues] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
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
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        background: 'rgba(251, 191, 36, 0.1)',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        borderRadius: '12px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#fbbf24',
          marginBottom: '8px'
        }}>Authentication Required</h3>
        <p style={{ color: '#fcd34d' }}>Please log in first to view your issues.</p>
      </div>
    );
  }

  if (!isApprovedUser) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#ef4444',
          marginBottom: '8px'
        }}>Approval Pending</h3>
        <p style={{ color: '#fca5a5' }}>
          Your account is pending approval. You cannot view issues until approved by an admin.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
      {/* Image Modal */}
      {selectedImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
          onClick={() => setSelectedImage(null)}
        >
          <div style={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            backgroundColor: '#1f2937',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '20px',
                zIndex: 1001,
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'}
            >
              ×
            </button>

            <img
              src={selectedImage}
              alt="Issue Detail"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '90vh',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>
        </div>
      )}

      {issues.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#9ca3af'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <p style={{ fontSize: '16px' }}>You haven't reported any issues yet.</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>Upload your first issue using the form on the left!</p>
        </div>
      )}

      {/* Pending Issues Section */}
      {pendingIssues.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🚧 Pending Issues ({pendingIssues.length})
          </h3>
          {pendingIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} onImageClick={setSelectedImage} />
          ))}
        </div>
      )}

      {/* Resolved Issues Section */}
      {resolvedIssues.length > 0 && (
        <div>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ✅ Resolved Issues ({resolvedIssues.length})
          </h3>
          {resolvedIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} onImageClick={setSelectedImage} />
          ))}
        </div>
      )}
    </div>
  );
}

// Component for individual issue card
function IssueCard({ issue, onImageClick }) {
  return (
    <div style={{
      backgroundColor: '#1f2937',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      border: '1px solid #374151',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.2)';
        e.currentTarget.style.borderColor = '#60a5fa';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#374151';
      }}
    >
      <div style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start'
      }}>
        {/* Image */}
        <div style={{
          flexShrink: 0,
          width: '100px',
          height: '100px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '2px solid #374151',
          cursor: 'pointer'
        }}
          onClick={() => onImageClick(issue.imageUrl)}
        >
          <img
            src={issue.imageUrl}
            alt="Issue"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          />
        </div>

        {/* Content */}
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          {/* Description */}
          <h4 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '12px',
            lineHeight: '1.4',
            wordBreak: 'break-word'
          }}>
            {issue.description}
          </h4>

          {/* Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px'
            }}>
              <span style={{
                fontSize: '12px',
                fontWeight: '500',
                color: '#93c5fd'
              }}>Category</span>
              <p style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: 'white',
                margin: '2px 0 0 0'
              }}>{issue.category}</p>
            </div>

            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px'
            }}>
              <span style={{
                fontSize: '12px',
                fontWeight: '500',
                color: '#86efac'
              }}>Assigned To</span>
              <p style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: 'white',
                margin: '2px 0 0 0'
              }}>{issue.assignedContractorName || issue.assignedTo || "Unassigned"}</p>
            </div>
          </div>

          {/* Status Progress */}
          <div style={{
            marginBottom: '12px',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#9ca3af',
              marginBottom: '8px'
            }}>Progress Timeline</div>
            <StatusProgress currentStatus={issue.status} />
          </div>

          {/* Status Badge and Date */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                fontSize: '12px',
                color: '#9ca3af'
              }}>Status:</span>
              <span style={{
                backgroundColor:
                  issue.status === "Open" ? '#ef4444' :
                    issue.status === "Assigned" ? '#3b82f6' :
                      issue.status === "In Progress" ? '#f59e0b' : '#22c55e',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                padding: '4px 12px',
                borderRadius: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {issue.status}
              </span>
            </div>

            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              📅 {issue.createdAt?.toDate().toLocaleDateString() || "Unknown"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

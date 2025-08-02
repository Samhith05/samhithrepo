// src/pages/AdminDashboard.jsx

import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc, query, where, orderBy } from "firebase/firestore";
import StatusProgress from "../components/StatusProgress";
import { useAuth } from "../components/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import UserApprovalManager from "../components/UserApprovalManager";
import VerifiedUsersManager from "../components/VerifiedUsersManager";
import ContractorApprovalManager from "../components/ContractorApprovalManager";
import VerifiedContractorsManager from "../components/VerifiedContractorsManager";
import AIReviewManager from "../components/AIReviewManager";

export default function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [openIssues, setOpenIssues] = useState([]);
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [inProgressIssues, setInProgressIssues] = useState([]);
  const [resolvedIssues, setResolvedIssues] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showResolvedIssues, setShowResolvedIssues] = useState(false);
  const [showAssignmentOption, setShowAssignmentOption] = useState(true);
  const [verifiedContractors, setVerifiedContractors] = useState([]);
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      alert("Access Denied: Admins only.");
      navigate("/");
    }
  }, [isAdmin]);

  useEffect(() => {
    // Fetch all issues for backward compatibility
    const unsubAll = onSnapshot(collection(db, "issues"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIssues(data);
    });

    // Fetch 'Open' issues from Firestore in real-time
    const qOpen = query(collection(db, 'issues'), where('status', '==', 'Open'));
    const unsubscribeOpen = onSnapshot(qOpen, (snapshot) => {
      setOpenIssues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch 'Assigned' issues from Firestore in real-time
    const qAssigned = query(collection(db, 'issues'), where('status', '==', 'Assigned'));
    const unsubscribeAssigned = onSnapshot(qAssigned, (snapshot) => {
      setAssignedIssues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch 'In Progress' issues from Firestore in real-time
    const qInProgress = query(collection(db, 'issues'), where('status', '==', 'In Progress'));
    const unsubscribeInProgress = onSnapshot(qInProgress, (snapshot) => {
      setInProgressIssues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch 'Resolved' issues from Firestore in real-time
    const qResolved = query(collection(db, 'issues'), where('status', '==', 'Resolved'));
    const unsubscribeResolved = onSnapshot(qResolved, (snapshot) => {
      setResolvedIssues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch verified contractors for assignment
    const qContractors = query(collection(db, 'contractorApprovals'), where('status', '==', 'approved'));
    const unsubscribeContractors = onSnapshot(qContractors, (snapshot) => {
      const contractors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("🔧 Loaded contractors:", contractors);
      setVerifiedContractors(contractors);
    });

    return () => {
      unsubAll();
      unsubscribeOpen();
      unsubscribeAssigned();
      unsubscribeInProgress();
      unsubscribeResolved();
      unsubscribeContractors();
    };
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    const issueRef = doc(db, "issues", id);
    await updateDoc(issueRef, {
      status: newStatus,
    });
  };

  const handleAssignContractor = async (issue) => {
    try {
      console.log("🔧 Assigning issue:", issue);
      console.log("🔧 Available contractors:", verifiedContractors);
      console.log("🔧 Issue category:", issue.category);

      // Find a contractor with matching category
      const matchingContractors = verifiedContractors.filter(
        contractor => contractor.contractorCategory === issue.category || contractor.category === issue.category
      );

      console.log("🔧 Matching contractors:", matchingContractors);

      if (matchingContractors.length === 0) {
        alert(`No contractors available for ${issue.category} category`);
        return;
      }

      // Show contractor selection modal
      showContractorSelectionModal(issue, matchingContractors);
    } catch (error) {
      console.error("❌ Error in assignment flow:", error);
      alert("Error in assignment flow. Please try again.");
    }
  };

  const showContractorSelectionModal = (issue, contractors) => {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: #1f2937;
      border-radius: 12px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    `;

    content.innerHTML = `
      <h3 style="color: white; margin: 0 0 16px 0; text-align: center;">
        Select Contractor for ${issue.category} Issue
      </h3>
      <p style="color: #9ca3af; margin: 0 0 16px 0; text-align: center; font-size: 14px;">
        Issue: ${issue.title}
      </p>
      <div id="contractor-list"></div>
      <div style="display: flex; gap: 12px; margin-top: 16px;">
        <button id="auto-assign" style="
          flex: 1;
          background: #3b82f6;
          color: white;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        ">Auto Assign</button>
        <button id="cancel-assign" style="
          flex: 1;
          background: #6b7280;
          color: white;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        ">Cancel</button>
      </div>
    `;

    const contractorList = content.querySelector('#contractor-list');

    contractors.forEach(contractor => {
      const contractorDiv = document.createElement('div');
      contractorDiv.style.cssText = `
        background: rgba(31, 41, 55, 0.8);
        border: 1px solid rgba(75, 85, 99, 0.5);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
      `;

      contractorDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          ${contractor.photoURL ? `<img src="${contractor.photoURL}" style="width: 32px; height: 32px; border-radius: 50%;">` : ''}
          <div>
            <div style="color: white; font-weight: bold; font-size: 14px;">
              ${contractor.displayName || contractor.email}
            </div>
            <div style="color: #9ca3af; font-size: 12px;">
              ${contractor.email}
            </div>
            <div style="color: #6b7280; font-size: 10px;">
              Category: ${contractor.contractorCategory || contractor.category}
            </div>
          </div>
        </div>
      `;

      contractorDiv.addEventListener('click', () => {
        assignToContractor(issue, contractor);
        document.body.removeChild(modal);
      });

      contractorDiv.addEventListener('mouseenter', () => {
        contractorDiv.style.background = 'rgba(59, 130, 246, 0.2)';
        contractorDiv.style.borderColor = '#3b82f6';
      });

      contractorDiv.addEventListener('mouseleave', () => {
        contractorDiv.style.background = 'rgba(31, 41, 55, 0.8)';
        contractorDiv.style.borderColor = 'rgba(75, 85, 99, 0.5)';
      });

      contractorList.appendChild(contractorDiv);
    });

    content.querySelector('#auto-assign').addEventListener('click', () => {
      autoAssignContractor(issue, contractors);
      document.body.removeChild(modal);
    });

    content.querySelector('#cancel-assign').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.appendChild(content);
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  };

  const autoAssignContractor = async (issue, contractors) => {
    // Smart assignment: pick contractor with least assigned issues
    const contractorWorkload = await Promise.all(
      contractors.map(async (contractor) => {
        const assignedIssues = issues.filter(
          i => i.assignedTo === contractor.email && i.status !== 'Resolved'
        );
        return {
          contractor,
          workload: assignedIssues.length
        };
      })
    );

    // Sort by workload (ascending) to pick least busy contractor
    contractorWorkload.sort((a, b) => a.workload - b.workload);
    const selectedContractor = contractorWorkload[0].contractor;

    await assignToContractor(issue, selectedContractor);
  };

  const assignToContractor = async (issue, contractor) => {
    try {
      const issueRef = doc(db, "issues", issue.id);
      await updateDoc(issueRef, {
        status: 'Assigned',
        assignedTo: contractor.email,
        assignedAt: new Date(),
        assignedContractorName: contractor.displayName || contractor.email,
      });

      console.log(`✅ Issue assigned to ${contractor.email}`);
      alert(`Issue "${issue.title}" assigned to ${contractor.displayName || contractor.email}`);
    } catch (error) {
      console.error("❌ Error assigning contractor:", error);
      alert("Error assigning contractor. Please try again.");
    }
  };

  // Auto-assign all unassigned issues
  const handleAutoAssignAll = async () => {
    try {
      const unassignedIssues = issues.filter(
        issue => issue.status === 'Open' && !issue.assignedTo
      );

      if (unassignedIssues.length === 0) {
        alert("No unassigned issues found.");
        return;
      }

      const confirmed = window.confirm(
        `Auto-assign ${unassignedIssues.length} unassigned issues to available contractors?`
      );

      if (!confirmed) return;

      let assignedCount = 0;
      let failedCount = 0;

      for (const issue of unassignedIssues) {
        try {
          const matchingContractors = verifiedContractors.filter(
            contractor => contractor.contractorCategory === issue.category || contractor.category === issue.category
          );

          if (matchingContractors.length > 0) {
            await autoAssignContractor(issue, matchingContractors);
            assignedCount++;
          } else {
            console.warn(`No contractors available for ${issue.category} category`);
            failedCount++;
          }
        } catch (error) {
          console.error(`Failed to assign issue ${issue.id}:`, error);
          failedCount++;
        }
      }

      alert(`Auto-assignment complete!\n✅ Assigned: ${assignedCount}\n❌ Failed: ${failedCount}`);
    } catch (error) {
      console.error("❌ Error in auto-assignment:", error);
      alert("Error in auto-assignment. Please try again.");
    }
  };

  // Helper component for a styled issue card
  const IssueCard = ({ issue, showAssignmentOption = false }) => {
    return (
      <div style={{
        backgroundColor: '#1f2937',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '16px',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <img
            src={issue.imageUrl}
            alt="Issue"
            style={{
              width: '64px',
              height: '64px',
              objectFit: 'cover',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'transform 0.3s ease'
            }}
            onClick={() => setSelectedImage(issue.imageUrl)}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          />
        </div>
        <div style={{ flexGrow: 1 }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {issue.description}
          </h3>
          <p style={{
            fontSize: '12px',
            color: '#9ca3af',
            marginTop: '4px'
          }}>
            Category: <span style={{ fontWeight: '500', color: '#60a5fa' }}>{issue.category}</span>
          </p>
          <p style={{
            fontSize: '12px',
            color: '#9ca3af'
          }}>
            Assigned To: <span style={{ fontWeight: '500', color: '#fbbf24' }}>{issue.assignedTo || 'Unassigned'}</span>
          </p>
          <p style={{
            fontSize: '10px',
            color: '#6b7280',
            marginTop: '4px'
          }}>
            User: {issue.userEmail || 'Unknown'} | Created: {issue.createdAt?.toDate().toLocaleDateString() || 'Unknown'}
          </p>
        </div>
        {showAssignmentOption && issue.status === 'Open' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => handleAssignContractor(issue)}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.transform = 'scale(1)';
              }}
            >
              👷 Assign
            </button>
            {verifiedContractors.filter(c => c.contractorCategory === issue.category).length === 0 && (
              <p style={{
                fontSize: '10px',
                color: '#ef4444',
                margin: '2px 0 0 0',
                textAlign: 'center'
              }}>
                No contractors for {issue.category}
              </p>
            )}
          </div>
        )}
        {issue.status === 'Resolved' && (
          <div style={{
            backgroundColor: '#22c55e',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            padding: '6px 12px',
            borderRadius: '20px',
            border: 'none'
          }}>
            ✓ Resolved
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 25%, #2d1b69 50%, #1a1a1a 75%, #0c0c0c 100%)',
      color: 'white',
      padding: '20px'
    }}>
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

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Header */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                margin: '0',
                background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                🛠️ Admin Dashboard
              </h1>
              <p style={{
                color: '#9ca3af',
                margin: '8px 0 0 0',
                fontSize: '14px'
              }}>
                Welcome, {user?.displayName || user?.email} | Real-time issue management
              </p>
            </div>
            <button
              onClick={logout}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '25px',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Assignment Control Panel */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)',
          marginTop: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                margin: '0 0 4px 0',
                color: '#60a5fa'
              }}>
                🎯 Issue Assignment Control
              </h3>
              <p style={{
                color: '#9ca3af',
                margin: '0',
                fontSize: '12px'
              }}>
                Unassigned: {issues.filter(i => i.status === 'Open' && !i.assignedTo).length} |
                Available Contractors: {verifiedContractors.length} |
                Active Assignments: {issues.filter(i => i.status === 'Assigned').length}
              </p>
              {/* Contractor Workload Summary */}
              <div style={{
                marginTop: '8px',
                fontSize: '10px',
                color: '#6b7280'
              }}>
                Workload: {verifiedContractors.map(contractor => {
                  const assignedCount = issues.filter(
                    i => i.assignedTo === contractor.email && i.status !== 'Resolved'
                  ).length;
                  return `${contractor.displayName?.split(' ')[0] || contractor.email.split('@')[0]} (${assignedCount})`;
                }).join(' | ')}
              </div>
            </div>
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleAutoAssignAll}
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                🚀 Auto-Assign All Unassigned
              </button>
              <button
                onClick={() => setShowAssignmentOption(!showAssignmentOption)}
                style={{
                  background: showAssignmentOption
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                {showAssignmentOption ? '🔒 Hide Assignment' : '👷 Show Assignment'}
              </button>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {/* Open Issues Card */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <h3 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#ef4444',
              margin: '0 0 8px 0'
            }}>
              {openIssues.length}
            </h3>
            <p style={{
              color: '#fca5a5',
              fontSize: '14px',
              fontWeight: '500',
              margin: '0'
            }}>
              🔴 Open Issues
            </p>
          </div>

          {/* Assigned Issues Card */}
          <div style={{
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(251, 191, 36, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <h3 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#fbbf24',
              margin: '0 0 8px 0'
            }}>
              {assignedIssues.length}
            </h3>
            <p style={{
              color: '#fcd34d',
              fontSize: '14px',
              fontWeight: '500',
              margin: '0'
            }}>
              🟡 Assigned Issues
            </p>
          </div>

          {/* In Progress Issues Card */}
          <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <h3 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#8b5cf6',
              margin: '0 0 8px 0'
            }}>
              {inProgressIssues.length}
            </h3>
            <p style={{
              color: '#c4b5fd',
              fontSize: '14px',
              fontWeight: '500',
              margin: '0'
            }}>
              🟣 In Progress
            </p>
          </div>

          {/* Resolved Issues Card */}
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
            onClick={() => setShowResolvedIssues(!showResolvedIssues)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(34, 197, 94, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <h3 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#22c55e',
              margin: '0 0 8px 0'
            }}>
              {resolvedIssues.length}
            </h3>
            <p style={{
              color: '#86efac',
              fontSize: '14px',
              fontWeight: '500',
              margin: '0 0 4px 0'
            }}>
              🟢 Resolved Issues
            </p>
            <p style={{
              color: '#6b7280',
              fontSize: '11px',
              margin: 0
            }}>
              {showResolvedIssues ? 'Click to hide' : 'Click to view'}
            </p>
          </div>
        </div>

        {/* Management Sections */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {/* Open Issues Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🔴 Open Issues ({openIssues.length})
            </h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {openIssues.map(issue => (
                <IssueCard key={issue.id} issue={issue} showAssignmentOption={true} />
              ))}
              {openIssues.length === 0 && (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                  No open issues
                </p>
              )}
            </div>
          </div>

          {/* Assigned Issues Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🟡 Assigned Issues ({assignedIssues.length})
            </h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {assignedIssues.map(issue => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
              {assignedIssues.length === 0 && (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                  No assigned issues
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Resolved Issues Section (Show when clicked) */}
        {showResolvedIssues && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🟢 Resolved Issues ({resolvedIssues.length})
            </h2>
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '16px'
            }}>
              {resolvedIssues.map(issue => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
              {resolvedIssues.length === 0 && (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                  No resolved issues yet
                </p>
              )}
            </div>
          </div>
        )}

        {/* User Management Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {/* User Approval Manager */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🕐 Pending User Approvals
            </h3>
            <UserApprovalManager />
          </div>

          {/* AI Review Manager */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🤖 AI Classifications Needing Review
            </h3>
            <AIReviewManager />
          </div>

          {/* Contractor Approval Manager */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              👷 Contractor Applications
            </h3>
            <ContractorApprovalManager />
          </div>
        </div>

        {/* Verified Users Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {/* Verified Users Manager */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ✅ Verified Users
            </h3>
            <VerifiedUsersManager />
          </div>

          {/* Verified Contractors Manager */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#a78bfa',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              👷 Active Contractors
            </h3>
            <VerifiedContractorsManager />
          </div>
        </div>
      </div>
    </div>
  );
}

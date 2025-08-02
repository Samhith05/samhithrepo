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
    const [loading, setLoading] = useState(true);
    const { user, logout, contractorCategory } = useAuth();

    console.log("🚀 ContractorDashboard - contractorCategory:", contractorCategory);

    useEffect(() => {
        if (!contractorCategory) {
            console.log("No contractor category found");
            setLoading(false);
            return;
        }

        console.log("🔍 Contractor Dashboard: Querying for issues with category:", contractorCategory);

        // Query for issues that match the contractor's category
        const q = query(
            collection(db, "issues"),
            where("category", "==", contractorCategory)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            console.log(
                "🔍 Firestore snapshot received for contractor category, docs count:",
                snapshot.docs.length
            );
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Sort by creation date (newest first)
            data.sort((a, b) => {
                const dateA = a.createdAt?.toDate() || new Date(0);
                const dateB = b.createdAt?.toDate() || new Date(0);
                return dateB - dateA;
            });

            console.log("🔍 Filtered issues for contractor:", data);
            setIssues(data);
            setLoading(false);
        });

        return () => {
            unsub();
        };
    }, [contractorCategory]);

    const updateStatus = async (id, newStatus) => {
        try {
            const ref = doc(db, "issues", id);
            await updateDoc(ref, {
                status: newStatus,
                lastUpdated: new Date(),
                updatedBy: user?.displayName || user?.email || "Contractor",
            });
            console.log(`Issue ${id} status updated to ${newStatus}`);
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status. Please try again.");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Open":
                return "bg-yellow-100 text-yellow-800";
            case "Assigned":
                return "bg-blue-100 text-blue-800";
            case "Resolved":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const openIssues = issues.filter((issue) => issue.status === "Open");
    const assignedIssues = issues.filter((issue) => issue.status === "Assigned");
    const resolvedIssues = issues.filter((issue) => issue.status === "Resolved");

    // Helper component for a styled issue card
    const IssueCard = ({ issue, onStatusUpdate, getStatusColor }) => {
        return (
            <div style={{
                backgroundColor: '#1f2937',
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
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
                <div style={{ display: 'flex', gap: '12px' }}>
                    <img
                        src={issue.imageUrl}
                        alt="Issue"
                        style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '12px',
                            flexShrink: 0
                        }}
                    />
                    <div style={{ flexGrow: 1 }}>
                        <h3 style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: 'white',
                            marginBottom: '8px',
                            lineHeight: '1.4'
                        }}>
                            {issue.description}
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                            <span style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                fontSize: '12px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontWeight: '500'
                            }}>
                                {issue.category}
                            </span>
                            <span style={{
                                backgroundColor: issue.status === 'Open' ? '#ef4444' : issue.status === 'Assigned' ? '#fbbf24' : '#22c55e',
                                color: 'white',
                                fontSize: '12px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontWeight: '500'
                            }}>
                                {issue.status}
                            </span>
                        </div>
                        {issue.userEmail && (
                            <p style={{
                                fontSize: '12px',
                                color: '#9ca3af'
                            }}>
                                Reported by: {issue.userEmail}
                            </p>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid #374151' }}>
                    {issue.status === 'Open' && (
                        <button
                            onClick={() => onStatusUpdate(issue.id, 'Assigned')}
                            style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                        >
                            Accept Task
                        </button>
                    )}
                    {issue.status === 'Assigned' && (
                        <button
                            onClick={() => onStatusUpdate(issue.id, 'Resolved')}
                            style={{
                                backgroundColor: '#059669',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#047857'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#059669'}
                        >
                            Mark Complete
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 25%, #059669 50%, #1a1a1a 75%, #0c0c0c 100%)',
            color: 'white',
            padding: '20px'
        }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'linear-gradient(135deg, #059669, #047857)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                animation: 'bounce 2s infinite'
                            }}>
                                <span style={{ fontSize: '24px' }}>👷</span>
                            </div>
                            <div>
                                <h1 style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    margin: '0',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    Contractor Hub
                                </h1>
                                <p style={{
                                    color: '#9ca3af',
                                    margin: '4px 0 0 0',
                                    fontSize: '14px'
                                }}>
                                    {contractorCategory} Specialist | {user?.displayName || user?.email}
                                </p>
                            </div>
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

                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            border: '3px solid rgba(255, 255, 255, 0.3)',
                            borderTop: '3px solid #059669',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 16px'
                        }}></div>
                        <p style={{ color: '#9ca3af', fontSize: '18px' }}>Loading your assigned issues...</p>
                    </div>
                ) : !contractorCategory ? (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '16px',
                        padding: '40px 20px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
                        <h3 style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: 'white',
                            marginBottom: '8px'
                        }}>
                            No Category Assigned
                        </h3>
                        <p style={{ color: '#9ca3af' }}>
                            Your contractor category is not set. Please contact an administrator.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Status Cards */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '20px'
                        }}>
                            {/* Open Issues Card */}
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
                                    fontSize: '32px',
                                    fontWeight: 'bold',
                                    color: '#fbbf24',
                                    margin: '0 0 8px 0'
                                }}>
                                    {openIssues.length}
                                </h3>
                                <p style={{
                                    color: '#fcd34d',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    margin: '0'
                                }}>
                                    🚨 Open Issues
                                </p>
                            </div>

                            {/* Assigned Issues Card */}
                            <div style={{
                                background: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '16px',
                                padding: '20px',
                                textAlign: 'center',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <h3 style={{
                                    fontSize: '32px',
                                    fontWeight: 'bold',
                                    color: '#3b82f6',
                                    margin: '0 0 8px 0'
                                }}>
                                    {assignedIssues.length}
                                </h3>
                                <p style={{
                                    color: '#93c5fd',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    margin: '0'
                                }}>
                                    🔧 In Progress
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
                                    fontSize: '32px',
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
                                    margin: '0'
                                }}>
                                    ✅ Completed
                                </p>
                            </div>
                        </div>

                        {/* Issues Section */}
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
                                color: '#059669',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                📋 Issues in Your Category: {contractorCategory}
                            </h2>

                            {issues.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px'
                                }}>
                                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
                                    <h3 style={{
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        color: 'white',
                                        marginBottom: '8px'
                                    }}>
                                        No issues in your category yet
                                    </h3>
                                    <p style={{ color: '#9ca3af' }}>
                                        Issues related to "{contractorCategory}" will appear here when reported
                                    </p>
                                </div>
                            ) : (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                                    gap: '16px'
                                }}>
                                    {issues.map((issue) => (
                                        <IssueCard
                                            key={issue.id}
                                            issue={issue}
                                            onStatusUpdate={updateStatus}
                                            getStatusColor={getStatusColor}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

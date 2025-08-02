// src/components/AIReviewManager.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
    collection,
    onSnapshot,
    doc,
    updateDoc,
    query,
    where,
    Timestamp,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

export default function AIReviewManager() {
    const [reviewIssues, setReviewIssues] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        // Query for issues that need manual review
        const q = query(
            collection(db, "issues"),
            where("needsReview", "==", true)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const issues = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Filter out already reviewed issues
            const pendingReview = issues.filter(issue => !issue.reviewedBy);
            setReviewIssues(pendingReview);
        });

        return () => unsub();
    }, []);

    const handleReviewComplete = async (issue, newCategory = null) => {
        try {
            const issueRef = doc(db, "issues", issue.id);
            const updateData = {
                needsReview: false,
                reviewedBy: user.email,
                reviewedAt: Timestamp.now(),
            };

            // If admin changed the category, update it
            if (newCategory && newCategory !== issue.category) {
                updateData.category = newCategory;
                updateData.originalAICategory = issue.category;
            }

            await updateDoc(issueRef, updateData);
            console.log(`Issue ${issue.id} review completed`);
        } catch (error) {
            console.error("Error completing review:", error);
            alert("Error completing review. Please try again.");
        }
    };

    if (reviewIssues.length === 0) {
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
                }}>No issues need manual review.</p>
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
            {reviewIssues.map((issue) => (
                <div key={issue.id} style={{
                    backgroundColor: 'rgba(31, 41, 55, 0.8)',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        {/* Issue Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '12px'
                        }}>
                            <div style={{ flex: 1 }}>
                                <h4 style={{
                                    color: 'white',
                                    margin: '0 0 4px 0',
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                }}>
                                    Issue Review Required
                                </h4>
                                <p style={{
                                    fontSize: '12px',
                                    color: '#9ca3af',
                                    margin: '0 0 2px 0'
                                }}>
                                    Reported by: {issue.userName || issue.userEmail}
                                </p>
                                {issue.aiConfidence && (
                                    <p style={{
                                        fontSize: '12px',
                                        color: '#ef4444',
                                        margin: 0,
                                        fontWeight: 'bold'
                                    }}>
                                        AI Confidence: {(issue.aiConfidence * 100).toFixed(1)}%
                                    </p>
                                )}
                            </div>

                            <div style={{
                                backgroundColor: issue.aiConfidence < 0.5 ? '#ef4444' : '#f59e0b',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: 'bold'
                            }}>
                                {issue.aiConfidence < 0.5 ? 'LOW CONFIDENCE' : 'MEDIUM CONFIDENCE'}
                            </div>
                        </div>

                        {/* Issue Content */}
                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            flexWrap: 'wrap'
                        }}>
                            {/* Image */}
                            {issue.imageUrl && (
                                <div style={{ flexShrink: 0 }}>
                                    <img
                                        src={issue.imageUrl}
                                        alt="Issue"
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            border: '2px solid rgba(255, 255, 255, 0.1)'
                                        }}
                                    />
                                </div>
                            )}

                            {/* Details */}
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{ marginBottom: '8px' }}>
                                    <label style={{
                                        fontSize: '12px',
                                        color: '#9ca3af',
                                        fontWeight: 'bold'
                                    }}>Description:</label>
                                    <p style={{
                                        color: 'white',
                                        margin: '2px 0 0 0',
                                        fontSize: '14px'
                                    }}>{issue.description}</p>
                                </div>

                                <div style={{ marginBottom: '8px' }}>
                                    <label style={{
                                        fontSize: '12px',
                                        color: '#9ca3af',
                                        fontWeight: 'bold'
                                    }}>AI Suggested Category:</label>
                                    <p style={{
                                        color: '#60a5fa',
                                        margin: '2px 0 0 0',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}>{issue.category}</p>
                                </div>

                                {/* Category Selection */}
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{
                                        fontSize: '12px',
                                        color: '#9ca3af',
                                        fontWeight: 'bold'
                                    }}>Correct Category:</label>
                                    <select
                                        id={`category-${issue.id}`}
                                        defaultValue={issue.category}
                                        style={{
                                            width: '100%',
                                            padding: '6px 8px',
                                            marginTop: '4px',
                                            backgroundColor: '#374151',
                                            color: 'white',
                                            border: '1px solid rgba(75, 85, 99, 0.5)',
                                            borderRadius: '6px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="Plumbing">Plumbing</option>
                                        <option value="Electrical">Electrical</option>
                                        <option value="HVAC">HVAC</option>
                                        <option value="Common Area Maintenance/Housekeeping">Common Area Maintenance/Housekeeping</option>
                                        <option value="Civil Structures">Civil Structures</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            justifyContent: 'flex-end',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={() => {
                                    const select = document.getElementById(`category-${issue.id}`);
                                    handleReviewComplete(issue, select.value);
                                }}
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
                                ✓ Approve & Update
                            </button>

                            <button
                                onClick={() => handleReviewComplete(issue)}
                                style={{
                                    backgroundColor: '#3b82f6',
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
                                    e.target.style.backgroundColor = '#2563eb';
                                    e.target.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#3b82f6';
                                    e.target.style.transform = 'scale(1)';
                                }}
                            >
                                ✓ AI Classification OK
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

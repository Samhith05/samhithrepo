// src/pages/UserDashboard.jsx

import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext";
import UploadForm from "../components/UploadForm";
import IssueList from "../components/IssueList";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    myIssues: 0,
    inProgress: 0,
    resolved: 0
  });

  useEffect(() => {
    if (!user?.email) return;

    const q = query(
      collection(db, "issues"),
      where("userEmail", "==", user.email)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const issues = snapshot.docs.map(doc => doc.data());

      setStats({
        myIssues: issues.length,
        inProgress: issues.filter(issue =>
          issue.status === "Assigned" || issue.status === "In Progress"
        ).length,
        resolved: issues.filter(issue => issue.status === "Resolved").length
      });
    });

    return () => unsubscribe();
  }, [user?.email]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 25%, #1e40af 50%, #1a1a1a 75%, #0c0c0c 100%)',
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
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'bounce 2s infinite'
              }}>
                <span style={{ fontSize: '24px' }}>🏠</span>
              </div>
              <div>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  margin: '0',
                  background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  User Portal
                </h1>
                <p style={{
                  color: '#9ca3af',
                  margin: '4px 0 0 0',
                  fontSize: '14px'
                }}>
                  Welcome, {user?.displayName || user?.email}
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

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          {/* Total Issues Card */}
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
              {stats.myIssues}
            </h3>
            <p style={{
              color: '#93c5fd',
              fontSize: '14px',
              fontWeight: '500',
              margin: '0'
            }}>
              📋 My Issues
            </p>
          </div>

          {/* In Progress Card */}
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
              {stats.inProgress}
            </h3>
            <p style={{
              color: '#fcd34d',
              fontSize: '14px',
              fontWeight: '500',
              margin: '0'
            }}>
              🔧 In Progress
            </p>
          </div>

          {/* Resolved Card */}
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
              {stats.resolved}
            </h3>
            <p style={{
              color: '#86efac',
              fontSize: '14px',
              fontWeight: '500',
              margin: '0'
            }}>
              ✅ Resolved
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {/* Upload Form Section */}
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
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📤 Report New Issue
            </h2>
            <UploadForm />
          </div>

          {/* Issues List Section */}
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
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📋 Your Issues ({stats.myIssues})
            </h2>
            <IssueList />
          </div>
        </div>
      </div>
    </div>
  );
}

// src/pages/LoginPage.jsx

import { useState } from "react";
import { useAuth } from "../components/AuthContext";
import ContractorCategorySelector from "../components/ContractorCategorySelector";
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";

export default function LoginPage() {
  const { login, roleError, clearRoleError, setRoleError, isAdmin } = useAuth();
  const [showContractorSelector, setShowContractorSelector] = useState(false);
  const [isCheckingContractor, setIsCheckingContractor] = useState(false);

  const handleRoleLogin = async (role) => {
    if (role === "contractor") {
      setIsCheckingContractor(true);

      try {
        // First, authenticate with Google to get user info
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);

        // Check if this contractor already exists in the system
        const existingContractor = await checkExistingContractor(result.user);

        if (existingContractor) {
          // User is an existing contractor, don't call login - just let AuthContext handle the auth state change
          console.log("✅ Existing contractor found, authentication complete");
          // Clear any existing role errors since this is a valid contractor
          clearRoleError();
          // The auth state change will automatically redirect them to their dashboard
          // No need to call login() function which has role restrictions
        } else {
          // New contractor - check if they're trying to use admin/user email
          const userEmail = result.user.email;

          // Check if this email exists in admin or user collections
          const isAdminOrUser = await checkIfAdminOrUser(userEmail);

          if (isAdminOrUser) {
            // Block admin/user emails from contractor registration
            setRoleError("This email is already registered as admin/user. Please use a different email for contractor registration.");
            await auth.signOut(); // Sign out to clear auth state
            setIsCheckingContractor(false);
            return;
          }

          // New contractor with non-admin/user email, show category selector
          console.log("New contractor, showing category selector");
          setShowContractorSelector(true);
        }
      } catch (error) {
        console.error("Contractor check failed:", error);
        // Sign out if there was an error to clear the auth state
        try {
          await auth.signOut();
        } catch (signOutError) {
          console.error("Error signing out:", signOutError);
        }
      } finally {
        setIsCheckingContractor(false);
      }
      return;
    }

    try {
      await login(role);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const checkExistingContractor = async (firebaseUser) => {
    try {
      // Check if user exists in approved users as contractor
      const approvedDoc = await getDoc(
        doc(db, "approvedUsers", firebaseUser.uid)
      );
      if (approvedDoc.exists() && approvedDoc.data().role === "contractor") {
        return true;
      }

      // Check if user exists in contractor approvals (approved, pending, or denied)
      const contractorDoc = await getDoc(
        doc(db, "contractorApprovals", firebaseUser.uid)
      );
      if (contractorDoc.exists()) {
        return true;
      }

      // Check if user has pending approval as contractor in general pending approvals
      const pendingDoc = await getDoc(
        doc(db, "pendingApprovals", firebaseUser.uid)
      );
      if (pendingDoc.exists() && pendingDoc.data().role === "contractor") {
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking existing contractor:", error);
      return false;
    }
  };

  const checkIfAdminOrUser = async (email) => {
    try {
      // Check if email exists in approved users with admin or user role
      const approvedUsersSnapshot = await getDocs(collection(db, "approvedUsers"));

      for (const doc of approvedUsersSnapshot.docs) {
        const userData = doc.data();
        if (userData.email === email && (userData.role === "admin" || userData.role === "user")) {
          return true;
        }
      }

      // Check if email exists in pending approvals with admin or user role
      const pendingApprovalsSnapshot = await getDocs(collection(db, "pendingApprovals"));

      for (const doc of pendingApprovalsSnapshot.docs) {
        const userData = doc.data();
        if (userData.email === email && (userData.role === "admin" || userData.role === "user")) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error checking admin/user status:", error);
      return false;
    }
  };

  const handleContractorCategorySelect = async (categoryName, categoryId) => {
    try {
      // Call login with the category but indicate we're already authenticated
      await login("contractor", categoryName, true); // true flag indicates already authenticated
      setShowContractorSelector(false);
    } catch (error) {
      console.error("Contractor login failed:", error);
      setShowContractorSelector(false);
      // Sign out on error
      try {
        await auth.signOut();
      } catch (signOutError) {
        console.error("Error signing out:", signOutError);
      }
    }
  };

  const handleContractorCancel = async () => {
    setShowContractorSelector(false);
    // Sign out the user since they cancelled the registration
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (showContractorSelector) {
    return (
      <ContractorCategorySelector
        onCategorySelect={handleContractorCategorySelect}
        onCancel={handleContractorCancel}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #312e81, #581c87, #be185d)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}>
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '40px',
          width: '288px',
          height: '288px',
          backgroundColor: '#3b82f6',
          borderRadius: '50%',
          mixBlendMode: 'multiply',
          filter: 'blur(64px)',
          opacity: 0.2,
          animation: 'pulse 2s infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '80px',
          right: '40px',
          width: '384px',
          height: '384px',
          backgroundColor: '#a855f7',
          borderRadius: '50%',
          mixBlendMode: 'multiply',
          filter: 'blur(64px)',
          opacity: 0.2,
          animation: 'pulse 2s infinite',
          animationDelay: '1s'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-32px',
          left: '80px',
          width: '320px',
          height: '320px',
          backgroundColor: '#ec4899',
          borderRadius: '50%',
          mixBlendMode: 'multiply',
          filter: 'blur(64px)',
          opacity: 0.2,
          animation: 'pulse 2s infinite',
          animationDelay: '2s'
        }}></div>
      </div>

      {/* Floating Particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
      }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              animation: 'bounce 2s infinite',
              backgroundColor: 'white',
              borderRadius: '50%',
              opacity: 0.1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        <div style={{ maxWidth: '1152px', width: '100%' }}>
          {/* Hero Section */}
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(to right, #60a5fa, #a855f7)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  animation: 'bounce 2s infinite'
                }}>
                  <span style={{ fontSize: '32px' }}>🛠️</span>
                </div>
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '24px',
                  height: '24px',
                  backgroundColor: '#4ade80',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '12px' }}>✨</span>
                </div>
              </div>
              <div>
                <h1 style={{
                  fontSize: '72px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(to right, white, #dbeafe, #e0e7ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '8px',
                  margin: 0
                }}>
                  Resolv
                </h1>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#93c5fd'
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#4ade80',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }}></span>
                  <span style={{ fontSize: '18px', fontWeight: '500' }}>AI-Powered</span>
                </div>
              </div>
            </div>

            <h2 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '24px',
              lineHeight: '1.2'
            }}>
              Smart Maintenance Management
              <br />
              <span style={{
                background: 'linear-gradient(to right, #60a5fa, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                for Modern Communities
              </span>
            </h2>

            <p style={{
              fontSize: '20px',
              color: '#d1d5db',
              marginBottom: '32px',
              maxWidth: '768px',
              margin: '0 auto 32px auto',
              lineHeight: '1.6'
            }}>
              Experience the future of facility management with AI-powered issue detection,
              smart contractor assignment, and real-time progress tracking.
            </p>

            {/* Key Features */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginBottom: '48px',
              maxWidth: '1024px',
              margin: '0 auto 48px auto'
            }}>
              <div style={{
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '8px'
                  }}>AI Detection</h3>
                  <p style={{
                    color: '#d1d5db',
                    fontSize: '14px'
                  }}>Intelligent categorization and priority assessment</p>
                </div>
              </div>

              <div style={{
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '8px'
                  }}>Real-Time Updates</h3>
                  <p style={{
                    color: '#d1d5db',
                    fontSize: '14px'
                  }}>Live tracking and instant notifications</p>
                </div>
              </div>

              <div style={{
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '8px'
                  }}>Smart Matching</h3>
                  <p style={{
                    color: '#d1d5db',
                    fontSize: '14px'
                  }}>Automated contractor assignment system</p>
                </div>
              </div>
            </div>
          </div>

          {/* Login Section */}
          <div style={{ maxWidth: '448px', margin: '0 auto' }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(24px)',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '8px'
                }}>Choose Your Role</h3>
                <p style={{ color: '#d1d5db' }}>Join thousands of satisfied users</p>
              </div>

              {/* Error Display */}
              {roleError && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '2px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '32px',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)'
                }}>
                  {/* Animated background */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, transparent, rgba(239, 68, 68, 0.1), transparent)',
                    animation: 'slide 3s ease-in-out infinite'
                  }}></div>

                  <div style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px'
                  }}>
                    {/* Error Icon */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#ef4444',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      color: 'white',
                      flexShrink: 0,
                      animation: 'bounce 2s infinite',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                    }}>
                      🚫
                    </div>

                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        color: '#fca5a5',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        margin: '0 0 12px 0',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                      }}>
                        Authentication Error
                      </h4>
                      <p style={{
                        color: '#fee2e2',
                        fontSize: '15px',
                        lineHeight: '1.6',
                        margin: '0 0 20px 0',
                        fontWeight: '500'
                      }}>
                        {roleError.message || roleError}
                      </p>

                      {/* Enhanced Action Button */}
                      <button
                        onClick={clearRoleError}
                        style={{
                          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.3))',
                          color: '#fca5a5',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          borderRadius: '12px',
                          padding: '12px 20px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.4))';
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.3))';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.1)';
                        }}
                      >
                        <span>✕</span>
                        Dismiss Error
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Login Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* User Login */}
                <button
                  onClick={() => handleRoleLogin("user")}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
                    color: 'white',
                    fontWeight: '600',
                    padding: '16px 24px',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    transform: 'scale(1)',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.background = 'linear-gradient(to right, #1d4ed8, #1e40af)';
                    e.target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.background = 'linear-gradient(to right, #2563eb, #1d4ed8)';
                    e.target.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.3s ease'
                  }}>
                    <span style={{ fontSize: '24px' }}>👤</span>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>User Portal</div>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>Report & track maintenance issues</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <svg style={{ width: '24px', height: '24px', transition: 'transform 0.3s ease' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </button>

                {/* Admin Login */}
                <button
                  onClick={() => handleRoleLogin("admin")}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(to right, #dc2626, #b91c1c)',
                    color: 'white',
                    fontWeight: '600',
                    padding: '16px 24px',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    transform: 'scale(1)',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.background = 'linear-gradient(to right, #b91c1c, #991b1b)';
                    e.target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.background = 'linear-gradient(to right, #dc2626, #b91c1c)';
                    e.target.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.3s ease'
                  }}>
                    <span style={{ fontSize: '24px' }}>👑</span>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Admin Dashboard</div>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>Manage system & oversee operations</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <svg style={{ width: '24px', height: '24px', transition: 'transform 0.3s ease' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </button>

                {/* Contractor Login */}
                <button
                  onClick={() => handleRoleLogin("contractor")}
                  disabled={isCheckingContractor}
                  style={{
                    width: '100%',
                    background: isCheckingContractor
                      ? '#6b7280'
                      : 'linear-gradient(to right, #059669, #047857)',
                    color: 'white',
                    fontWeight: '600',
                    padding: '16px 24px',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    transform: 'scale(1)',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    border: 'none',
                    cursor: isCheckingContractor ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!isCheckingContractor) {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.background = 'linear-gradient(to right, #047857, #065f46)';
                      e.target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCheckingContractor) {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.background = 'linear-gradient(to right, #059669, #047857)';
                      e.target.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: isCheckingContractor ? '#9ca3af' : 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.3s ease'
                  }}>
                    <span style={{ fontSize: '24px' }}>👷</span>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                      {isCheckingContractor ? "Verifying..." : "Contractor Hub"}
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>
                      {isCheckingContractor ? "Please wait..." : "Handle assigned maintenance tasks"}
                    </div>
                  </div>
                  {!isCheckingContractor && (
                    <div style={{ marginLeft: 'auto' }}>
                      <svg style={{ width: '24px', height: '24px', transition: 'transform 0.3s ease' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>

              {/* Security Notice */}
              <div style={{
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  color: '#d1d5db'
                }}>
                  <svg style={{ width: '20px', height: '20px', color: '#4ade80' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Secure Google Authentication</span>
                </div>
                <p style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  textAlign: 'center',
                  marginTop: '8px'
                }}>
                  Your data is protected with enterprise-grade security
                </p>
              </div>
            </div>

            {/* Stats Section */}
            <div style={{
              marginTop: '48px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
              textAlign: 'center'
            }}>
              <div style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => e.target.querySelector('div').style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.target.querySelector('div').style.transform = 'scale(1)'}
              >
                <div style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '4px',
                  transition: 'transform 0.3s ease'
                }}>500+</div>
                <div style={{ fontSize: '14px', color: '#d1d5db' }}>Issues Resolved</div>
              </div>
              <div style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => e.target.querySelector('div').style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.target.querySelector('div').style.transform = 'scale(1)'}
              >
                <div style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '4px',
                  transition: 'transform 0.3s ease'
                }}>50+</div>
                <div style={{ fontSize: '14px', color: '#d1d5db' }}>Active Contractors</div>
              </div>
              <div style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => e.target.querySelector('div').style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.target.querySelector('div').style.transform = 'scale(1)'}
              >
                <div style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '4px',
                  transition: 'transform 0.3s ease'
                }}>99%</div>
                <div style={{ fontSize: '14px', color: '#d1d5db' }}>User Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}

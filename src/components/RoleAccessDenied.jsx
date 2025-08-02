// src/components/RoleAccessDenied.jsx

import { useAuth } from "./AuthContext";

export default function RoleAccessDenied() {
  const { roleError, clearRoleError, logout } = useAuth();

  if (!roleError) return null;

  const handleContinueAsUser = () => {
    clearRoleError();
  };

  const handleLogout = () => {
    logout();
  };

  const getErrorIcon = () => {
    switch (roleError.type) {
      case "admin_access_denied":
        return "🚫";
      case "admin_role_conflict":
        return "⚠️";
      case "contractor_category_required":
        return "👷";
      default:
        return "🚫";
    }
  };

  const getErrorTitle = () => {
    switch (roleError.type) {
      case "admin_access_denied":
        return "Administrator Access Required";
      case "admin_role_conflict":
        return "Role Conflict Detected";
      case "contractor_category_required":
        return "Category Selection Required";
      default:
        return "Access Denied";
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 25%, #2d1b69 50%, #1a1a1a 75%, #0c0c0c 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000
    }}>
      {/* Animated Background Particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 255, 198, 0.1) 0%, transparent 50%)
        `,
        animation: 'pulse 4s ease-in-out infinite'
      }} />

      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        animation: 'slideIn 0.5s ease-out',
        position: 'relative'
      }}>
        {/* Header with Gradient */}
        <div style={{
          background: roleError.type === "admin_role_conflict"
            ? 'linear-gradient(135deg, #f59e0b, #d97706)'
            : 'linear-gradient(135deg, #ef4444, #dc2626)',
          padding: '32px 24px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '16px',
            animation: 'bounce 2s infinite'
          }}>
            {getErrorIcon()}
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
            margin: '0 0 8px 0',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            {getErrorTitle()}
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px',
            margin: 0,
            fontWeight: '500'
          }}>
            Authentication Required
          </p>
        </div>

        {/* Main Content */}
        <div style={{
          padding: '32px 24px'
        }}>
          {/* Error Message */}
          <div style={{
            backgroundColor: 'rgba(31, 41, 55, 0.8)',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <p style={{
              color: '#f3f4f6',
              fontSize: '16px',
              lineHeight: '1.6',
              margin: '0 0 16px 0',
              fontWeight: '500'
            }}>
              {roleError.message}
            </p>

            {/* Info Note */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <span style={{
                fontSize: '20px',
                flexShrink: 0
              }}>
                💡
              </span>
              <div>
                <p style={{
                  color: '#93c5fd',
                  fontSize: '14px',
                  margin: '0 0 4px 0',
                  fontWeight: 'bold'
                }}>
                  Quick Tip:
                </p>
                <p style={{
                  color: '#e5e7eb',
                  fontSize: '13px',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  {roleError.type === "admin_role_conflict"
                    ? "You can continue as a regular user to report and track maintenance issues."
                    : "Please contact your system administrator if you believe this is an error."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {roleError.type === "admin_role_conflict" && (
              <button
                onClick={handleContinueAsUser}
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.2)';
                }}
              >
                <span>✅</span>
                Continue as User
              </button>
            )}

            <button
              onClick={handleLogout}
              style={{
                background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                color: 'white',
                padding: '16px 24px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(107, 114, 128, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(107, 114, 128, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.2)';
              }}
            >
              <span>🚪</span>
              Try Different Account
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '20px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#9ca3af',
            fontSize: '12px',
            margin: 0,
            lineHeight: '1.5'
          }}>
            🔒 Secure Authentication • MaintenAID System
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 0.3;
            }
            50% {
              opacity: 0.6;
            }
          }
        `}
      </style>
    </div>
  );
}

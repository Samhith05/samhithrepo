// SIMPLIFIED LOGIN PAGE - EMERGENCY FIX
import { useState } from "react";
import { useAuth } from "../components/AuthContext";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function LoginPage() {
  const { login, roleError, clearRoleError } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleRoleLogin = async (role) => {
    setIsLoggingIn(true);
    clearRoleError();
    
    try {
      console.log("🔍 Attempting login with role:", role);
      
      // Simple Google login
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("✅ Google login successful:", result.user.email);
      
      // Let AuthContext handle the rest
      await login(role);
      
    } catch (error) {
      console.error("❌ Login failed:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #312e81, #581c87, #be185d)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>MaintenAid</h1>
        <p style={{ marginBottom: '30px', opacity: 0.8 }}>Choose your role to continue</p>
        
        {roleError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '20px',
            color: '#ff6b6b'
          }}>
            {roleError.message || roleError}
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button
            onClick={() => handleRoleLogin("admin")}
            disabled={isLoggingIn}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '15px 25px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoggingIn ? 'not-allowed' : 'pointer',
              opacity: isLoggingIn ? 0.7 : 1
            }}
          >
            {isLoggingIn ? 'Logging in...' : 'Login as Admin'}
          </button>
          
          <button
            onClick={() => handleRoleLogin("user")}
            disabled={isLoggingIn}
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '15px 25px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoggingIn ? 'not-allowed' : 'pointer',
              opacity: isLoggingIn ? 0.7 : 1
            }}
          >
            {isLoggingIn ? 'Logging in...' : 'Login as User'}
          </button>
          
          <button
            onClick={() => handleRoleLogin("contractor")}
            disabled={isLoggingIn}
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '15px 25px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoggingIn ? 'not-allowed' : 'pointer',
              opacity: isLoggingIn ? 0.7 : 1
            }}
          >
            {isLoggingIn ? 'Logging in...' : 'Login as Contractor'}
          </button>
        </div>
        
        <p style={{ 
          marginTop: '20px', 
          fontSize: '14px', 
          opacity: 0.7,
          lineHeight: '1.5'
        }}>
          🔒 Secure Google Authentication<br/>
          🏠 Home Maintenance Management<br/>
          👥 Multi-role Access Control
        </p>
      </div>
    </div>
  );
}

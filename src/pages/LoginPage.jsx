// src/pages/LoginPage.jsx

import { useState } from "react";
import { useAuth } from "../components/AuthContext";
import ContractorCategorySelector from "../components/ContractorCategorySelector";
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const { login } = useAuth();
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
          // User is an existing contractor, just let AuthContext handle the rest
          console.log("Existing contractor found, waiting for auth state update");
          // Don't call login again, the auth state change will handle it
        } else {
          // New contractor, show category selector
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded border shadow-lg p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            🛠️ AI Maintenance System
          </h1>
          <p className="text-gray-600">
            Smart maintenance management for your community
          </p>
        </div>

        {/* Login Options */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-center text-gray-700 mb-4">
            Choose Your Role
          </h2>

          {/* User Login */}
          <button
            onClick={() => handleRoleLogin("user")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded transition-colors flex items-center justify-center gap-3"
          >
            <span className="text-xl">👤</span>
            <div className="text-left">
              <div className="font-semibold">User Login</div>
              <div className="text-sm opacity-90">Report and track issues</div>
            </div>
          </button>

          {/* Admin Login */}
          <button
            onClick={() => handleRoleLogin("admin")}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded transition-colors flex items-center justify-center gap-3"
          >
            <span className="text-xl">👑</span>
            <div className="text-left">
              <div className="font-semibold">Admin Login</div>
              <div className="text-sm opacity-90">
                Manage users and oversee system
              </div>
            </div>
          </button>

          {/* Contractor Login */}
          <button
            onClick={() => handleRoleLogin("contractor")}
            disabled={isCheckingContractor}
            className={`w-full font-medium py-3 px-4 rounded transition-colors flex items-center justify-center gap-3 ${isCheckingContractor
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
              }`}
          >
            <span className="text-xl">👷</span>
            <div className="text-left">
              <div className="font-semibold">
                {isCheckingContractor ? "Checking..." : "Contractor Login"}
              </div>
              <div className="text-sm opacity-90">
                {isCheckingContractor
                  ? "Verifying your status..."
                  : "Handle assigned maintenance tasks"}
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Sign in with your Google account to get started
          </p>
          <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-400">
            <span>🔒</span>
            <span>Secure authentication via Google</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/pages/LoginPage.jsx

import { useState } from "react";
import { useAuth } from "../components/AuthContext";
import ContractorCategorySelector from "../components/ContractorCategorySelector";

export default function LoginPage() {
  const { login } = useAuth();
  const [attemptedRole, setAttemptedRole] = useState(null);
  const [showContractorSelector, setShowContractorSelector] = useState(false);

  const handleRoleLogin = async (role) => {
    setAttemptedRole(role);

    if (role === "contractor") {
      setShowContractorSelector(true);
      return;
    }

    try {
      await login(role);
    } catch (error) {
      console.error("Login failed:", error);
      setAttemptedRole(null);
    }
  };

  const handleContractorCategorySelect = async (categoryName, categoryId) => {
    try {
      await login("contractor", categoryName);
      setShowContractorSelector(false);
    } catch (error) {
      console.error("Contractor login failed:", error);
      setAttemptedRole(null);
      setShowContractorSelector(false);
    }
  };

  const handleContractorCancel = () => {
    setShowContractorSelector(false);
    setAttemptedRole(null);
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
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded transition-colors flex items-center justify-center gap-3"
          >
            <span className="text-xl">👷</span>
            <div className="text-left">
              <div className="font-semibold">Contractor Login</div>
              <div className="text-sm opacity-90">
                Handle assigned maintenance tasks
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

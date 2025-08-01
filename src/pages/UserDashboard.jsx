// src/pages/UserDashboard.jsx

import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext";
import UploadForm from "../components/UploadForm";
import IssueList from "../components/IssueList";
import QuickStats from "../components/QuickStats";
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                🛠️ AI Maintenance System
              </h1>
              <span className="text-xs md:text-sm bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-2 py-1 rounded-full font-medium border border-blue-300">
                User Dashboard
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              {user && (
                <span className="text-xs md:text-sm text-gray-600 truncate max-w-48">
                  Welcome, {user.displayName || user.email}
                </span>
              )}
              <button
                onClick={logout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-md text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        <QuickStats stats={stats} userType="user" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Form Section */}
          <div className="order-2 lg:order-1">
            <UploadForm />
          </div>

          {/* Issues List Section */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  📋 Your Issues
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    Track Status
                  </span>
                </h2>
              </div>
              <div className="p-4">
                <IssueList />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

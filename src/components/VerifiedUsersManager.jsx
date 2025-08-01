// src/components/VerifiedUsersManager.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

export default function VerifiedUsersManager() {
  const [verifiedUsers, setVerifiedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to approved users in real-time
    const q = query(
      collection(db, "approvedUsers"),
      where("status", "==", "approved")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by approval date (most recent first)
      users.sort((a, b) => {
        const dateA = a.approvedAt?.toDate() || new Date(0);
        const dateB = b.approvedAt?.toDate() || new Date(0);
        return dateB - dateA;
      });

      setVerifiedUsers(users);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleDeleteUser = async (user) => {
    if (
      !window.confirm(
        `Are you sure you want to delete user "${user.email}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      // Delete from approvedUsers collection
      await deleteDoc(doc(db, "approvedUsers", user.uid));

      // Also try to delete from pendingApprovals if it exists
      try {
        await deleteDoc(doc(db, "pendingApprovals", user.uid));
      } catch (error) {
        // It's okay if this fails - the user might not be in pending approvals
        console.log("User not in pending approvals (this is normal)");
      }

      console.log(`User ${user.email} deleted successfully`);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="bg-white border rounded p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">✅ Verified Users</h3>
        <p className="text-gray-500">Loading verified users...</p>
      </div>
    );
  }

  if (verifiedUsers.length === 0) {
    return (
      <div className="bg-white border rounded p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">✅ Verified Users</h3>
        <p className="text-gray-500">No verified users yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4">
        ✅ Verified Users ({verifiedUsers.length})
      </h3>

      <div className="space-y-3">
        {verifiedUsers.map((user) => (
          <div key={user.id} className="border rounded p-4 bg-green-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{user.displayName || "No name"}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>
                      Joined:{" "}
                      {user.joinedAt?.toDate().toLocaleDateString() ||
                        "Unknown"}
                    </p>
                    <p>
                      Approved:{" "}
                      {user.approvedAt?.toDate().toLocaleDateString() ||
                        "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                  ✓ Approved
                </span>
                <button
                  onClick={() => handleDeleteUser(user)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                  title="Delete user"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

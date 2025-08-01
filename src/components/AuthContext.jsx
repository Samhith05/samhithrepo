// src/components/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";

// Add this at the top or in a config file
const ADMIN_EMAILS = [
  "aenreddy.souchithreddy@gmail.com",
  "samhithbade44@gmail.com",
  "siddharthpaladugula@gmail.com",
];

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userStatus, setUserStatus] = useState("loading"); // "loading", "approved", "pending", "denied"
  const [attemptedRole, setAttemptedRole] = useState(null);
  const [roleError, setRoleError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await checkUserStatus(firebaseUser);
        // Check role access after user is authenticated
        checkRoleAccess(firebaseUser);
      } else {
        setUser(null);
        setUserStatus("loading");
        setAttemptedRole(null);
        setRoleError(null);
      }
    });
    return () => unsub();
  }, [attemptedRole]);

  const checkUserStatus = async (firebaseUser) => {
    try {
      // Check if user is an admin first - admins get automatic approval
      if (ADMIN_EMAILS.includes(firebaseUser.email)) {
        setUserStatus("approved");
        return;
      }

      // Check if user is in approved users collection
      const userDoc = await getDoc(doc(db, "approvedUsers", firebaseUser.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.status === "approved") {
          setUserStatus("approved");
        } else if (userData.status === "denied") {
          setUserStatus("denied");
        }
      } else {
        // User not in approved users, check if already has pending request
        const pendingDoc = await getDoc(
          doc(db, "pendingApprovals", firebaseUser.uid)
        );

        if (pendingDoc.exists()) {
          setUserStatus("pending");
        } else {
          // Create new approval request
          await createApprovalRequest(firebaseUser);
          setUserStatus("pending");
        }
      }
    } catch (error) {
      console.error("Error checking user status:", error);
      setUserStatus("pending");
    }
  };

  const checkRoleAccess = (firebaseUser) => {
    if (!attemptedRole) return;

    const isUserAdmin = ADMIN_EMAILS.includes(firebaseUser.email);

    if (attemptedRole === "admin" && !isUserAdmin) {
      setRoleError({
        type: "admin_access_denied",
        message:
          "Access Denied: You do not have administrator privileges. Please contact an administrator if you believe this is an error.",
      });
    } else {
      // Clear any previous errors if access is valid
      setRoleError(null);
    }

    // Clear attempted role after checking
    setAttemptedRole(null);
  };

  const createApprovalRequest = async (firebaseUser) => {
    try {
      // Add to pending approvals collection
      await setDoc(doc(db, "pendingApprovals", firebaseUser.uid), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || "",
        photoURL: firebaseUser.photoURL || "",
        requestedAt: Timestamp.now(),
        status: "waiting_approval",
      });

      // Also add to approval requests for admin notifications
      await addDoc(collection(db, "approvalRequests"), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || "",
        photoURL: firebaseUser.photoURL || "",
        requestedAt: Timestamp.now(),
        status: "waiting_approval",
      });
    } catch (error) {
      console.error("Error creating approval request:", error);
    }
  };

  const login = (role = null) => {
    setAttemptedRole(role);
    setRoleError(null);
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = () => {
    setRoleError(null);
    setAttemptedRole(null);
    return signOut(auth);
  };

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);
  const isApprovedUser = userStatus === "approved" || isAdmin;
  const isPendingApproval = userStatus === "pending" && !isAdmin;
  const isDeniedUser = userStatus === "denied" && !isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin,
        isApprovedUser,
        isPendingApproval,
        isDeniedUser,
        userStatus,
        roleError,
        clearRoleError: () => setRoleError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

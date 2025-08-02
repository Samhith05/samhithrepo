// SIMPLIFIED AUTH CONTEXT - EMERGENCY FIX
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";

const ADMIN_EMAILS = [
  "aenreddy.souchithreddy@gmail.com",
  "samhithbade44@gmail.com",
  "siddharthpaladugula@gmail.com",
];

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userStatus, setUserStatus] = useState("loading");
  const [userRole, setUserRole] = useState(null);
  const [roleError, setRoleError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("🔥 Auth state changed:", firebaseUser?.email || "No user");

      if (firebaseUser) {
        setUser(firebaseUser);
        await checkUserStatus(firebaseUser);
      } else {
        setUser(null);
        setUserStatus("unauthenticated");
        setUserRole(null);
        setRoleError(null);
      }
    });
    return () => unsub();
  }, []);

  const checkUserStatus = async (firebaseUser) => {
    try {
      console.log("🔍 Checking user status for:", firebaseUser.email);

      // Admin check
      if (ADMIN_EMAILS.includes(firebaseUser.email)) {
        console.log("✅ Admin user detected");
        setUserStatus("approved");
        setUserRole("admin");
        setRoleError(null);
        return;
      }

      // Check if user exists in approved users
      const userDoc = await getDoc(doc(db, "approvedUsers", firebaseUser.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("✅ User found in approved users:", userData);
        setUserStatus("approved");
        setUserRole(userData.role || "user");
        setRoleError(null);
        return;
      }

      // Check contractor approvals
      const contractorDoc = await getDoc(doc(db, "contractorApprovals", firebaseUser.uid));

      if (contractorDoc.exists()) {
        const contractorData = contractorDoc.data();
        console.log("✅ Contractor found:", contractorData);

        if (contractorData.status === "approved") {
          setUserStatus("approved");
          setUserRole("contractor");
          setRoleError(null);
          return;
        } else {
          setUserStatus("pending");
          setUserRole("contractor");
          setRoleError(null);
          return;
        }
      }

      // New user
      console.log("🆕 New user detected");
      setUserStatus("new");
      setUserRole(null);
      setRoleError(null);

    } catch (error) {
      console.error("❌ Error checking user status:", error);
      setUserStatus("new");
      setUserRole(null);
    }
  };

  const login = async (role) => {
    console.log("🔍 Login called with role:", role);
    setRoleError(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      // Admin role check
      if (role === "admin" && !ADMIN_EMAILS.includes(currentUser.email)) {
        setRoleError({
          type: "admin_access_denied",
          message: "Access Denied: You are not an administrator."
        });
        return;
      }

      // Admin trying user role
      if (role === "user" && ADMIN_EMAILS.includes(currentUser.email)) {
        setRoleError({
          type: "admin_role_conflict",
          message: "Access Denied: Administrators must use the Admin role."
        });
        return;
      }

      // For contractors, create application if new
      if (role === "contractor") {
        const contractorDoc = await getDoc(doc(db, "contractorApprovals", currentUser.uid));

        if (!contractorDoc.exists()) {
          // Create contractor application
          await setDoc(doc(db, "contractorApprovals", currentUser.uid), {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || "",
            photoURL: currentUser.photoURL || "",
            requestedAt: Timestamp.now(),
            status: "pending",
            role: "contractor",
            category: "general" // Default category
          });

          setUserStatus("pending");
          setUserRole("contractor");
          console.log("✅ Contractor application created");
          return;
        }
      }

      // For users, create approval request if new
      if (role === "user") {
        const userDoc = await getDoc(doc(db, "approvedUsers", currentUser.uid));

        if (!userDoc.exists()) {
          // Auto-approve regular users
          await setDoc(doc(db, "approvedUsers", currentUser.uid), {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || "",
            photoURL: currentUser.photoURL || "",
            approvedAt: Timestamp.now(),
            status: "approved",
            role: "user"
          });

          setUserStatus("approved");
          setUserRole("user");
          console.log("✅ User auto-approved");
          return;
        }
      }

    } catch (error) {
      console.error("❌ Login failed:", error);
      setRoleError({
        type: "login_error",
        message: "Login failed. Please try again."
      });
    }
  };

  const logout = () => {
    setRoleError(null);
    setUserRole(null);
    return signOut(auth);
  };

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);
  const isApprovedUser = userStatus === "approved" || isAdmin;
  const isContractor = userRole === "contractor" && isApprovedUser;
  const isPendingApproval = userStatus === "pending";

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin,
        isApprovedUser,
        isContractor,
        isPendingApproval,
        userStatus,
        userRole,
        roleError,
        clearRoleError: () => setRoleError(null),
        setRoleError: (error) => setRoleError(error),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

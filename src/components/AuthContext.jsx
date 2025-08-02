// SIMPLIFIED AUTH CONTEXT - EMERGENCY FIX
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

const ADMIN_EMAILS = [
  "aenreddy.souchithreddy@gmail.com",
  "samhithbade44@gmail.com",
  "siddharthpaladugula@gmail.com",
];

// Pre-approved contractor emails with their categories
const PRE_APPROVED_CONTRACTORS = {
  "24071a6201@vnrvjiet.in": "Electricals",
  "24071a6237@vnrvjiet.in": "HVAC",
  "24071a6760@vnrvjiet.in": "Civil",
  "24071A6210@vnrvjiet.in": "Plumbing",
  "24071a6747@vnrvjiet.in": "Common Area Maintenance"
};

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userStatus, setUserStatus] = useState("loading");
  const [userRole, setUserRole] = useState(null);
  const [contractorCategory, setContractorCategory] = useState(null);
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

      // Check if user is a pre-approved contractor
      if (PRE_APPROVED_CONTRACTORS[firebaseUser.email]) {
        console.log("🔧 Pre-approved contractor detected:", firebaseUser.email);
        const category = PRE_APPROVED_CONTRACTORS[firebaseUser.email];
        console.log("🔧 Category assigned:", category);

        // Create or update user in contractorApprovals collection
        try {
          await setDoc(doc(db, "contractorApprovals", firebaseUser.uid), {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            category: category,
            status: "approved",
            createdAt: new Date(),
            isPreApproved: true
          }, { merge: true });

          console.log("✅ Pre-approved contractor saved to database");
        } catch (error) {
          console.error("Error saving pre-approved contractor:", error);
        }

        setUserStatus("approved");
        setUserRole("contractor");
        setContractorCategory(category);
        console.log("✅ Pre-approved contractor approved");
        return;
      }

      // Check if user is in approved users collection
      const userDoc = await getDoc(doc(db, "approvedUsers", firebaseUser.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("✅ User found in approved users:", userData);
        setUserStatus("approved");
        setUserRole(userData.role || "user");
        if (userData.role === "contractor") {
          setContractorCategory(userData.contractorCategory || userData.category);
        }
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
          setContractorCategory(contractorData.category || contractorData.contractorCategory);
          setRoleError(null);
          return;
        } else {
          setUserStatus("pending");
          setUserRole("contractor");
          setContractorCategory(contractorData.category || contractorData.contractorCategory);
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
      console.error("Error checking user status:", error);
      setUserStatus("pending");
    }
  };

  const createApprovalRequest = async (
    firebaseUser,
    role = "user",
    contractorCategory = null
  ) => {
    try {
      const requestData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || "",
        photoURL: firebaseUser.photoURL || "",
        requestedAt: Timestamp.now(),
        status: "waiting_approval",
        role: role,
        contractorCategory: contractorCategory,
      };

      if (role === "contractor") {
        // Add to contractor approvals collection
        await setDoc(
          doc(db, "contractorApprovals", firebaseUser.uid),
          requestData
        );

        // Also add to approval requests for admin notifications
        await addDoc(collection(db, "contractorRequests"), requestData);
      } else {
        // Add to pending approvals collection
        await setDoc(
          doc(db, "pendingApprovals", firebaseUser.uid),
          requestData
        );

        // Also add to approval requests for admin notifications
        await addDoc(collection(db, "approvalRequests"), requestData);
      }
    } catch (error) {
      console.error("Error creating approval request:", error);
    }
  };

  const login = async (role = null, contractorCategory = null, alreadyAuthenticated = false) => {
    console.log("🔍 AuthContext Login called with role:", role);
    setRoleError(null);

    try {
      let result;

      if (alreadyAuthenticated) {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("No authenticated user found");
        }
        result = { user: currentUser };
      } else {
        const provider = new GoogleAuthProvider();
        result = await signInWithPopup(auth, provider);
      }

      // Admin role check
      if (role === "admin" && !ADMIN_EMAILS.includes(result.user.email)) {
        setRoleError({
          type: "admin_access_denied",
          message: "Access Denied: You are not an administrator."
        });
        return;
      }

      // Admin trying user role
      if (role === "user" && ADMIN_EMAILS.includes(result.user.email)) {
        setRoleError({
          type: "admin_role_conflict",
          message: "Access Denied: Administrators must use the Admin role."
        });
        return;
      }

      // For contractors, create application if new
      if (role === "contractor") {
        const contractorDoc = await getDoc(doc(db, "contractorApprovals", result.user.uid));

        if (!contractorDoc.exists()) {
          await createApprovalRequest(result.user, role, contractorCategory);
          setUserStatus("pending");
          setUserRole("contractor");
          setContractorCategory(contractorCategory);
          console.log("✅ Contractor application created");
          return result;
        }
      }

      // For users, auto-approve
      if (role === "user") {
        const userDoc = await getDoc(doc(db, "approvedUsers", result.user.uid));

        if (!userDoc.exists()) {
          await setDoc(doc(db, "approvedUsers", result.user.uid), {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName || "",
            photoURL: result.user.photoURL || "",
            approvedAt: Timestamp.now(),
            status: "approved",
            role: "user"
          });

          setUserStatus("approved");
          setUserRole("user");
          console.log("✅ User auto-approved");
        }
      }

      return result;
    } catch (error) {
      console.error("❌ Login failed:", error);
      setRoleError({
        type: "login_error",
        message: "Login failed. Please try again."
      });
      throw error;
    }
  };

  const logout = () => {
    setRoleError(null);
    setUserRole(null);
    setContractorCategory(null);
    return signOut(auth);
  };

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);
  const isApprovedUser = userStatus === "approved" || isAdmin;
  const isContractor = userRole === "contractor" && isApprovedUser;
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
        isContractor,
        isPendingApproval,
        isDeniedUser,
        userStatus,
        userRole,
        contractorCategory,
        roleError,
        clearRoleError: () => setRoleError(null),
        setRoleError: (error) => setRoleError(error),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

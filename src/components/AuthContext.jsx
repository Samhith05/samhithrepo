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
  const [userStatus, setUserStatus] = useState("loading"); // "loading", "approved", "pending", "denied", "new"
  const [userRole, setUserRole] = useState(null); // "user", "contractor", "admin"
  const [contractorCategory, setContractorCategory] = useState(null);
  const [attemptedRole, setAttemptedRole] = useState(null);
  const [roleError, setRoleError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("🔥 Auth state changed:", firebaseUser?.email || "No user");

      // Clear any problematic sessionStorage flags that might be blocking auth
      sessionStorage.removeItem('contractorAuthInProgress');

      if (firebaseUser) {
        setUser(firebaseUser);
        // Clear any existing role errors immediately when user authenticates
        setRoleError(null);
        await checkUserStatus(firebaseUser);
      } else {
        // No authenticated user - reset all states
        console.log("No authenticated user, resetting states");
        setUser(null);
        setUserStatus("unauthenticated"); // Set to unauthenticated instead of loading
        setUserRole(null);
        setContractorCategory(null);
        setAttemptedRole(null);
        setRoleError(null);
      }
    });
    return () => unsub();
  }, []);

  const checkUserStatus = async (firebaseUser) => {
    try {
      console.log("🔍 checkUserStatus starting for:", firebaseUser.email);

      // Clear any existing role errors when checking user status
      setRoleError(null);

      // Check if user is an admin first - admins get automatic approval
      if (ADMIN_EMAILS.includes(firebaseUser.email)) {
        console.log("🔑 Admin user detected:", firebaseUser.email);
        setUserStatus("approved");
        setUserRole("admin");
        return;
      }      // Check if user is in approved users collection
      const userDoc = await getDoc(doc(db, "approvedUsers", firebaseUser.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("📋 Found in approvedUsers:", userData);
        if (userData.status === "approved") {
          setUserStatus("approved");
          setUserRole(userData.role || "user");
          const category = userData.contractorCategory || null;
          console.log("🔍 AuthContext: Setting approved user contractor category:", category, "from userData:", userData);
          setContractorCategory(category);
          // Clear any role errors for approved users
          setRoleError(null);
          console.log("✅ User approved with role:", userData.role);
        } else if (userData.status === "denied") {
          console.log("❌ User denied");
          setUserStatus("denied");
          setUserRole(null);
          setContractorCategory(null);
        }
      } else {
        // Check if user is in contractor approvals
        const contractorDoc = await getDoc(
          doc(db, "contractorApprovals", firebaseUser.uid)
        );

        if (contractorDoc.exists()) {
          const contractorData = contractorDoc.data();
          console.log("🏗️ Found in contractorApprovals:", contractorData);
          if (contractorData.status === "approved") {
            console.log("✅ Contractor approved!");
            setUserStatus("approved");
            setUserRole("contractor");
            const category = contractorData.category || contractorData.contractorCategory;
            console.log("🔍 AuthContext: Setting contractor category:", category, "from data:", contractorData);
            setContractorCategory(category);
            // Clear any role errors for approved contractors
            setRoleError(null);

            // Move to approved users collection
            await setDoc(doc(db, "approvedUsers", firebaseUser.uid), {
              ...contractorData,
              role: "contractor",
              contractorCategory: category,
              status: "approved",
            });
          } else if (contractorData.status === "denied") {
            console.log("❌ Contractor denied");
            setUserStatus("denied");
            setUserRole(null);
            setContractorCategory(null);
          } else {
            console.log("⏳ Contractor pending approval");
            setUserStatus("pending");
            setUserRole("contractor");
            const category = contractorData.category || contractorData.contractorCategory;
            console.log("🔍 AuthContext: Setting pending contractor category:", category, "from data:", contractorData);
            setContractorCategory(category);
          }
          return;
        }

        // User not in approved users or contractor approvals, check if already has pending request
        const pendingDoc = await getDoc(
          doc(db, "pendingApprovals", firebaseUser.uid)
        );

        if (pendingDoc.exists()) {
          const pendingData = pendingDoc.data();
          setUserStatus("pending");
          setUserRole(pendingData.role || "user");
          setContractorCategory(pendingData.contractorCategory || null);
        } else {
          // No existing requests - this is a new user, set status to indicate they need to choose a role
          setUserStatus("new");
          setUserRole(null);
          setContractorCategory(null);
        }
      }
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

  const checkExistingUserStatus = async (firebaseUser, role) => {
    try {
      // Check if user is already in approved users
      const approvedDoc = await getDoc(
        doc(db, "approvedUsers", firebaseUser.uid)
      );
      if (approvedDoc.exists()) {
        console.log("User already exists in approved users");
        return true;
      }

      // Check if user has pending approval
      const pendingDoc = await getDoc(
        doc(db, "pendingApprovals", firebaseUser.uid)
      );
      if (pendingDoc.exists()) {
        console.log("User already has pending approval");
        return true;
      }

      // For contractors, also check contractor-specific collections
      if (role === "contractor") {
        const contractorDoc = await getDoc(
          doc(db, "contractorApprovals", firebaseUser.uid)
        );
        if (contractorDoc.exists()) {
          console.log("Contractor already exists in contractor approvals");
          return true;
        }
      }

      console.log("User is new, needs approval request");
      return false;
    } catch (error) {
      console.error("Error checking existing user status:", error);
      return false;
    }
  };

  const login = async (role = null, contractorCategory = null, alreadyAuthenticated = false) => {
    console.log(
      "🔍 AuthContext Login called with role:",
      role,
      "contractorCategory:",
      contractorCategory,
      "alreadyAuthenticated:",
      alreadyAuthenticated
    );
    setRoleError(null);

    try {
      let result;

      if (alreadyAuthenticated) {
        // User is already authenticated, just get the current user
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("No authenticated user found");
        }
        result = { user: currentUser };
      } else {
        // Normal authentication flow
        const provider = new GoogleAuthProvider();
        result = await signInWithPopup(auth, provider);
      }

      // Check role access immediately after successful login
      if (role && result.user) {
        console.log("Checking role access after login");
        const isRoleValid = await checkRoleAccessSync(
          result.user,
          role,
          contractorCategory
        );

        if (!isRoleValid) {
          // Role validation failed, but don't throw error
          // Just set error state and return a special result
          console.log("Role validation failed, staying authenticated but showing error");
          return { ...result, roleValidationFailed: true };
        }

        if (isRoleValid && (role === "user" || role === "contractor")) {
          // Check if user already exists in the system
          const existingApproval = await checkExistingUserStatus(
            result.user,
            role
          );

          if (!existingApproval) {
            // Only create approval request for new users
            await createApprovalRequest(result.user, role, contractorCategory);
            setUserStatus("pending");
            setUserRole(role);
            setContractorCategory(contractorCategory);
          }
          // If user exists, checkUserStatus will be called by the auth state change listener
        }
      }

      return result;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const checkRoleAccessSync = (
    firebaseUser,
    role,
    contractorCategory = null
  ) => {
    console.log("checkRoleAccessSync called with:", {
      role,
      contractorCategory,
      userEmail: firebaseUser.email,
      isUserAdmin: ADMIN_EMAILS.includes(firebaseUser.email),
    });

    const isUserAdmin = ADMIN_EMAILS.includes(firebaseUser.email);

    // For contractor role, skip all validation - contractor auth is handled separately
    if (role === "contractor") {
      console.log("Contractor role detected, skipping validation");
      setRoleError(null);
      return true;
    }

    // Check if non-admin tries to access admin role
    if (role === "admin" && !isUserAdmin) {
      console.log("Setting role error for non-admin trying admin access");
      setRoleError({
        type: "admin_access_denied",
        message:
          "Access Denied: You do not have administrator privileges. Please contact an administrator if you believe this is an error.",
      });
      return false;
    }

    // Check if admin tries to access user role
    if (role === "user" && isUserAdmin) {
      console.log("Setting role error for admin trying user access");
      setRoleError({
        type: "admin_role_conflict",
        message:
          "Access Denied: You have administrator privileges and cannot access the system as a regular user. Please select 'Admin' role to continue.",
      });
      return false;
    }

    console.log("Access granted or no error");
    setRoleError(null);

    return true;
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

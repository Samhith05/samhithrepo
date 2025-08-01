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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await checkUserStatus(firebaseUser);
      } else {
        setUser(null);
        setUserStatus("loading");
      }
    });
    return () => unsub();
  }, []);

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

  const login = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = () => signOut(auth);

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Removed all imports temporarily to test basic rendering
// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import UploadForm from "./components/UploadForm";
// import IssueList from "./components/IssueList";
// import AdminDashboard from "./pages/AdminDashboard";

function App() {
  console.log("App component is rendering");

  return (
    <div style={{ backgroundColor: "lightgray", minHeight: "100vh" }}>
      {/* TEST: Simple HTML without Router first */}
      <div
        style={{
          backgroundColor: "red",
          color: "white",
          padding: "20px",
          fontSize: "24px",
          textAlign: "center",
        }}
      >
        NAVIGATION TEST - Can you see this red bar?
      </div>

      {/* Simple navigation without Router first */}
      <div
        style={{
          backgroundColor: "blue",
          color: "white",
          padding: "20px",
          fontSize: "18px",
        }}
      >
        <a href="/" style={{ color: "white", marginRight: "20px" }}>
          User View
        </a>
        <a href="/admin" style={{ color: "yellow" }}>
          Admin Dashboard
        </a>
      </div>

      <h1
        style={{
          textAlign: "center",
          fontSize: "32px",
          fontWeight: "bold",
          padding: "20px",
        }}
      >
        AI Maintenance System
      </h1>

      <div
        style={{
          backgroundColor: "green",
          color: "white",
          padding: "20px",
          textAlign: "center",
        }}
      >
        TEST: If you see this green bar, the App component is working
      </div>
    </div>
  );
}

export default App;

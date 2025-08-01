// src/App.js
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import UploadForm from "./components/UploadForm";
import IssueList from "./components/IssueList";
import AdminDashboard from "./pages/AdminDashboard";
import ContractorDashboard from "./pages/ContractorDashboard";

// Inside <Routes>


function App() {
  return (
    <Router>
      <div style={{ backgroundColor: "lightgray", minHeight: "100vh" }}>
        {/* Navigation Bar */}
        <nav
          style={{
            backgroundColor: "white",
            padding: "16px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            marginBottom: "16px",
            display: "flex",
            gap: "16px",
          }}
        >
          <Link
            to="/"
            style={{
              color: "#2563eb",
              fontWeight: "500",
              textDecoration: "none",
              fontSize: "16px",
            }}
          >
            User View
          </Link>
          <Link
            to="/admin"
            style={{
              color: "#2563eb",
              fontWeight: "500",
              textDecoration: "none",
              fontSize: "16px",
            }}
          >
            Admin Dashboard
          </Link>
          <Link to="/contractor" className="text-blue-600 font-medium">
            Contractor View
          </Link>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <>
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
                <UploadForm />
                <IssueList />
              </>
            }
          />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/contractor" element={<ContractorDashboard />} />;
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import { useAuth } from "./components/AuthContext";

function App() {
  const { user, login, logout } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="flex justify-between items-center p-4 bg-white shadow mb-4">
          <div className="flex gap-4">
            <Link to="/" className="text-blue-600 font-medium">
              User View
            </Link>
            <Link to="/admin" className="text-blue-600 font-medium">
              Admin
            </Link>
            <Link to="/contractor" className="text-blue-600 font-medium">
              Contractor
            </Link>
          </div>

          <div>
            {user ? (
              <>
                <span className="text-gray-700 mr-2">
                  Hi, {user.displayName}
                </span>
                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={login}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Login with Google
              </button>
            )}
          </div>
        </nav>

        {/* Routes here */}
      </div>
    </Router>
  );
}

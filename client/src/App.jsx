import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? <Navigate to="/dashboard" replace /> : children;
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/" replace />;
}

function App() {

  return (
    <Routes>

      {/* LOGIN */}
      <Route
        path="/"
        element={<PublicRoute><Login /></PublicRoute>}
      />

      {/* SIGNUP */}
      <Route
        path="/signup"
        element={<Signup />}
      />

      {/* DASHBOARD */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />

    </Routes>
  );
}

export default App;

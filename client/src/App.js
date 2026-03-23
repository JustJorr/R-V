import { useEffect, useState } from "react";
import "./App.css";
import Login from "./Login";
import ManagerDashboard from "./ManagerDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Route based on user role
  if (user.role === "manager") {
    return <ManagerDashboard user={user} onLogout={handleLogout} />;
  } else if (user.role === "admin") {
    return <div>Admin Dashboard - Coming Soon</div>;
  } else {
    return <div>Worker Dashboard - Coming Soon</div>;
  }
}

export default App;

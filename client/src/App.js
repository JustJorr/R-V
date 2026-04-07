import { useEffect, useState } from "react";
import "./styles/App.css";
import LoginPage from "./pages/LoginPage";
import ManagerLayout from "./components/ManagerLayout";
import WorkerLayout from "./components/WorkerLayout"; // ✅ ADD THIS
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    return <LoginPage onLogin={handleLogin} />;
  }

  if (user.role === "manager") {
    return <ManagerLayout user={user} onLogout={handleLogout} />;
  } else if (user.role === "admin") {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  } else {
    return <WorkerLayout user={user} onLogout={handleLogout} />;
  }
}

export default App;
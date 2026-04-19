import { useEffect, useState } from "react";
import "./styles/App.css";
import LoginPage from "./pages/LoginPage";
import ManagerLayout from "./components/ManagerLayout";
import WorkerLayout from "./components/WorkerLayout"; // ✅ ADD THIS
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [worker, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("worker");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("worker");
    setUser(null);
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!worker) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (worker.role === "manager") {
    return <ManagerLayout worker={worker} onLogout={handleLogout} />;
  } else if (worker.role === "admin") {
    return <AdminDashboard worker={worker} onLogout={handleLogout} />;
  } else {
    return <WorkerLayout worker={worker} onLogout={handleLogout} />;
  }
}

export default App;
import { useEffect, useState } from "react";
import "./styles/App.css";
import LoginPage from "./pages/LoginPage";
import SupervisorLayout from "./components/SupervisorLayout";
import WorkerLayout from "./components/WorkerLayout";
import AdminLayout from "./components/AdminLayout";

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

  if (worker.role === "supervisor") {
    return <SupervisorLayout worker={worker} onLogout={handleLogout} />;
  } else if (worker.role === "admin") {
    return <AdminLayout worker={worker} onLogout={handleLogout} />; // ✅ FIXED
  } else {
    return <WorkerLayout worker={worker} onLogout={handleLogout} />;
  }
}

export default App;
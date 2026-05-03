import { useEffect, useState } from "react";
import { adminService } from "../../services/api";

function AdminHome() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await adminService.getDashboard();
    setStats(res.data);
  };

  if (!stats) return <div className="loading">Loading...</div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>System overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers}</p>
        </div>

        <div className="stat-card success">
          <h3>Supervisors</h3>
          <p className="stat-number">{stats.supervisors}</p>
        </div>

        <div className="stat-card warning">
          <h3>Workers</h3>
          <p className="stat-number">{stats.workers}</p>
        </div>

        <div className="stat-card">
          <h3>Avg Rating</h3>
          <p className="stat-number">{stats.avgRating.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;
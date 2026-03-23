import { useState, useEffect } from "react";
import { managerService } from "../services/api";
import { getRatingColor, getRatingStatus } from "../utils/helpers";
import "../styles/ManagerDashboard.css";

function ManagerDashboard({ user, onLogout }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkers: 0,
    avgRating: 0,
    topWorker: null,
    bottomWorker: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await managerService.getDashboard();
      setWorkers(response.data);
      
      // Calculate stats
      if (response.data.length > 0) {
        const totalRating = response.data.reduce((sum, w) => sum + w.averageRating, 0);
        const avgRating = (totalRating / response.data.length).toFixed(2);
        const topWorker = response.data[0];
        const bottomWorker = response.data[response.data.length - 1];
        
        setStats({
          totalWorkers: response.data.length,
          avgRating,
          topWorker,
          bottomWorker
        });
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manager-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Manager Dashboard</h1>
          <p>Welcome, {user.name}</p>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Workers</h3>
          <p className="stat-number">{stats.totalWorkers}</p>
        </div>
        <div className="stat-card">
          <h3>Average Rating</h3>
          <p className="stat-number" style={{ color: getRatingColor(stats.avgRating) }}>
            {stats.avgRating}★
          </p>
        </div>
        <div className="stat-card">
          <h3>Top Performer</h3>
          <p className="stat-text">
            {stats.topWorker ? `${stats.topWorker.name}` : "N/A"}
          </p>
          {stats.topWorker && (
            <p className="stat-rating">{stats.topWorker.averageRating}★</p>
          )}
        </div>
        <div className="stat-card">
          <h3>Needs Support</h3>
          <p className="stat-text">
            {stats.bottomWorker && stats.bottomWorker.averageRating > 0 ? `${stats.bottomWorker.name}` : "N/A"}
          </p>
          {stats.bottomWorker && stats.bottomWorker.averageRating > 0 && (
            <p className="stat-rating">{stats.bottomWorker.averageRating}★</p>
          )}
        </div>
      </div>

      {/* Workers Table */}
      <div className="workers-section">
        <h2>Workers Overview</h2>
        
        {loading ? (
          <div className="loading">Loading workers...</div>
        ) : workers.length === 0 ? (
          <div className="no-data">No workers found in the system.</div>
        ) : (
          <div className="table-container">
            <table className="workers-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Average Rating</th>
                  <th>Total Ratings</th>
                  <th>Status</th>
                  <th>Latest Rating</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker, index) => (
                  <tr key={worker._id}>
                    <td>{index + 1}</td>
                    <td className="worker-name">{worker.name}</td>
                    <td className="worker-email">{worker.email}</td>
                    <td>
                      <span className="rating-badge" style={{ backgroundColor: getRatingColor(worker.averageRating) }}>
                        {worker.totalRatings > 0 ? worker.averageRating.toFixed(1) : "—"}★
                      </span>
                    </td>
                    <td className="center">{worker.totalRatings}</td>
                    <td className="center">
                      <span className="status-badge">
                        {getRatingStatus(worker.averageRating)}
                      </span>
                    </td>
                    <td className="latest-rating">
                      {worker.latestRating ? (
                        <div>
                          <p className="rating-score">{worker.latestRating.score}★ by {worker.latestRating.ratedBy.name}</p>
                          <p className="rating-time">
                            {new Date(worker.latestRating.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <span>No ratings</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="info-section">
        <h3>System Information</h3>
        <div className="info-cards">
          <div className="info-card">
            <strong>Your Role:</strong> Manager
          </div>
          <div className="info-card">
            <strong>Login Time:</strong> {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;

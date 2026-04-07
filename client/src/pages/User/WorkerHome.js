import { useEffect, useState, useCallback } from "react";
import { usersService } from "../../services/api";
import RatingForm from "../../components/RatingForm";
import "../../styles/User/WorkerDashboard.css";

function WorkerHome({ user }) {
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const getRatingColor = (rating) => {
    if (rating >= 4) return "#4caf50";
    if (rating >= 3) return "#2196f3";
    return "#ff9800";
  };

  const fetchWorkers = useCallback(async () => {
    try {
      const res = await usersService.getAllUsers();
      
      const filtered = res.data.filter(
        (u) => u.role === "worker" && u._id !== user._id
      );
      
      setWorkers(filtered);
    } catch (err) {
      console.error(err);
    }
  }, [user._id]);
  
  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);
  
  return (
    <div className="page-content worker-dashboard">
      {/* HEADER */}
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, <strong>{user.name}</strong> 👋</p>
      </div>

      {/* ===== STATS ===== */}
      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>Average Rating</h3>
            <p
              className="stat-number"
              style={{ color: getRatingColor(user.averageRating) }}
            >
              {user.averageRating ? user.averageRating.toFixed(1) : "N/A"}
            </p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Total Reviews</h3>
            <p className="stat-number">{user.totalRatings || 0}</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <h3>Feedback</h3>
            <p className="stat-number">{user.totalComments || 0}</p>
          </div>
        </div>
      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="dashboard-grid">

        {/* PROFILE */}
        <div className="recent-section">
          <h2>Profile Overview</h2>
          <div className="recent-item">
            <div className="recent-worker">
              <div className="worker-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="worker-details">
                <h4>{user.name}</h4>
                <p className="worker-email">{user.email}</p>
              </div>
            </div>
            <span className="field-badge">Worker</span>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="recent-section">
          <h2>Quick Actions</h2>
          <div className="actions-vertical">
            <button className="action-btn">⭐ Rate Colleagues</button>
            <button className="action-btn outline">📊 View My Ratings</button>
            <button className="action-btn outline">💬 Feedback</button>
          </div>
        </div>
      </div>

      {/* ===== 🔥 NEW: RATE COLLEAGUES SECTION ===== */}
      <div className="recent-section">
        <h2>Rate Colleagues</h2>

        <div className="features-grid">
          {workers.map((worker) => (
            <div key={worker._id} className="feature-card">
              <h3>{worker.name}</h3>
              <p>{worker.email}</p>

              <button
                className="action-btn"
                onClick={() => setSelectedWorker(worker)}
              >
                ⭐ Rate
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {selectedWorker && (
        <RatingForm
          worker={selectedWorker}
          userId={user._id}
          onSuccess={() => {
            setSelectedWorker(null);
            fetchWorkers();
          }}
          onCancel={() => setSelectedWorker(null)}
        />
      )}
    </div>
  );
}

export default WorkerHome;
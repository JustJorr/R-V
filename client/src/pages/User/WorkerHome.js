import { useNavigate } from "react-router-dom";
import "../../styles/User/WorkerDashboard.css";

function WorkerHome({ worker }) {
  const navigate = useNavigate();

  const getRatingColor = (rating) => {
    if (rating >= 4) return "#4caf50";
    if (rating >= 3) return "#2196f3";
    return "#ff9800";
  };

  return (
    <div className="page-content worker-dashboard">
      
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>
          Welcome back, <strong>{worker.name}</strong> 👋
        </p>
      </div>

      {/* ===== STATS ===== */}
      <div className="stats-grid">
        
        <div className="stat-card success">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>Average Rating</h3>
            <p
              className="stat-number"
              style={{ color: getRatingColor(worker.averageRating) }}
            >
              {worker.averageRating
                ? worker.averageRating.toFixed(1)
                : "N/A"}
            </p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Total Reviews</h3>
            <p className="stat-number">
              {worker.totalRatings || 0}
            </p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <h3>Feedback</h3>
            <p className="stat-number">
              {worker.totalComments || 0}
            </p>
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
                {worker.name.charAt(0).toUpperCase()}
              </div>

              <div className="worker-details">
                <h4>{worker.name}</h4>
                <p className="worker-email">{worker.email}</p>
              </div>

            </div>

            <span className="field-badge">Worker</span>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="recent-section">
          <h2>Quick Actions</h2>

          <div className="actions-vertical">

            <button
              className="action-btn"
              onClick={() => navigate("/worker/ratings")}
            >
              ⭐ Rate Colleagues
            </button>

            <button
              className="action-btn outline"
              onClick={() => navigate("/worker/ratings")}
            >
              📊 View My Ratings
            </button>

            <button
              className="action-btn outline"
              onClick={() => navigate("/worker/feedback")}
            >
              💬 Feedback
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

export default WorkerHome;
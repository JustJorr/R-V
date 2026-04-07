import "../../styles/User/WorkerDashboard.css";

function WorkerHome({ user }) {
  // Helper for color coding ratings like the manager side
  const getRatingColor = (rating) => {
    if (rating >= 4) return "#4caf50"; // Success
    if (rating >= 3) return "#2196f3"; // Info
    return "#ff9800"; // Warning
  };

  return (
    <div className="page-content worker-dashboard">
      {/* HEADER */}
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, <strong>{user.name}</strong> 👋</p>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
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
            <h3>Feedback Received</h3>
            <p className="stat-number">{user.totalComments || 0}</p>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="dashboard-grid">
        
        {/* Profile Overview styled as a 'Recent Section' */}
        <div className="recent-section profile-overview">
          <h2>Profile Overview</h2>
          <div className="recent-list">
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
              <div className="recent-rating">
                <span className="field-badge">Role: Worker</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="recent-section quick-actions-card">
          <h2>Quick Actions</h2>
          <div className="actions-vertical">
            <button className="action-btn">⭐ Rate Colleagues</button>
            <button className="action-btn outline">📊 View My Ratings</button>
            <button className="action-btn outline">💬 View Feedback</button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default WorkerHome;
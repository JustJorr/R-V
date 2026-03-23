import "../styles/WorkerDashboard.css";

function WorkerDashboard({ user, onLogout }) {
  return (
    <div className="worker-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Worker Dashboard</h1>
          <p>Welcome, {user.name}</p>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="content">
        <div className="welcome-card">
          <h2>Welcome to Your Dashboard</h2>
          <p>Hello, {user.name}! 👋</p>
          <div className="info-box">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> Worker</p>
            <p><strong>Your Rating:</strong> {user.averageRating ? user.averageRating.toFixed(1) : "No ratings yet"} ★</p>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <h3>📊 View Ratings</h3>
            <p>See how you're being rated by managers and peers.</p>
          </div>
          <div className="feature-card">
            <h3>⭐ Rate Colleagues</h3>
            <p>Leave anonymous feedback for other workers.</p>
          </div>
          <div className="feature-card">
            <h3>📈 Track Progress</h3>
            <p>Monitor your performance metrics over time.</p>
          </div>
          <div className="feature-card">
            <h3>💬 Comments</h3>
            <p>Read feedback comments from evaluators.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkerDashboard;

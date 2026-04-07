import "../../styles/User/WorkerDashboard.css";

function WorkerHome({ user }) {
  return (
    <div className="worker-dashboard">

      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <p>Welcome, {user.name}</p>
        </div>
      </div>

      <div className="content">
        <div className="welcome-card">
          <h2>Welcome</h2>
          <p>Hello, {user.name}!</p>

          <div className="info-box">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> Worker</p>
            <p><strong>Your Rating:</strong> {user.averageRating ? user.averageRating.toFixed(1) : "No ratings yet"} ★</p>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <h3>📊 View Ratings</h3>
            <p>See your performance ratings.</p>
          </div>
          <div className="feature-card">
            <h3>⭐ Rate Colleagues</h3>
            <p>Give feedback to coworkers.</p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default WorkerHome;
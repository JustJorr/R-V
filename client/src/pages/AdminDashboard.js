import "../styles/AdminDashboard.css";

function AdminDashboard({ worker, onLogout }) {
  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p>Welcome, {worker.name}</p>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="content">
        <div className="admin-card">
          <h2>🛡️ Admin Controls</h2>
          <p>You have full authority over the system.</p>
          <div className="admin-features">
            <div className="admin-option">✓ Manage Users</div>
            <div className="admin-option">✓ View All Ratings</div>
            <div className="admin-option">✓ System Settings</div>
            <div className="admin-option">✓ Analytics & Reports</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

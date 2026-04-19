import "../../styles/Manager/ManagerNav.css";

function WorkerNav({ currentPage, onPageChange, userName, onLogout, collapsed, setCollapsed }) {
  const pages = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "ratings", label: "Rate Colleagues", icon: "⭐" },
    { id: "feedback", label: "Feedback", icon: "💬" },
    { id: "profile", label: "Profile", icon: "👤" }
  ];

  return (
    <nav className={`manager-nav ${collapsed ? "collapsed" : ""}`}>
      <div className="nav-container">

        <button 
          className="toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "»" : "«"}
        </button>

        <div className="nav-brand">
          <img src="/PGE_Logo.png" alt="Logo" className="nav-logo" />
        </div>

        <div className="nav-menu">
          <div className="nav-pages">
            {pages.map((page) => (
              <button
                key={page.id}
                className={`nav-item ${currentPage === page.id ? "active" : ""}`}
                onClick={() => onPageChange(page.id)}
                title={page.label}
              >
                <span className="nav-icon">{page.icon}</span>
                {!collapsed && (
                  <span className="nav-label">{page.label}</span>
                )}
              </button>
            ))}
          </div>

          <div className="nav-worker">
            <div className="worker-info">
              <div className="worker-avatar">
                {userName.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <span className="worker-name">{userName}</span>
              )}
            </div>

            {!collapsed && (
              <button className="logout-btn" onClick={onLogout}>
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default WorkerNav;
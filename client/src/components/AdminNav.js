function AdminNav({ currentPage, onPageChange, userName, onLogout, collapsed, setCollapsed }) {
  const pages = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "users", label: "Manage Users", icon: "👥" },
    { id: "data", label: "Data Tools", icon: "📂" },
    { id: "profile", label: "Profile", icon: "👤" }
  ];

  return (
    <nav className={`supervisor-nav ${collapsed ? "collapsed" : ""}`}>
      <div className="nav-container">

        <button
          className="toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
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
              >
                <span className="nav-icon">{page.icon}</span>
                {!collapsed && <span>{page.label}</span>}
              </button>
            ))}
          </div>

          <div className="nav-worker">
            <div className="worker-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>

            {!collapsed && (
              <>
                <span>{userName}</span>
                <button onClick={onLogout}>Logout</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default AdminNav;
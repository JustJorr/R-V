import "../styles/Manager/ManagerNav.css";

function ManagerNav({ currentPage, onPageChange, userName, onLogout, collapsed, setCollapsed }) {
  const pages = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "details", label: "Details", icon: "👥" },
    { id: "visuals", label: "Data Visuals", icon: "📊" },
    { id: "profile", label: "Profile", icon: "👤" }
  ];

  return (
    <nav className={`manager-nav ${collapsed ? "collapsed" : ""}`}>
      <div className="nav-container">

        {/* 🔥 Toggle button ATTACHED to sidebar */}
        <button 
          className="toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "»" : "«"}
        </button>

        {/* Logo */}
        <div className="nav-brand">
          <img src="/PGE_Logo.png" alt="Logo" className="nav-logo" />
        </div>

        {/* Menu */}
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

                {/* 👇 Hide text when collapsed */}
                {!collapsed && (
                  <span className="nav-label">{page.label}</span>
                )}
              </button>
            ))}
          </div>

          {/* User */}
          <div className="nav-user">
            <div className="user-info">
              <div className="user-avatar">
                {userName.charAt(0).toUpperCase()}
              </div>

              {!collapsed && (
                <span className="user-name">{userName}</span>
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

export default ManagerNav;
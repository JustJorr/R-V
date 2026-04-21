import "../styles/Supervisor/SupervisorNav.css";
import { useNavigate, useLocation } from "react-router-dom";

function SupervisorNav({
  userName,
  onLogout,
  collapsed,
  setCollapsed
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const pages = [
    { id: "home", label: "Home", icon: "🏠", path: "/" },
    { id: "details", label: "Details", icon: "👥", path: "/details" },
    { id: "visuals", label: "Data Visuals", icon: "📊", path: "/visuals" },
    { id: "profile", label: "Profile", icon: "👤", path: "/profile" }
  ];

  // detect active page from URL instead of state
  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.includes(path)) return true;
    return false;
  };

  return (
    <nav className={`supervisor-nav ${collapsed ? "collapsed" : ""}`}>
      <div className="nav-container">

        {/* Toggle */}
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
                className={`nav-item ${isActive(page.path) ? "active" : ""}`}
                onClick={() => navigate(page.path)}
                title={page.label}
              >
                <span className="nav-icon">{page.icon}</span>

                {!collapsed && (
                  <span className="nav-label">{page.label}</span>
                )}
              </button>
            ))}
          </div>

          {/* User Section */}
          <div className="nav-worker">
            <div className="worker-info">
              <div className="worker-avatar">
                {userName?.charAt(0)?.toUpperCase()}
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

export default SupervisorNav;
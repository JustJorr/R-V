import { useNavigate } from "react-router-dom";
import "../../styles/Supervisor/SupervisorNav.css";

function WorkerNav({ userName, onLogout, collapsed, setCollapsed }) {
  const navigate = useNavigate();

  const pages = [
    { id: "home", path: "/", label: "Home", icon: "🏠" },
    { id: "ratings", path: "/ratings", label: "Rate Colleagues", icon: "⭐" },
    { id: "feedback", path: "/feedback", label: "Feedback", icon: "💬" },
    { id: "profile", path: "/profile", label: "Profile", icon: "👤" }
  ];

  return (
    <nav className={`supervisor-nav ${collapsed ? "collapsed" : ""}`}>
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
                className="nav-item"
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

import { useNavigate } from "react-router-dom";
import "../../styles/Supervisor/SupervisorNav.css";
import { useLanguage } from "../../context/LanguageContext";

function WorkerNav({ userName, onLogout, collapsed, setCollapsed }) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const pages = [
    { id: "home", path: "/", label: t("workerNav.home"), icon: "\uD83C\uDFE0" },
    { id: "ratings", path: "/ratings", label: t("workerNav.rateColleagues"), icon: "\u2B50" },
    { id: "feedback", path: "/feedback", label: t("workerNav.feedback"), icon: "\uD83D\uDCAC" },
    { id: "profile", path: "/profile", label: t("workerNav.profile"), icon: "\uD83D\uDC64" }
  ];

  return (
    <nav className={`supervisor-nav ${collapsed ? "collapsed" : ""}`}>
      <div className="nav-container">
        <button
          className="toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? t("workerNav.expand") : t("workerNav.collapse")}
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
                {!collapsed && <span className="nav-label">{page.label}</span>}
              </button>
            ))}
          </div>

          <div className="nav-worker">
            <div className="worker-info">
              <div className="worker-avatar">{userName.charAt(0).toUpperCase()}</div>
              {!collapsed && <span className="worker-name">{userName}</span>}
            </div>

            {!collapsed && (
              <button className="logout-btn" onClick={onLogout}>
                {t("workerNav.logout")}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default WorkerNav;

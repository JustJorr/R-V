import { useState } from "react";
import "../styles/Manager/ManagerNav.css";

function ManagerNav({ currentPage, onPageChange, userName, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pages = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "details", label: "Details", icon: "👥" },
    { id: "visuals", label: "Data Visuals", icon: "📊" },
    { id: "profile", label: "Profile", icon: "👤" }
  ];

  return (
    <nav className="manager-nav">
      <div className="nav-container">
        <div className="nav-brand">
          <h2>NERM System</h2>
        </div>

        <button 
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>

        <div className={`nav-menu ${mobileMenuOpen ? "active" : ""}`}>
          <div className="nav-pages">
            {pages.map((page) => (
              <button
                key={page.id}
                className={`nav-item ${currentPage === page.id ? "active" : ""}`}
                onClick={() => {
                  onPageChange(page.id);
                  setMobileMenuOpen(false);
                }}
              >
                <span className="nav-icon">{page.icon}</span>
                <span className="nav-label">{page.label}</span>
              </button>
            ))}
          </div>

          <div className="nav-user">
            <div className="user-info">
              <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
              <span className="user-name">{userName}</span>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default ManagerNav;

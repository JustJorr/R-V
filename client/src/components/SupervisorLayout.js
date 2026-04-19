import { useState } from "react";
import SupervisorNav from "./SupervisorNav";
import SupervisorHome from "../pages/Supervisor/SupervisorHome";
import SupervisorDetails from "../pages/Supervisor/SupervisorDetails";
import SupervisorDataVisuals from "../pages/Supervisor/SupervisorDataVisuals";
import SupervisorProfile from "../pages/Supervisor/SupervisorProfile";
import "../styles/Supervisor/SupervisorLayout.css";

function SupervisorLayout({ worker, onLogout }) {
  const [currentPage, setCurrentPage] = useState("home");
  const [collapsed, setCollapsed] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <SupervisorHome />;
      case "details":
        return <SupervisorDetails worker={worker} />;
      case "visuals":
        return <SupervisorDataVisuals />;
      case "profile":
        return <SupervisorProfile worker={worker} />;
      default:
        return <SupervisorHome />;
    }
  };

  return (
    <div className="supervisor-layout">
      {/* Sidebar */}
      <SupervisorNav
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        userName={worker?.name || "Supervisor"}
        onLogout={onLogout}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content - shifts when sidebar collapses */}
      <div className={`main-content ${collapsed ? "collapsed" : ""}`}>
        {renderPage()}
      </div>
    </div>
  );
}

export default SupervisorLayout;

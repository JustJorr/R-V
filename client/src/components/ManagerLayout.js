import { useState } from "react";
import ManagerNav from "./ManagerNav";
import ManagerHome from "../pages/Manager/ManagerHome";
import ManagerDetails from "../pages/Manager/ManagerDetails";
import ManagerDataVisuals from "../pages/Manager/ManagerDataVisuals";
import ManagerProfile from "../pages/Manager/ManagerProfile";
import "../styles/Manager/ManagerLayout.css";

function ManagerLayout({ user, onLogout }) {
  const [currentPage, setCurrentPage] = useState("home");
  const [collapsed, setCollapsed] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <ManagerHome />;
      case "details":
        return <ManagerDetails user={user} />;
      case "visuals":
        return <ManagerDataVisuals />;
      case "profile":
        return <ManagerProfile user={user} />;
      default:
        return <ManagerHome />;
    }
  };

  return (
    <div className="manager-layout">
      {/* Sidebar */}
      <ManagerNav
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        userName={user?.name || "Manager"}
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

export default ManagerLayout;
import { useState } from "react";
import AdminNav from "./AdminNav";
import AdminHome from "../pages/Admin/AdminHome";
import AdminUsers from "../pages/Admin/AdminUsers";
import AdminData from "../pages/Admin/AdminData";
import AdminProfile from "../pages/Admin/AdminProfile";
import "../styles/Supervisor/SupervisorLayout.css";
import "../styles/Supervisor/SupervisorPages.css";

function AdminLayout({ worker, onLogout }) {
  const [currentPage, setCurrentPage] = useState("home");
  const [collapsed, setCollapsed] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <AdminHome />;

      case "users":
        return <AdminUsers />;

      case "data":
        return <AdminData />;

      case "profile":
        return <AdminProfile worker={worker} />;

      default:
        return <AdminHome />;
    }
  };

  return (
    <div className="supervisor-layout">
      {/* 🔥 Reuse same layout style for consistency */}

      <AdminNav
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        userName={worker?.name || "Admin"}
        onLogout={onLogout}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`main-content ${collapsed ? "collapsed" : ""}`}>
        {renderPage()}
      </div>
    </div>
  );
}

export default AdminLayout;
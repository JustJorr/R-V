import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminNav from "./AdminNav";
import AdminHome from "../pages/Admin/AdminHome";
import AdminUsers from "../pages/Admin/AdminUsers";
import AdminData from "../pages/Admin/AdminData";
import AdminProfile from "../pages/Admin/AdminProfile";
import "../styles/Supervisor/SupervisorLayout.css";
import "../styles/Admin/AdminPages.css";

function AdminLayout({ worker, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="supervisor-layout">
      {/* Sidebar */}
      <AdminNav
        userName={worker?.name || "Admin"}
        onLogout={onLogout}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content */}
      <div className={`main-content ${collapsed ? "collapsed" : ""}`}>
        <Routes>
          {/* Home */}
          <Route path="/" element={<AdminHome />} />

          {/* Users */}
          <Route path="/users" element={<AdminUsers />} />

          {/* Data */}
          <Route path="/data" element={<AdminData />} />

          {/* Profile */}
          <Route path="/profile" element={<AdminProfile worker={worker} />} />

          {/* Default */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminLayout;
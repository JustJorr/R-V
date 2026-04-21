import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import SupervisorNav from "./SupervisorNav";
import SupervisorHome from "../pages/Supervisor/SupervisorHome";
import SupervisorDetails from "../pages/Supervisor/SupervisorDetails";
import SupervisorDataVisuals from "../pages/Supervisor/SupervisorDataVisuals";
import SupervisorProfile from "../pages/Supervisor/SupervisorProfile";
import WorkerInformation from "../components/common/WorkerInformation";

import "../styles/Supervisor/SupervisorLayout.css";

function SupervisorLayout({ worker, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="supervisor-layout">
      {/* Sidebar */}
      <SupervisorNav
        userName={worker?.name || "Supervisor"}
        onLogout={onLogout}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content */}
      <div className={`main-content ${collapsed ? "collapsed" : ""}`}>
        <Routes>
          {/* Home */}
          <Route path="/" element={<SupervisorHome />} />

          {/* Details Page */}
          <Route
            path="details"
            element={<SupervisorDetails worker={worker} />}
          />

          {/* Data Visuals */}
          <Route
            path="visuals"
            element={<SupervisorDataVisuals />}
          />

          {/* Profile */}
          <Route
            path="profile"
            element={<SupervisorProfile worker={worker} />}
          />

          {/* Worker Detail Page */}
          <Route
            path="worker/:id"
            element={<WorkerInformation />}
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

export default SupervisorLayout;
import { useState } from "react";
import WorkerHome from "../pages/User/WorkerHome";
import WorkerRatings from "../pages/User/WorkerRatings";
import WorkerNav from "../pages/User/WorkerNavigation";
import WorkerFeedback from "../pages/User/WorkerFeedback";
import WorkerProfile from "../pages/User/WorkerProfile";

function WorkerLayout({ worker, onLogout }) {
  const [currentPage, setCurrentPage] = useState("home");
  const [collapsed, setCollapsed] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <WorkerHome worker={worker} />;
      case "ratings":
        return <WorkerRatings worker={worker} />;
      case "feedback":
        return <WorkerFeedback worker={worker} />;
      case "profile":
        return <WorkerProfile worker={worker} />;
      default:
        return <WorkerHome worker={worker} />;
    }
  };

  return (
    <div className="supervisor-layout">
      {/* Reuse same layout class */}

      <WorkerNav
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        userName={worker?.name || "Worker"}
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

export default WorkerLayout;
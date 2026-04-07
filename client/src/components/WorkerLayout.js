import { useState } from "react";
import WorkerHome from "../pages/User/WorkerHome";
import WorkerRatings from "../pages/User/WorkerRatings";
import WorkerNav from "../pages/User/WorkerNavigation";
import WorkerFeedback from "../pages/User/WorkerFeedback";

function WorkerLayout({ user, onLogout }) {
  const [currentPage, setCurrentPage] = useState("home");
  const [collapsed, setCollapsed] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <WorkerHome user={user} />;
      case "ratings":
        return <WorkerRatings user={user} />;
      case "feedback":
        return <WorkerFeedback user={user} />;
      default:
        return <WorkerHome user={user} />;
    }
  };

  return (
    <div className="manager-layout">
      {/* Reuse same layout class */}

      <WorkerNav
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        userName={user?.name || "Worker"}
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
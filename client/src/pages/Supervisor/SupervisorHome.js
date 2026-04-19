import { useState, useEffect } from "react";
import { supervisorService } from "../../services/api";
import { getRatingColor } from "../../utils/helpers";
import "../../styles/Supervisor/SupervisorPages.css";

function SupervisorHome() {
  const [stats, setStats] = useState({
    totalWorkers: 0,
    avgRating: 0,
    topWorker: null,
    bottomWorker: null
  });
  const [recentRatings, setRecentRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await supervisorService.getDashboard();
      const workers = response.data;

      if (workers.length > 0) {
        const totalRating = workers.reduce((sum, w) => sum + w.averageRating, 0);
        const avgRating = (totalRating / workers.length).toFixed(2);
        const topWorker = workers[0];
        const bottomWorker = workers[workers.length - 1];

        setStats({
          totalWorkers: workers.length,
          avgRating,
          topWorker,
          bottomWorker
        });

        // Get recent ratings (latest 5)
        const allRecentRatings = workers
          .filter(w => w.latestRating)
          .sort((a, b) => new Date(b.latestRating.createdAt) - new Date(a.latestRating.createdAt))
          .slice(0, 5)
          .map(w => ({
            worker: w,
            rating: w.latestRating
          }));

        setRecentRatings(allRecentRatings);
      }
    } catch (err) {
      console.error("Error fetching home data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-content"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="page-content supervisor-home">
      <div className="page-header">
        <h1>Welcome Back!</h1>
        <p>Here's your performance overview</p>
      </div>

      {/* Main Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Workers</h3>
            <p className="stat-number">{stats.totalWorkers}</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>Average Rating</h3>
            <p className="stat-number" style={{ color: getRatingColor(stats.avgRating) }}>
              {stats.avgRating}★
            </p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">🏆</div>
          <div className="stat-info">
            <h3>Top Performer</h3>
            <p className="stat-text">{stats.topWorker?.name || "N/A"}</p>
            {stats.topWorker && <p className="stat-meta">{stats.topWorker.averageRating}★</p>}
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <h3>Support Needed</h3>
            <p className="stat-text">
              {stats.bottomWorker && stats.bottomWorker.averageRating > 0 ? stats.bottomWorker.name : "N/A"}
            </p>
            {stats.bottomWorker && stats.bottomWorker.averageRating > 0 && (
              <p className="stat-meta">{stats.bottomWorker.averageRating}★</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Ratings */}
      <div className="recent-section">
        <h2>Recent Ratings</h2>
        {recentRatings.length > 0 ? (
          <div className="recent-list">
            {recentRatings.map((item, index) => (
              <div key={index} className="recent-item">
                <div className="recent-worker">
                  <div className="worker-avatar">
                    {item.worker.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="worker-details">
                    <h4>{item.worker.name}</h4>
                    <p className="worker-email">{item.worker.email}</p>
                  </div>
                </div>
                <div className="recent-rating">
                  <div className="rating-fields-small">
                    <span className="field-badge">TS: {item.rating.technicalSkills}★</span>
                    <span className="field-badge">CM: {item.rating.communication}★</span>
                    <span className="field-badge">TW: {item.rating.teamwork}★</span>
                  </div>
                  <p className="recent-time">
                    {new Date(item.rating.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No ratings yet. Start rating workers to see recent activity!</p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="quick-stat">
          <span className="label">Total Ratings Given</span>
          <span className="value">{recentRatings.length}</span>
        </div>
        <div className="quick-stat">
          <span className="label">Workers Remaining</span>
          <span className="value">{stats.totalWorkers - recentRatings.length}</span>
        </div>
        <div className="quick-stat">
          <span className="label">Rating Consistency</span>
          <span className="value">98%</span>
        </div>
      </div>
    </div>
  );
}

export default SupervisorHome;

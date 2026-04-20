import { useState, useEffect, useMemo, useCallback } from "react";
import { supervisorService } from "../../services/api";
import { getRatingColor } from "../../utils/helpers";
import "../../styles/Supervisor/SupervisorPages.css";

const ratingFields = [
  { key: "workAreaCompliance", short: "WA" },
  { key: "taskCompletion", short: "TC" },
  { key: "cleanliness", short: "CL" },
  { key: "wasteManagement", short: "WM" },
  { key: "organization", short: "OR" },
  { key: "uniformCompliance", short: "UC" },
  { key: "independence", short: "IN" },
  { key: "initiative", short: "IV" },
  { key: "teamworkSupport", short: "TS" },
  { key: "punctuality", short: "PU" },
  { key: "attendance", short: "AT" }
];

function SupervisorHome() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await supervisorService.getDashboard();
      setWorkers(response.data || []);
    } catch (err) {
      console.error("Error fetching home data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dashboard = useMemo(() => {
    if (!workers.length) {
      return {
        totalWorkers: 0,
        avgRating: "0.00",
        ratedWorkers: 0,
        unratedWorkers: 0,
        topWorker: null,
        supportWorker: null,
        recentRatings: [],
        updatedInLastWeek: 0,
        supportCount: 0
      };
    }

    const ratedWorkersList = workers.filter(w => (w.totalRatings || 0) > 0);
    const unratedWorkers = workers.length - ratedWorkersList.length;

    const avgRatingRaw =
      workers.reduce((sum, w) => sum + (Number(w.averageRating) || 0), 0) / workers.length;

    const sortedRated = [...ratedWorkersList].sort(
      (a, b) => (Number(b.averageRating) || 0) - (Number(a.averageRating) || 0)
    );

    const topWorker = sortedRated[0] || null;
    const supportWorker = sortedRated.length ? sortedRated[sortedRated.length - 1] : null;

    const recentRatings = workers
      .filter(w => w.latestRating)
      .sort((a, b) => new Date(b.latestRating.createdAt) - new Date(a.latestRating.createdAt))
      .slice(0, 8)
      .map(w => ({
        worker: w,
        rating: w.latestRating
      }));

    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    const updatedInLastWeek = workers.filter(w => {
      if (!w.latestRating?.createdAt) return false;
      const created = new Date(w.latestRating.createdAt).getTime();
      return now - created <= sevenDaysMs;
    }).length;

    const supportCount = ratedWorkersList.filter(w => (Number(w.averageRating) || 0) < 3).length;

    return {
      totalWorkers: workers.length,
      avgRating: avgRatingRaw.toFixed(2),
      ratedWorkers: ratedWorkersList.length,
      unratedWorkers,
      topWorker,
      supportWorker,
      recentRatings,
      updatedInLastWeek,
      supportCount
    };
  }, [workers]);

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-content supervisor-home">
      <div className="page-header">
        <h1>Welcome Back!</h1>
        <p>Here is your performance overview</p>
      </div>

      <div className="home-actions">
        <button className="btn btn-outline" onClick={fetchData}>
          Refresh Overview
        </button>
      </div>

      {/* ===== STATS ===== */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Workers</h3>
            <p className="stat-number">{dashboard.totalWorkers}</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>Average Rating</h3>
            <p
              className="stat-number"
              style={{ color: getRatingColor(Number(dashboard.avgRating)) }}
            >
              {dashboard.avgRating}★
            </p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">🏆</div>
          <div className="stat-info">
            <h3>Top Performer</h3>
            <p className="stat-text">{dashboard.topWorker?.name || "N/A"}</p>
            {dashboard.topWorker && (
              <p className="stat-meta">
                {Number(dashboard.topWorker.averageRating).toFixed(1)}★
              </p>
            )}
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">📉</div>
          <div className="stat-info">
            <h3>Support Needed</h3>
            <p className="stat-text">{dashboard.supportWorker?.name || "N/A"}</p>
            {dashboard.supportWorker && (
              <p className="stat-meta">
                {Number(dashboard.supportWorker.averageRating).toFixed(1)}★
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ===== RECENT RATINGS ===== */}
      <div className="recent-section">
        <h2>Recent Ratings</h2>

        {dashboard.recentRatings.length > 0 ? (
          <div className="recent-list">
            {dashboard.recentRatings.map((item) => (
              <div
                key={`${item.worker._id}-${item.rating.createdAt}`}
                className="recent-item"
              >
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
                    {/* ⭐ Overall Average */}
                    <span className="field-badge main">
                      AVG:{" "}
                      {(
                        ratingFields.reduce(
                          (sum, f) => sum + (Number(item.rating[f.key]) || 0),
                          0
                        ) / ratingFields.length
                      ).toFixed(1)}
                      ★
                    </span>

                    {/* ⚠️ Lowest 3 (problem indicators) */}
                    {ratingFields
                      .map((f) => ({
                        ...f,
                        value: Number(item.rating[f.key]) || 0
                      }))
                      .sort((a, b) => a.value - b.value)
                      .slice(0, 3)
                      .map((f) => (
                        <span key={f.key} className="field-badge warning">
                          {f.short}: {f.value}★
                        </span>
                      ))}
                  </div>

                  <p className="recent-time">
                    {new Date(item.rating.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">
            No ratings yet. Start rating workers to see recent activity.
          </p>
        )}
      </div>

      {/* ===== QUICK STATS ===== */}
      <div className="quick-stats">
        <div className="quick-stat">
          <span className="label">Workers Rated</span>
          <span className="value">{dashboard.ratedWorkers}</span>
        </div>

        <div className="quick-stat">
          <span className="label">Workers Not Rated</span>
          <span className="value">{dashboard.unratedWorkers}</span>
        </div>

        <div className="quick-stat">
          <span className="label">Updated in Last 7 Days</span>
          <span className="value">{dashboard.updatedInLastWeek}</span>
        </div>

        <div className="quick-stat">
          <span className="label">Below 3.0 Average</span>
          <span className="value">{dashboard.supportCount}</span>
        </div>
      </div>
    </div>
  );
}

export default SupervisorHome;
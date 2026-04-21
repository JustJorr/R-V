import { useState, useEffect, useMemo, useCallback } from "react";
import { supervisorService } from "../../services/api";
import { getRatingColor } from "../../utils/helpers";
import "../../styles/User/WorkerDashboard.css";

const ratingFields = [
  { key: "workAreaCompliance", short: "WA", label: "Work Area Compliance" },
  { key: "taskCompletion", short: "TC", label: "Task Completion" },
  { key: "cleanliness", short: "CL", label: "Cleanliness" },
  { key: "wasteManagement", short: "WM", label: "Waste Management" },
  { key: "organization", short: "OR", label: "Organization" },
  { key: "uniformCompliance", short: "UC", label: "Uniform Compliance" },
  { key: "independence", short: "IN", label: "Independence" },
  { key: "initiative", short: "IV", label: "Initiative" },
  { key: "teamworkSupport", short: "TS", label: "Teamwork Support" },
  { key: "punctuality", short: "PU", label: "Punctuality" },
  { key: "attendance", short: "AT", label: "Attendance" }
];

function WorkerHome({ worker }) {
  const [loading, setLoading] = useState(true);
  const [ratingData, setRatingData] = useState(null);
  const [showLegend, setShowLegend] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // ⭐ NEW

  const fetchData = useCallback(async () => {
    if (!worker?._id) return;
    
    try {
      setRefreshing(true); // ⭐ better UX
      setLoading(true);

      const response = await supervisorService.getRatingsForUser(worker._id);
      setRatingData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching worker ratings:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [worker?._id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dashboard = useMemo(() => {
    if (!Array.isArray(ratingData)) {
      return {
        avgRating: "0.00",
        totalRatings: 0,
        recentRatings: [],
        updatedInLastWeek: 0,
        lowestAreas: []
      };
    }

    const ratings = ratingData;

    const avgRatingRaw = ratings.length > 0 
      ? ratings.reduce((sum, r) => {
          const fieldValues = ratingFields.map(f => Number(r[f.key]) || 0);
          const avg = fieldValues.reduce((a, b) => a + b, 0) / fieldValues.length;
          return sum + avg;
        }, 0) / ratings.length
      : 0;

    const recentRatings = ratings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    const updatedInLastWeek = ratings.filter(r => {
      if (!r.createdAt) return false;
      const created = new Date(r.createdAt).getTime();
      return now - created <= sevenDaysMs;
    }).length;

    const fieldAverages = {};
    ratingFields.forEach(f => {
      const values = ratings.map(r => Number(r[f.key]) || 0);
      fieldAverages[f.key] = values.length > 0 
        ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
        : 0;
    });

    const lowestAreas = ratingFields
      .map(f => ({ ...f, avg: Number(fieldAverages[f.key]) }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 3);

    return {
      avgRating: avgRatingRaw.toFixed(2),
      totalRatings: ratings.length,
      recentRatings,
      updatedInLastWeek,
      lowestAreas,
      fieldAverages
    };
  }, [ratingData]);

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-content worker-dashboard">
      
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>
          Welcome back, <strong>{worker.name}</strong> 👋
        </p>
      </div>

      {/* ===== IMPROVED REFRESH BUTTON ===== */}
      <div className="home-actions">
        <button
          className="btn btn-refresh"
          onClick={fetchData}
          disabled={refreshing}
        >
          {refreshing ? "⏳ Refreshing..." : "🔄 Refresh"}
        </button>
      </div>

      {/* ===== STATS ===== */}
      <div className="stats-grid">
        
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
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Total Reviews</h3>
            <p className="stat-number">
              {dashboard.totalRatings}
            </p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">📉</div>
          <div className="stat-info">
            <h3>Updated in Last 7 Days</h3>
            <p className="stat-number">
              {dashboard.updatedInLastWeek}
            </p>
          </div>
        </div>

      </div>

      {/* ===== RECENT RATINGS ===== */}
      <div className="recent-section">
        <h2>Recent Ratings Received</h2>

        {dashboard.recentRatings.length > 0 ? (
          <div className="recent-list">
            {dashboard.recentRatings.map((rating, idx) => (
              <div key={`${rating._id}-${idx}`} className="recent-item">

                <div className="recent-worker">
                  {rating.ratedBy?.role === "supervisor" && (
                    <div className="worker-avatar">
                      {(rating.ratedBy?.name || "S").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="worker-details">
                    {(() => {
                      const isSupervisor = rating.ratedBy?.role === "supervisor";
                      const sourceLabel = isSupervisor ? "Supervisor" : "Peer";
                      const raterName = isSupervisor ? (rating.ratedBy?.name || "Team Lead") : "Anonymous Colleague";
                      return (
                        <>
                          <h4>{sourceLabel} • {raterName}</h4>
                          <p className="worker-email">{sourceLabel} rating</p>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="recent-rating">
                  <div className="rating-fields-small">
                    <span className="field-badge main">
                      AVG:{" "}
                      {(
                        ratingFields.reduce(
                          (sum, f) => sum + (Number(rating[f.key]) || 0),
                          0
                        ) / ratingFields.length
                      ).toFixed(1)}
                      ★
                    </span>

                    {ratingFields
                      .map((f) => ({
                        ...f,
                        value: Number(rating[f.key]) || 0
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
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">
            No ratings yet. Check back soon for feedback from supervisors.
          </p>
        )}
      </div>

      {/* ===== QUICK STATS ===== */}
      <div className="quick-stats">
        <div className="quick-stat">
          <span className="label">Total Ratings</span>
          <span className="value">{dashboard.totalRatings}</span>
        </div>

        <div className="quick-stat">
          <span className="label">Updated in Last 7 Days</span>
          <span className="value">{dashboard.updatedInLastWeek}</span>
        </div>

        {dashboard.lowestAreas.length > 0 && (
          <div className="quick-stat">
            <span className="label">Needs Attention</span>
            <span className="value">
              {dashboard.lowestAreas.map(f => f.short).join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* ===== MOVED LEGEND TO BOTTOM ===== */}
      <div className="legend-box">
        <div className="legend-header" onClick={() => setShowLegend(prev => !prev)}>
          <span className="legend-title">ℹ️ Rating Field Abbreviations</span>
          <span className="legend-toggle">{showLegend ? "▲ Hide" : "▼ Show"}</span>
        </div>
        {showLegend && (
          <div className="legend-grid">
            {ratingFields.map(f => (
              <div key={f.key} className="legend-item">
                <span className="legend-short">{f.short}</span>
                <span className="legend-label">{f.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default WorkerHome;
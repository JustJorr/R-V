import { useState, useEffect, useMemo, useCallback } from "react";
import { supervisorService } from "../../services/api";
import { getRatingColor } from "../../utils/helpers";
import "../../styles/User/WorkerDashboard.css";

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

function WorkerHome({ worker }) {
  const [loading, setLoading] = useState(true);
  const [ratingData, setRatingData] = useState(null);

  const fetchData = useCallback(async () => {
    if (!worker?._id) return;
    
    try {
      setLoading(true);
      const response = await supervisorService.getRatingsForUser(worker._id);
      // API returns array directly, not object with ratings property
      setRatingData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching worker ratings:", err);
    } finally {
      setLoading(false);
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

    // Calculate average for each field across all ratings
    const fieldAverages = {};
    ratingFields.forEach(f => {
      const values = ratings.map(r => Number(r[f.key]) || 0);
      fieldAverages[f.key] = values.length > 0 
        ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
        : 0;
    });

    // Find lowest 3 areas
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

      <div className="home-actions">
        <button className="btn btn-outline" onClick={fetchData}>
          Refresh Overview
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
              <div
                key={`${rating._id}-${idx}`}
                className="recent-item"
              >
                <div className="recent-worker">
                  <div className="worker-avatar">
                    {(rating.ratedBy?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="worker-details">
                    <h4>Anonymous Supervisor</h4>
                    <p className="worker-email">Rating from supervisor</p>
                  </div>
                </div>

                <div className="recent-rating">
                  <div className="rating-fields-small">
                    {/* ⭐ Overall Average */}
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

                    {/* ⚠️ Lowest 3 (problem indicators) */}
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

      {/* ===== MAIN GRID ===== */}
      <div className="dashboard-grid">

        {/* PROFILE */}
        <div className="recent-section">
          <h2>Profile Overview</h2>

          <div className="recent-item">
            <div className="recent-worker">
              
              <div className="worker-avatar">
                {worker.name.charAt(0).toUpperCase()}
              </div>

              <div className="worker-details">
                <h4>{worker.name}</h4>
                <p className="worker-email">{worker.email}</p>
              </div>

            </div>

            <span className="field-badge">Worker</span>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="recent-section">
          <h2>Quick Actions</h2>

          <div className="actions-vertical">

            <button
              className="action-btn"
              onClick={() => window.location.href = "/worker/ratings"}
            >
              ⭐ Rate Colleagues
            </button>

            <button
              className="action-btn outline"
              onClick={() => window.location.href = "/worker/ratings"}
            >
              📊 View My Ratings
            </button>

            <button
              className="action-btn outline"
              onClick={() => window.location.href = "/worker/feedback"}
            >
              💬 Feedback
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

export default WorkerHome;
import { useState, useEffect, useCallback } from "react";
import { supervisorService } from "../../services/api";
import { getRatingColor } from "../../utils/helpers";
import "../../styles/Supervisor/SupervisorPages.css";

const ratingFields = [
  { key: "workAreaCompliance", label: "Work Area" },
  { key: "taskCompletion", label: "Task Completion" },
  { key: "cleanliness", label: "Cleanliness" },
  { key: "wasteManagement", label: "Waste Mgmt" },
  { key: "organization", label: "Organization" },
  { key: "uniformCompliance", label: "Uniform" },
  { key: "independence", label: "Independence" },
  { key: "initiative", label: "Initiative" },
  { key: "teamworkSupport", label: "Teamwork" },
  { key: "punctuality", label: "Punctuality" },
  { key: "attendance", label: "Attendance" }
];

function SupervisorDataVisuals() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgRating: 0,
    topRated: [],
    ratingDistribution: { excellent: 0, good: 0, average: 0, poor: 0 }
  });

  // ── NEW: date filter state ────────────────────────────────────────────────
  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [activeFilter, setActiveFilter] = useState(""); // label shown in UI

  // ── existing fetchChartData — extended to accept filter params ────────────
  const fetchChartData = useCallback(async (date = "", month = "") => {
    try {
      setLoading(true);
      const response = await supervisorService.getDashboard();
      let data = response.data;

      // NEW: client-side filter by date/month on latestRating.dateKey
      if (date || month) {
        data = data.filter(w => {
          const dk = w.latestRating?.dateKey || "";
          if (date) return dk === date;
          if (month) return dk.startsWith(month);
          return true;
        });
      }

      setWorkers(data);

      if (data.length > 0) {
        const avgRating = (
          data.reduce((sum, w) => sum + w.averageRating, 0) / data.length
        ).toFixed(2);

        const topRated = [...data]
          .sort((a, b) => b.averageRating - a.averageRating)
          .slice(0, 5);

        const distribution = { excellent: 0, good: 0, average: 0, poor: 0 };
        data.forEach(w => {
          if (w.averageRating >= 4.5) distribution.excellent++;
          else if (w.averageRating >= 3.5) distribution.good++;
          else if (w.averageRating >= 2.5) distribution.average++;
          else distribution.poor++;
        });

        setStats({ avgRating, topRated, ratingDistribution: distribution });
      } else {
        setStats({
          avgRating: 0,
          topRated: [],
          ratingDistribution: { excellent: 0, good: 0, average: 0, poor: 0 }
        });
      }
    } catch (err) {
      console.error("Error fetching chart data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // ── NEW: filter handlers ──────────────────────────────────────────────────
  const handleApplyFilter = () => {
    fetchChartData(filterDate, filterMonth);
    if (filterDate) setActiveFilter(`Day: ${filterDate}`);
    else if (filterMonth) setActiveFilter(`Month: ${filterMonth}`);
  };

  const handleResetFilter = () => {
    setFilterDate("");
    setFilterMonth("");
    setActiveFilter("");
    fetchChartData("", "");
  };

  // ── existing helpers ──────────────────────────────────────────────────────
  const totalWorkers = workers.length;
  const getBarWidth = (count) => (totalWorkers > 0 ? (count / totalWorkers) * 100 : 0);

  const getKpiAverage = (key) => {
    if (workers.length === 0) return 0;
    const total = workers.reduce((sum, w) => sum + (w.latestRating?.[key] || 0), 0);
    return total / workers.length;
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="page-content supervisor-visuals">

      <div className="page-header">
        <h1>Data Visuals & Analytics</h1>
        <p>Performance metrics and insights</p>
      </div>

      {/* ── NEW: date filter bar ─────────────────────────────────────────── */}
      <div className="dv-filter-bar">
        <div className="dv-filter-inputs">
          <div className="dv-filter-group">
            <label>By date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setFilterMonth("");
              }}
            />
          </div>
          <div className="dv-filter-group">
            <label>By month</label>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setFilterDate("");
              }}
            />
          </div>
          <button className="dv-btn-apply" onClick={handleApplyFilter}>
            Apply
          </button>
          {activeFilter && (
            <button className="dv-btn-reset" onClick={handleResetFilter}>
              ✕ {activeFilter}
            </button>
          )}
        </div>
        {activeFilter && (
          <p className="dv-filter-note">
            Showing workers whose latest rating matches the selected filter.
          </p>
        )}
      </div>

      {/* ── existing: Summary ───────────────────────────────────────────── */}
      <div className="visuals-summary">
        <div className="summary-card">
          <h3>Overall Average Rating</h3>
          <div className="big-stat">{stats.avgRating}★</div>
          <p className="summary-note">Based on {totalWorkers} workers</p>
        </div>

        <div className="summary-card">
          <h3>Total Workers Evaluated</h3>
          <div className="big-stat">{totalWorkers}</div>
          <p className="summary-note">Active in system</p>
        </div>

        <div className="summary-card">
          <h3>Excellent Performers</h3>
          <div className="big-stat">{stats.ratingDistribution.excellent}</div>
          <p className="summary-note">Rating 4.5+</p>
        </div>
      </div>

      {totalWorkers === 0 ? (
        <div className="no-data">No data matches the selected filter.</div>
      ) : (
        <>
          {/* ── existing: Distribution ──────────────────────────────────── */}
          <div className="chart-section">
            <h2>Rating Distribution</h2>
            <div className="distribution-container">
              {[
                { label: "Excellent (4.5+)", key: "excellent", color: "#4caf50" },
                { label: "Good (3.5-4.4)", key: "good", color: "#2196f3" },
                { label: "Average (2.5-3.4)", key: "average", color: "#ff9800" },
                { label: "Poor (<2.5)", key: "poor", color: "#f44336" }
              ].map(item => (
                <div key={item.key} className="distribution-bar">
                  <div className="bar-label">
                    <span>{item.label}</span>
                    <span>{stats.ratingDistribution[item.key]}</span>
                  </div>
                  <div className="bar-background">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${getBarWidth(stats.ratingDistribution[item.key])}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── existing: Top Performers ─────────────────────────────────── */}
          <div className="chart-section">
            <h2>Top 5 Performers</h2>
            <div className="top-performers">
              {stats.topRated.map((worker, index) => (
                <div key={worker._id} className="performer-item">
                  <div className="performer-rank">
                    <span className="rank-medal">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""}
                    </span>
                  </div>
                  <div className="performer-info">
                    <h4>#{index + 1}</h4>
                    <p className="performer-name">{worker.name}</p>
                    <p className="performer-email">{worker.email}</p>
                  </div>
                  <div className="performer-rating">
                    <span
                      className="rating-badge-large"
                      style={{ backgroundColor: getRatingColor(worker.averageRating) }}
                    >
                      {worker.averageRating.toFixed(1)}★
                    </span>
                  </div>
                  <div className="performer-meta">
                    <p>{worker.totalRatings} ratings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── existing: KPI Averages ───────────────────────────────────── */}
          <div className="chart-section">
            <h2>Performance KPI Averages</h2>
            <div className="skills-overview">
              {ratingFields.map(field => {
                const avg = getKpiAverage(field.key);
                return (
                  <div className="skill-item" key={field.key}>
                    <span className="skill-name">{field.label}</span>
                    <div className="skill-bar">
                      <div
                        className="skill-fill"
                        style={{ width: `${(avg / 5) * 100}%` }}
                      />
                    </div>
                    <span className="skill-value">{avg.toFixed(1)}★</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SupervisorDataVisuals;
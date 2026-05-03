import { useState, useEffect, useCallback, useMemo } from "react";
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

const PIE_SEGMENTS = [
  { key: "excellent", label: "Excellent (4.5+)", color: "#4caf50" },
  { key: "good", label: "Good (3.5-4.4)", color: "#2196f3" },
  { key: "average", label: "Average (2.5-3.4)", color: "#ff9800" },
  { key: "poor", label: "Poor (<2.5)", color: "#f44336" }
];

function SupervisorDataVisuals() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgRating: 0,
    topRated: [],
    ratingDistribution: { excellent: 0, good: 0, average: 0, poor: 0 }
  });

  const [filterMonth, setFilterMonth] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const fetchChartData = useCallback(async (month = "") => {
    try {
      setLoading(true);
      const response = await supervisorService.getDashboard();
      let data = response.data || [];

      if (month) {
        data = data.filter((w) => {
          const dk = w.latestRating?.dateKey || "";
          return dk === month;
        });
      }

      setWorkers(data);

      if (data.length > 0) {
        const avgRating = (
          data.reduce((sum, w) => sum + Number(w.averageRating || 0), 0) / data.length
        ).toFixed(2);

        const topRated = [...data]
          .sort((a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0))
          .slice(0, 6);

        const distribution = { excellent: 0, good: 0, average: 0, poor: 0 };
        data.forEach((w) => {
          const score = Number(w.averageRating || 0);
          if (score >= 4.5) distribution.excellent += 1;
          else if (score >= 3.5) distribution.good += 1;
          else if (score >= 2.5) distribution.average += 1;
          else distribution.poor += 1;
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

  const handleApplyFilter = () => {
    fetchChartData(filterMonth);
    if (filterMonth) setActiveFilter(`Month: ${filterMonth}`);
  };

  const handleResetFilter = () => {
    setFilterMonth("");
    setActiveFilter("");
    fetchChartData("");
  };

  const ratedWorkers = useMemo(
    () => workers.filter((w) => w.latestRating),
    [workers]
  );

  const totalWorkers = workers.length;
  const getBarWidth = (count) => (totalWorkers > 0 ? (count / totalWorkers) * 100 : 0);

  const getKpiAverage = (key) => {
    const kpiValues = ratedWorkers
      .map((w) => w.latestRating?.[key])
      .filter((v) => typeof v === "number");

    if (kpiValues.length === 0) return 0;

    const total = kpiValues.reduce((sum, v) => sum + v, 0);
    return total / kpiValues.length;
  };

  const pieData = useMemo(() => {
    const total = PIE_SEGMENTS.reduce(
      (sum, segment) => sum + stats.ratingDistribution[segment.key],
      0
    );

    if (!total) {
      return {
        background: "#e5e7eb",
        total: 0,
        legend: PIE_SEGMENTS.map((segment) => ({
          ...segment,
          count: 0,
          percent: 0
        }))
      };
    }

    let cumulative = 0;
    const colorStops = [];

    const legend = PIE_SEGMENTS.map((segment) => {
      const count = stats.ratingDistribution[segment.key] || 0;
      const percent = (count / total) * 100;
      const start = cumulative;
      const end = cumulative + percent;

      colorStops.push(`${segment.color} ${start}% ${end}%`);
      cumulative = end;

      return {
        ...segment,
        count,
        percent
      };
    });

    return {
      background: `conic-gradient(${colorStops.join(", ")})`,
      total,
      legend
    };
  }, [stats.ratingDistribution]);

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
        <h1>Data Visuals and Analytics</h1>
        <p>Performance metrics and insights</p>
      </div>

      <div className="dv-filter-bar">
        <div className="dv-filter-inputs">
          <div className="dv-filter-group">
            <label>By month</label>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            />
          </div>
          <button className="dv-btn-apply" onClick={handleApplyFilter}>
            Apply
          </button>
          {activeFilter && (
            <button className="dv-btn-reset" onClick={handleResetFilter}>
              x {activeFilter}
            </button>
          )}
        </div>
        {activeFilter && (
          <p className="dv-filter-note">
            Showing workers whose latest rating month matches the selected month.
          </p>
        )}
      </div>

      <div className="visuals-summary">
        <div className="summary-card">
          <h3>Overall Average Rating</h3>
          <div className="big-stat">{stats.avgRating}</div>
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
          <div className="chart-section">
            <h2>Rating Distribution</h2>
            <div className="distribution-container">
              {PIE_SEGMENTS.map((item) => (
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

          <div className="chart-section">
            <h2>Rating Distribution Pie</h2>
            <div className="pie-chart-layout">
              <div className="pie-chart" style={{ background: pieData.background }}>
                <div className="pie-center">
                  <span>{pieData.total}</span>
                  <small>workers</small>
                </div>
              </div>

              <div className="pie-legend">
                {pieData.legend.map((item) => (
                  <div key={item.key} className="pie-legend-item">
                    <span className="pie-dot" style={{ backgroundColor: item.color }} />
                    <span className="pie-label">{item.label}</span>
                    <span className="pie-value">{item.count} ({item.percent.toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="chart-section">
            <h2>Top 6 Performers</h2>
            <div className="top-performers">
              {stats.topRated.map((worker, index) => (
                <div key={worker._id} className="performer-item">
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
                      {Number(worker.averageRating).toFixed(1)}
                    </span>
                  </div>
                  <div className="performer-meta">
                    <p>{worker.totalRatings} ratings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-section">
            <h2>Performance KPI Averages</h2>
            <p className="kpi-note">Based on workers with submitted monthly ratings: {ratedWorkers.length}</p>
            <div className="skills-overview">
              {ratingFields.map((field) => {
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
                    <span className="skill-value">{avg.toFixed(1)}</span>
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

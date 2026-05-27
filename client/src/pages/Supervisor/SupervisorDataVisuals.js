import { useState, useEffect, useCallback, useMemo } from "react";
import { supervisorService } from "../../services/api";
import { getRatingColor } from "../../utils/helpers";
import "../../styles/Supervisor/SupervisorPages.css";
import { useLanguage } from "../../context/LanguageContext";

const ratingFields = [
  { key: "workAreaCompliance" },
  { key: "taskCompletion" },
  { key: "cleanliness" },
  { key: "wasteManagement" },
  { key: "organization" },
  { key: "uniformCompliance" },
  { key: "independence" },
  { key: "initiative" },
  { key: "teamworkSupport" },
  { key: "punctuality" },
  { key: "attendance" }
];

const PIE_SEGMENTS = [
  { key: "excellent", labelKey: "supervisorVisuals.excellentLabel", color: "#4caf50" },
  { key: "good", labelKey: "supervisorVisuals.goodLabel", color: "#2196f3" },
  { key: "average", labelKey: "supervisorVisuals.averageLabel", color: "#ff9800" },
  { key: "poor", labelKey: "supervisorVisuals.poorLabel", color: "#f44336" }
];

function SupervisorDataVisuals() {
  const { t } = useLanguage();
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
        <div className="loading">{t("supervisorVisuals.loading")}</div>
      </div>
    );
  }

  return (
    <div className="page-content supervisor-visuals">
      <div className="page-header">
        <h1>{t("supervisorVisuals.title")}</h1>
        <p>{t("supervisorVisuals.subtitle")}</p>
      </div>

      <div className="dv-filter-bar">
        <div className="dv-filter-inputs">
          <div className="dv-filter-group">
            <label>{t("supervisorVisuals.byMonth")}</label>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            />
          </div>
          <button className="dv-btn-apply" onClick={handleApplyFilter}>
            {t("supervisorVisuals.apply")}
          </button>
          {activeFilter && (
            <button className="dv-btn-reset" onClick={handleResetFilter}>
              x {activeFilter}
            </button>
          )}
        </div>
        {activeFilter && (
          <p className="dv-filter-note">
            {t("supervisorVisuals.filterNote")}
          </p>
        )}
      </div>

      <div className="visuals-summary">
        <div className="summary-card">
          <h3>{t("supervisorVisuals.overallAverage")}</h3>
          <div className="big-stat">{stats.avgRating}</div>
          <p className="summary-note">{t("supervisorVisuals.basedOnWorkers").replace("{count}", String(totalWorkers))}</p>
        </div>

        <div className="summary-card">
          <h3>{t("supervisorVisuals.totalWorkersEvaluated")}</h3>
          <div className="big-stat">{totalWorkers}</div>
          <p className="summary-note">{t("supervisorVisuals.activeInSystem")}</p>
        </div>

        <div className="summary-card">
          <h3>{t("supervisorVisuals.excellentPerformers")}</h3>
          <div className="big-stat">{stats.ratingDistribution.excellent}</div>
          <p className="summary-note">{t("supervisorVisuals.ratingFourFive")}</p>
        </div>
      </div>

      {totalWorkers === 0 ? (
        <div className="no-data">{t("supervisorVisuals.noDataFilter")}</div>
      ) : (
        <>
          <div className="chart-section">
            <h2>{t("supervisorVisuals.ratingDistribution")}</h2>
            <div className="distribution-container">
              {PIE_SEGMENTS.map((item) => (
                <div key={item.key} className="distribution-bar">
                  <div className="bar-label">
                    <span>{t(item.labelKey)}</span>
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
            <h2>{t("supervisorVisuals.pieTitle")}</h2>
            <div className="pie-chart-layout">
              <div className="pie-chart" style={{ background: pieData.background }}>
                <div className="pie-center">
                  <span>{pieData.total}</span>
                  <small>{t("supervisorVisuals.workers")}</small>
                </div>
              </div>

              <div className="pie-legend">
                {pieData.legend.map((item) => (
                  <div key={item.key} className="pie-legend-item">
                    <span className="pie-dot" style={{ backgroundColor: item.color }} />
                    <span className="pie-label">{t(item.labelKey)}</span>
                    <span className="pie-value">{item.count} ({item.percent.toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="chart-section">
            <h2>{t("supervisorVisuals.topPerformers")}</h2>
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
                    <p>{worker.totalRatings} {t("supervisorVisuals.ratings")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-section">
            <h2>{t("supervisorVisuals.kpiAverages")}</h2>
            <p className="kpi-note">{t("supervisorVisuals.kpiNote").replace("{count}", String(ratedWorkers.length))}</p>
            <div className="skills-overview">
              {ratingFields.map((field) => {
                const avg = getKpiAverage(field.key);
                return (
                  <div className="skill-item" key={field.key}>
                    <span className="skill-name">{t(`kpi.${field.key}`)}</span>
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

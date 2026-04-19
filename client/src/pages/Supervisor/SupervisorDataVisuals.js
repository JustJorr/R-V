import { useState, useEffect } from "react";
import { supervisorService } from "../../services/api";
import { getRatingColor } from "../../utils/helpers";
import "../../styles/Supervisor/SupervisorPages.css";

function SupervisorDataVisuals() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgRating: 0,
    topRated: [],
    ratingDistribution: { excellent: 0, good: 0, average: 0, poor: 0 }
  });

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const response = await supervisorService.getDashboard();
      setWorkers(response.data);

      // Calculate statistics
      if (response.data.length > 0) {
        const avgRating = (
          response.data.reduce((sum, w) => sum + w.averageRating, 0) / response.data.length
        ).toFixed(2);

        const topRated = response.data
          .sort((a, b) => b.averageRating - a.averageRating)
          .slice(0, 5);

        const distribution = { excellent: 0, good: 0, average: 0, poor: 0 };
        response.data.forEach(w => {
          if (w.averageRating >= 4.5) distribution.excellent++;
          else if (w.averageRating >= 3.5) distribution.good++;
          else if (w.averageRating >= 2.5) distribution.average++;
          else distribution.poor++;
        });

        setStats({
          avgRating,
          topRated,
          ratingDistribution: distribution
        });
      }
    } catch (err) {
      console.error("Error fetching chart data:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalWorkers = workers.length;
  const getBarWidth = (count) => (count / totalWorkers) * 100;

  if (loading) {
    return <div className="page-content"><div className="loading">Loading analytics...</div></div>;
  }

  return (
    <div className="page-content supervisor-visuals">
      <div className="page-header">
        <h1>Data Visuals & Analytics</h1>
        <p>Performance metrics and insights</p>
      </div>

      {/* Main Stats Summary */}
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

      {/* Rating Distribution */}
      <div className="chart-section">
        <h2>Rating Distribution</h2>
        <div className="distribution-container">
          <div className="distribution-bar">
            <div className="bar-label">
              <span>Excellent (4.5+)</span>
              <span>{stats.ratingDistribution.excellent}</span>
            </div>
            <div className="bar-background">
              <div 
                className="bar-fill" 
                style={{
                  width: `${getBarWidth(stats.ratingDistribution.excellent)}%`,
                  backgroundColor: "#4caf50"
                }}
              ></div>
            </div>
          </div>

          <div className="distribution-bar">
            <div className="bar-label">
              <span>Good (3.5-4.4)</span>
              <span>{stats.ratingDistribution.good}</span>
            </div>
            <div className="bar-background">
              <div 
                className="bar-fill" 
                style={{
                  width: `${getBarWidth(stats.ratingDistribution.good)}%`,
                  backgroundColor: "#2196f3"
                }}
              ></div>
            </div>
          </div>

          <div className="distribution-bar">
            <div className="bar-label">
              <span>Average (2.5-3.4)</span>
              <span>{stats.ratingDistribution.average}</span>
            </div>
            <div className="bar-background">
              <div 
                className="bar-fill" 
                style={{
                  width: `${getBarWidth(stats.ratingDistribution.average)}%`,
                  backgroundColor: "#ff9800"
                }}
              ></div>
            </div>
          </div>

          <div className="distribution-bar">
            <div className="bar-label">
              <span>Poor (Below 2.5)</span>
              <span>{stats.ratingDistribution.poor}</span>
            </div>
            <div className="bar-background">
              <div 
                className="bar-fill" 
                style={{
                  width: `${getBarWidth(stats.ratingDistribution.poor)}%`,
                  backgroundColor: "#f44336"
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
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

      {/* Skills Heatmap */}
      <div className="chart-section">
        <h2>Skill Category Averages</h2>
        <div className="skills-overview">
          {workers.length > 0 && (
            <>
              <div className="skill-item">
                <span className="skill-name">Technical Skills</span>
                <div className="skill-bar">
                  <div 
                    className="skill-fill"
                    style={{
                      width: `${(workers.reduce((sum, w) => sum + (w.latestRating?.technicalSkills || 0), 0) / workers.length / 5) * 100}%`
                    }}
                  ></div>
                </div>
                <span className="skill-value">
                  {(workers.reduce((sum, w) => sum + (w.latestRating?.technicalSkills || 0), 0) / workers.length).toFixed(1)}★
                </span>
              </div>

              <div className="skill-item">
                <span className="skill-name">Communication</span>
                <div className="skill-bar">
                  <div 
                    className="skill-fill"
                    style={{
                      width: `${(workers.reduce((sum, w) => sum + (w.latestRating?.communication || 0), 0) / workers.length / 5) * 100}%`
                    }}
                  ></div>
                </div>
                <span className="skill-value">
                  {(workers.reduce((sum, w) => sum + (w.latestRating?.communication || 0), 0) / workers.length).toFixed(1)}★
                </span>
              </div>

              <div className="skill-item">
                <span className="skill-name">Teamwork</span>
                <div className="skill-bar">
                  <div 
                    className="skill-fill"
                    style={{
                      width: `${(workers.reduce((sum, w) => sum + (w.latestRating?.teamwork || 0), 0) / workers.length / 5) * 100}%`
                    }}
                  ></div>
                </div>
                <span className="skill-value">
                  {(workers.reduce((sum, w) => sum + (w.latestRating?.teamwork || 0), 0) / workers.length).toFixed(1)}★
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SupervisorDataVisuals;

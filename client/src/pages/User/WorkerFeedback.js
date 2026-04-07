import { useEffect, useState, useCallback } from "react";
import { ratingsService } from "../../services/api";
import "../../styles/User/WorkerDashboard.css";

function WorkerFeedback({ user }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    avgRating: 0,
    topStrength: "",
    improvementArea: ""
  });

  // 🎨 Color helper with enhanced palette
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "#2e7d32"; // Excellent
    if (rating >= 4) return "#4caf50";   // Good
    if (rating >= 3) return "#2196f3";   // Average
    return "#ff9800";                      // Needs work
  };

  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4) return "Good";
    if (rating >= 3) return "Average";
    return "Developing";
  };

  // 🔥 Fetch feedback from managers only
  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);

      const res = await ratingsService.getRatingsForUser(user._id);

      // ✅ Filter ONLY manager comments
      const managerComments = res.data.filter(
        (rating) => rating.ratedBy?.role === "manager" && rating.comment
      );

      setComments(managerComments);

      // 📊 Calculate stats
      if (managerComments.length > 0) {
        let totalSkills = 0;
        let totalCommunication = 0;
        let totalTeamwork = 0;

        managerComments.forEach((item) => {
          totalSkills += item.technicalSkills;
          totalCommunication += item.communication;
          totalTeamwork += item.teamwork;
        });

        const count = managerComments.length;
        const avgSkills = (totalSkills / count).toFixed(1);
        const avgComm = (totalCommunication / count).toFixed(1);
        const avgTeam = (totalTeamwork / count).toFixed(1);
        const overallAvg = ((totalSkills + totalCommunication + totalTeamwork) / (count * 3)).toFixed(1);

        // Determine top strength and improvement area
        const scores = {
          'Technical Skills': parseFloat(avgSkills),
          'Communication': parseFloat(avgComm),
          'Teamwork': parseFloat(avgTeam)
        };

        const topStrength = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
        const improvementArea = Object.entries(scores).reduce((a, b) => a[1] < b[1] ? a : b)[0];

        setStats({
          total: count,
          avgRating: parseFloat(overallAvg),
          avgSkills: parseFloat(avgSkills),
          avgComm: parseFloat(avgComm),
          avgTeam: parseFloat(avgTeam),
          topStrength,
          improvementArea
        });
      }
    } catch (err) {
      console.error("Error fetching feedback:", err);
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);


  return (
    <div className="page-content worker-dashboard">
      {/* HEADER */}
      <div className="page-header">
        <h1>📋 Manager Feedback</h1>
        <p>Performance insights from your managers</p>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="loading">Fetching your feedback</div>
      ) : comments.length === 0 ? (
        <div className="no-data">
          <p>No feedback from managers yet.<br/>Check back soon!</p>
        </div>
      ) : (
        <>
          {/* SUMMARY STATS */}
          <div className="stats-grid">
            <div className="stat-card success">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <h3>Total Feedback</h3>
                <p className="stat-number">{stats.total}</p>
              </div>
            </div>
            
            <div className="stat-card info">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <h3>Overall Rating</h3>
                <p className="stat-number">{stats.avgRating}</p>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">💪</div>
              <div className="stat-info">
                <h3>Top Strength</h3>
                <p className="stat-number" style={{ fontSize: '16px' }}>
                  {stats.topStrength}
                </p>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <h3>Focus Area</h3>
                <p className="stat-number" style={{ fontSize: '16px' }}>
                  {stats.improvementArea}
                </p>
              </div>
            </div>
          </div>

          {/* FEEDBACK CARDS */}
          <div className="feedback-list">
            {comments.map((item, index) => {
              const avg = (
                (item.technicalSkills +
                  item.communication +
                  item.teamwork) /
                3
              ).toFixed(1);

              return (
                <div key={index} className="feedback-card">

                  {/* ===== HEADER ===== */}
                  <div className="feedback-header">
                    <div className="feedback-left">
                      <div className="manager-badge">
                        👔 Manager
                      </div>
                      <span className="feedback-date">
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div
                      className="feedback-average"
                      style={{ color: getRatingColor(avg) }}
                      title={getRatingLabel(avg)}
                    >
                      {avg} <span style={{ fontSize: '20px' }}>⭐</span>
                    </div>
                  </div>

                  {/* ===== RATINGS BREAKDOWN ===== */}
                  <div className="feedback-ratings">
                    <span className="field-badge" title="Technical Skills">
                      🛠️ {item.technicalSkills}/5
                    </span>
                    <span className="field-badge" title="Communication">
                      💬 {item.communication}/5
                    </span>
                    <span className="field-badge" title="Teamwork">
                      🤝 {item.teamwork}/5
                    </span>
                  </div>

                  {/* ===== COMMENT ===== */}
                  <div className="feedback-comment">
                    <p style={{ margin: 0 }}>
                      "{item.comment}"
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default WorkerFeedback;
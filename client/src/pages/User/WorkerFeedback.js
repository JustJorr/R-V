import { useEffect, useState, useCallback } from "react";
import { ratingsService } from "../../services/api";
import "../../styles/User/WorkerDashboard.css";

function WorkerFeedback({ worker }) {
  const [supervisorComments, setSupervisorComments] = useState([]);
  const [anonymousComments, setAnonymousComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getRatingColor = (rating) => {
    if (rating >= 4) return "#4caf50";
    if (rating >= 3) return "#2196f3";
    return "#ff9800";
  };

  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);

      const res = await ratingsService.getRatingsForUser(worker._id);

      const supervisor = [];
      const anonymous = [];

      res.data.forEach((rating) => {
        if (!rating.comment) return;

        if (rating.ratedBy?.role === "supervisor") {
          supervisor.push(rating);
        } else {
          anonymous.push(rating);
        }
      });

      setSupervisorComments(supervisor);
      setAnonymousComments(anonymous);

    } catch (err) {
      console.error("Error fetching feedback:", err);
    } finally {
      setLoading(false);
    }
  }, [worker._id]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const renderCard = (item, label) => {
    const avg = (
      (item.technicalSkills +
        item.communication +
        item.teamwork) /
      3
    ).toFixed(1);

    return (
      <div className="feedback-card">

        {/* HEADER */}
        <div className="feedback-header">
          <div className="feedback-left">
            <div className={`supervisor-badge ${label === "anonymous" ? "anonymous" : ""}`}>
              {label === "anonymous" ? "Anonymous" : "Supervisor"}
            </div>
            <span className="feedback-date">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div
            className="feedback-average"
            style={{ color: getRatingColor(avg) }}
          >
            ⭐ {avg}
          </div>
        </div>

        {/* RATINGS */}
        <div className="feedback-ratings">
          <span className="field-badge">TS: {item.technicalSkills}★</span>
          <span className="field-badge">CM: {item.communication}★</span>
          <span className="field-badge">TW: {item.teamwork}★</span>
        </div>

        {/* COMMENT */}
        <div className="feedback-comment">
          {item.comment}
        </div>
      </div>
    );
  };

  return (
    <div className="page-content worker-dashboard">
      <div className="page-header">
        <h1>Feedback</h1>
        <p>Supervisor and anonymous feedback</p>
      </div>

      {loading ? (
        <div className="loading">Loading feedback...</div>
      ) : (
        <>
          {/* ===== MANAGER SECTION ===== */}
          <div className="recent-section">
            <h2>Supervisor Feedback</h2>

            {supervisorComments.length === 0 ? (
              <div className="no-data">No supervisor feedback yet.</div>
            ) : (
              <div className="feedback-list">
                {supervisorComments.map((item, i) => (
                  <div key={i}>{renderCard(item, "supervisor")}</div>
                ))}
              </div>
            )}
          </div>

          {/* ===== ANONYMOUS SECTION ===== */}
          <div className="recent-section">
            <h2>Anonymous Feedback</h2>

            {anonymousComments.length === 0 ? (
              <div className="no-data">No anonymous feedback yet.</div>
            ) : (
              <div className="feedback-list">
                {anonymousComments.map((item, i) => (
                  <div key={i}>{renderCard(item, "anonymous")}</div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default WorkerFeedback;
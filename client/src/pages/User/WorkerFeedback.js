import { useEffect, useState, useCallback } from "react";
import { ratingsService } from "../../services/api";
import "../../styles/User/WorkerDashboard.css";

function WorkerFeedback({ user }) {
  const [managerComments, setManagerComments] = useState([]);
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

      const res = await ratingsService.getRatingsForUser(user._id);

      const manager = [];
      const anonymous = [];

      res.data.forEach((rating) => {
        if (!rating.comment) return;

        if (rating.ratedBy?.role === "manager") {
          manager.push(rating);
        } else {
          anonymous.push(rating);
        }
      });

      setManagerComments(manager);
      setAnonymousComments(anonymous);

    } catch (err) {
      console.error("Error fetching feedback:", err);
    } finally {
      setLoading(false);
    }
  }, [user._id]);

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
            <div className={`manager-badge ${label === "anonymous" ? "anonymous" : ""}`}>
              {label === "anonymous" ? "Anonymous" : "Manager"}
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
        <p>Manager and anonymous feedback</p>
      </div>

      {loading ? (
        <div className="loading">Loading feedback...</div>
      ) : (
        <>
          {/* ===== MANAGER SECTION ===== */}
          <div className="recent-section">
            <h2>Manager Feedback</h2>

            {managerComments.length === 0 ? (
              <div className="no-data">No manager feedback yet.</div>
            ) : (
              <div className="feedback-list">
                {managerComments.map((item, i) => (
                  <div key={i}>{renderCard(item, "manager")}</div>
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
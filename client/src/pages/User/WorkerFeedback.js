import { useEffect, useState, useCallback } from "react";
import { ratingsService } from "../../services/api";
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

function WorkerFeedback({ worker }) {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);

      const res = await ratingsService.getRatingsForUser(worker._id, {
        date: filterDate,
        month: filterMonth
      });

      // Filter to only include ratings with comments
      const withComments = (Array.isArray(res.data) ? res.data : []).filter(
        r => r.comment
      );

      setRatings(withComments);

    } catch (err) {
      console.error("Error fetching feedback:", err);
    } finally {
      setLoading(false);
    }
  }, [worker._id, filterDate, filterMonth]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const calculateAverage = (rating) => {
    const values = ratingFields.map(f => Number(rating[f.key]) || 0);
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  const supervisorFeedback = ratings.filter(r => r.ratedBy?.role === "supervisor");
  const peerFeedback = ratings.filter(r => r.ratedBy?.role !== "supervisor");

  const renderCard = (item) => {
    const avg = calculateAverage(item);
    const isFromSupervisor = item.ratedBy?.role === "supervisor";
    const raterName = isFromSupervisor ? item.ratedBy?.name : "Anonymous Colleague";

    return (
      <div className="feedback-card">

        {/* HEADER */}
        <div className="feedback-header">
          <div className="feedback-left">
            <div className="supervisor-badge">
              {isFromSupervisor ? "Supervisor" : "Peer"} Feedback
            </div>
            <span className="rater-name">{raterName}</span>
            <span className="feedback-date">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div
            className="feedback-average"
            style={{ color: getRatingColor(Number(avg)) }}
          >
            ⭐ {avg}
          </div>
        </div>

        {/* RATINGS - Show all fields */}
        <div className="feedback-ratings">
          {ratingFields.map(f => (
            <span key={f.key} className="field-badge" title={f.label}>
              {f.short}: {item[f.key] ?? 0}★
            </span>
          ))}
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
        <p>Feedback from supervisors and colleagues</p>
      </div>

      {loading ? (
        <div className="loading">Loading feedback...</div>
      ) : (
        <>
          <div className="date-filter-bar">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setFilterMonth("");
              }}
            />

            <input
              type="month"
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setFilterDate("");
              }}
            />

            <button onClick={fetchFeedback}>Apply</button>

            <button
              onClick={() => {
                setFilterDate("");
                setFilterMonth("");
                fetchFeedback();
              }}
            >
              Reset
            </button>
          </div>

          {/* ===== SUPERVISOR FEEDBACK SECTION ===== */}
          <div className="recent-section">
            <h2>Supervisor Feedback</h2>

            {supervisorFeedback.length === 0 ? (
              <div className="no-data">No supervisor feedback with comments yet.</div>
            ) : (
              <div className="feedback-list">
                {supervisorFeedback.map((item, i) => (
                  <div key={i}>{renderCard(item)}</div>
                ))}
              </div>
            )}
          </div>

          {/* ===== PEER FEEDBACK SECTION ===== */}
          <div className="recent-section">
            <h2>Peer Feedback</h2>

            {peerFeedback.length === 0 ? (
              <div className="no-data">No peer feedback with comments yet.</div>
            ) : (
              <div className="feedback-list">
                {peerFeedback.map((item, i) => (
                  <div key={i}>{renderCard(item)}</div>
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
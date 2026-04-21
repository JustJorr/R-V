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
  const [activeFilter, setActiveFilter] = useState(""); // NEW: label for active pill

  const fetchFeedback = useCallback(async (date = filterDate, month = filterMonth) => {
    try {
      setLoading(true);

      const res = await ratingsService.getRatingsForUser(worker._id, {
        ...(date && { date }),
        ...(month && { month })
      });

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

  // ── NEW: explicit apply/reset so state is set before fetch fires ──────────
  const handleApplyFilter = () => {
    fetchFeedback(filterDate, filterMonth);
    if (filterDate) setActiveFilter(`Day: ${filterDate}`);
    else if (filterMonth) setActiveFilter(`Month: ${filterMonth}`);
  };

  const handleResetFilter = () => {
    setFilterDate("");
    setFilterMonth("");
    setActiveFilter("");
    fetchFeedback("", ""); // pass empty strings directly — don't rely on state
  };

  // ── existing helpers ──────────────────────────────────────────────────────
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

        <div className="feedback-ratings">
          {ratingFields.map(f => (
            <span key={f.key} className="field-badge" title={f.label}>
              {f.short}: {item[f.key] ?? 0}★
            </span>
          ))}
        </div>

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

      {/* ── NEW: cleaner filter bar ───────────────────────────────────────── */}
      <div className="wf-filter-bar">
        <div className="wf-filter-inputs">
          <div className="wf-filter-group">
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
          <div className="wf-filter-group">
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
          <button className="wf-btn-apply" onClick={handleApplyFilter}>
            Apply
          </button>
          {activeFilter && (
            <button className="wf-btn-reset" onClick={handleResetFilter}>
              ✕ {activeFilter}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading feedback...</div>
      ) : (
        <>
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
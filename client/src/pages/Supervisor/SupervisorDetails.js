import { useState, useEffect, useCallback, useMemo } from "react";
import { supervisorService } from "../../services/api";
import { getRatingColor, getRatingStatus } from "../../utils/helpers";
import { useNavigate } from "react-router-dom";
import RatingForm from "../../components/RatingForm";
import "../../styles/Supervisor/SupervisorPages.css";

const KPI_FIELDS = [
  { key: "workAreaCompliance", label: "Work Area Compliance", short: "WA" },
  { key: "taskCompletion", label: "Task Completion", short: "TC" },
  { key: "cleanliness", label: "Cleanliness", short: "CL" },
  { key: "wasteManagement", label: "Waste Management", short: "WM" },
  { key: "organization", label: "Organization", short: "OR" },
  { key: "uniformCompliance", label: "Uniform Compliance", short: "UC" },
  { key: "independence", label: "Independence", short: "IN" },
  { key: "initiative", label: "Initiative", short: "IV" },
  { key: "teamworkSupport", label: "Teamwork Support", short: "TS" },
  { key: "punctuality", label: "Punctuality", short: "PU" },
  { key: "attendance", label: "Attendance", short: "AT" }
];

// Returns today's date as "YYYY-MM-DD" in local time — same logic as the server
function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";  // Handle invalid dates
  return d.toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric"
  });
}

// HistoryModal: read-only view of past ratings for a worker
function HistoryModal({ worker, supervisorId, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!worker) return;
    setLoading(true);
    supervisorService.getWorkerHistory(worker._id, supervisorId)
      .then(res => setHistory(res.data || []))
      .catch(() => setError("Could not load history."))
      .finally(() => setLoading(false));
  }, [worker, supervisorId]);

  if (!worker) return null;

  return (
    <div className="sd-modal-backdrop" onClick={onClose}>
      <div className="sd-modal" onClick={e => e.stopPropagation()}>
        <div className="sd-modal-header">
          <div>
            <h2 className="sd-modal-title">Rating History</h2>
            <p className="sd-modal-subtitle">{worker.name} · past sessions (read-only)</p>
          </div>
          <button className="sd-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="sd-modal-body">
          {loading && <div className="sd-state-msg">Loading history...</div>}
          {error && <div className="sd-state-msg sd-state-error">{error}</div>}
          {!loading && !error && history.length === 0 && (
            <div className="sd-state-msg">No past ratings found.</div>
          )}
          {!loading && !error && history.map(({ date, entries }) => (
            <div key={date} className="sd-history-group">
              <div className="sd-history-date">{formatDate(date + "T00:00:00")}</div>
              {entries.map(entry => {
                const avg = KPI_FIELDS.reduce((sum, f) => sum + (entry[f.key] || 0), 0) / KPI_FIELDS.length;
                return (
                  <div key={entry._id} className="sd-history-card">
                    <div className="sd-history-card-header">
                      <span className="sd-history-ratedby">by {entry.ratedBy?.name || "Unknown"}</span>
                      <span
                        className="sd-history-avg"
                        style={{ background: getRatingColor(avg) }}
                      >
                        {avg.toFixed(1)}★
                      </span>
                    </div>
                    <div className="sd-kpi-grid">
                      {KPI_FIELDS.map(f => (
                        <div key={f.key} className="sd-kpi-item">
                          <span className="sd-kpi-short">{f.short}</span>
                          <span className="sd-kpi-val">{entry[f.key] ?? 0}</span>
                        </div>
                      ))}
                    </div>
                    {entry.comment && (
                      <p className="sd-history-comment">"{entry.comment}"</p>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT =====
function SupervisorDetails({ worker: supervisor }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingWorker, setRatingWorker] = useState(null);
  const [ratedWorkerIds, setRatedWorkerIds] = useState(new Set());
  const [isEditingRating, setIsEditingRating] = useState(false);
  const [existingRatingData, setExistingRatingData] = useState(null);
  const [historyWorker, setHistoryWorker] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const today = getTodayKey();

  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      const response = await supervisorService.getDashboard();
      setWorkers(response.data || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchSupervisorRatings = useCallback(async () => {
    if (!supervisor?._id) {
      setRatedWorkerIds(new Set());
      return;
    }
    try {
      const response = await supervisorService.getSupervisorRatings(supervisor._id);
      const ratedIds = new Set((response.data || []).map(r => r.ratedUser));
      setRatedWorkerIds(ratedIds);
    } catch (err) {
      console.error("Error fetching supervisor ratings:", err);
    }
  }, [supervisor?._id]);

  useEffect(() => {
    fetchDashboardData();
    fetchSupervisorRatings();
  }, [fetchDashboardData, fetchSupervisorRatings]);

  const handleRatingSuccess = () => {
    setRatingWorker(null);
    fetchDashboardData();
    fetchSupervisorRatings();
  };

  const isAlreadyRated = useCallback(workerId => ratedWorkerIds.has(workerId), [ratedWorkerIds]);

  const handleRateWorker = worker => {
    setRatingWorker(worker);
    setIsEditingRating(false);
    setExistingRatingData(null);
  };

  const handleEditRating = async worker => {
    if (!supervisor?._id) return;
    try {
      const response = await supervisorService.getExistingRating(supervisor._id, worker._id);
      setRatingWorker(worker);
      setIsEditingRating(true);
      setExistingRatingData(response.data);
    } catch (err) {
      console.error("Error fetching rating for editing:", err);
      alert("Could not load today's rating for editing.");
    }
  };

  const handleViewHistory = worker => setHistoryWorker(worker);

  // Check if a worker's latest rating was today
  const ratedToday = useCallback(worker => {
    if (!worker.latestRating) return false;
    const ratingDate = worker.latestRating.dateKey ||
      new Date(worker.latestRating.createdAt).toISOString().split("T")[0];
    return ratingDate === today;
  }, [today]);

  const { filteredWorkers, ratedCount, unratedCount } = useMemo(() => {
    const ratedWorkers = workers.filter(w => isAlreadyRated(w._id)).length;
    const unratedWorkers = workers.length - ratedWorkers;
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const list = workers
      .filter(worker => {
        const matchesSearch =
          worker.name.toLowerCase().includes(normalizedSearch) ||
          worker.email.toLowerCase().includes(normalizedSearch);
        const matchesFilter =
          filterStatus === "all" ||
          (filterStatus === "rated" && isAlreadyRated(worker._id)) ||
          (filterStatus === "unrated" && !isAlreadyRated(worker._id));
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return (b.averageRating || 0) - (a.averageRating || 0);
        if (sortBy === "recent") {
          const aDate = a.latestRating?.createdAt ? new Date(a.latestRating.createdAt).getTime() : 0;
          const bDate = b.latestRating?.createdAt ? new Date(b.latestRating.createdAt).getTime() : 0;
          return bDate - aDate;
        }
        return a.name.localeCompare(b.name);
      });

    return { filteredWorkers: list, ratedCount: ratedWorkers, unratedCount: unratedWorkers };
  }, [workers, searchTerm, filterStatus, sortBy, isAlreadyRated]);

  return (
    <div className="page-content supervisor-details">
      {/* Rating form modal (today only) */}
      {ratingWorker && (
        <RatingForm
          worker={ratingWorker}
          userId={supervisor?._id}
          onSuccess={handleRatingSuccess}
          onCancel={() => setRatingWorker(null)}
          isEditing={isEditingRating}
          initialValues={existingRatingData}
        />
      )}

      {/* History modal (past, read-only) */}
      {historyWorker && (
        <HistoryModal
          worker={historyWorker}
          supervisorId={supervisor?._id}
          onClose={() => setHistoryWorker(null)}
        />
      )}

      <div className="page-header">
        <h1>Worker Details and Ratings</h1>
        <p>Rate workers today · view history any time</p>
      </div>

      <div className="details-stats-row">
        <div className="quick-stat-pill">
          <span className="label">Visible Workers</span>
          <span className="value">{filteredWorkers.length}</span>
        </div>
        <div className="quick-stat-pill">
          <span className="label">Rated Today</span>
          <span className="value">{ratedCount}</span>
        </div>
        <div className="quick-stat-pill">
          <span className="label">Not Yet Rated</span>
          <span className="value">{unratedCount}</span>
        </div>
      </div>

      <div className="details-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sort-group">
          <label htmlFor="details-sort">Sort</label>
          <select
            id="details-sort"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Name (A–Z)</option>
            <option value="rating">Highest Rating</option>
            <option value="recent">Latest Activity</option>
          </select>
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >All ({workers.length})</button>
          <button
            className={`filter-btn ${filterStatus === "rated" ? "active" : ""}`}
            onClick={() => setFilterStatus("rated")}
          >Rated ({ratedCount})</button>
          <button
            className={`filter-btn ${filterStatus === "unrated" ? "active" : ""}`}
            onClick={() => setFilterStatus("unrated")}
          >Unrated ({unratedCount})</button>
        </div>

        <button
          className="btn btn-refresh"
          onClick={fetchDashboardData}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading workers...</div>
      ) : filteredWorkers.length === 0 ? (
        <div className="no-data">
          {searchTerm ? "No workers found matching your search." : "No workers to display."}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="workers-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Avg Rating</th>
                <th>Sessions</th>
                <th>Status</th>
                <th>Latest Rating</th>
                <th>Today</th>
                <th>History</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((worker, index) => (
                <tr key={worker._id} className={isAlreadyRated(worker._id) ? "rated-row" : ""}>
                  <td>{index + 1}</td>
                  <td>
                    <div 
                      className="worker-name-cell clickable"
                      onClick={() => navigate(`/worker/${worker._id}`)}
                    >
                      <div className="worker-badge">
                        {worker.name.charAt(0).toUpperCase()}
                      </div>
                      {worker.name}
                    </div>
                  </td>
                  <td className="worker-email">{worker.email}</td>
                  <td>
                    <span
                      className="rating-badge"
                      style={{ backgroundColor: getRatingColor(worker.averageRating) }}
                    >
                      {worker.totalRatings > 0 ? Number(worker.averageRating).toFixed(1) : "—"}★
                    </span>
                  </td>
                  <td className="center">{worker.totalRatings}</td>
                  <td className="center">
                    <span className={`status-badge ${getRatingStatus(worker.averageRating).toLowerCase().replace(/\s+/g, "-")}`}>
                      {getRatingStatus(worker.averageRating)}
                    </span>
                  </td>
                  <td className="latest-rating-cell">
                    {worker.latestRating ? (
                      <div className="rating-info">
                        <div className="rating-fields">
                          {KPI_FIELDS.map(f => (
                            <span key={f.key} className="field-badge">
                              {f.short}: {worker.latestRating[f.key] ?? 0}
                            </span>
                          ))}
                        </div>
                        <small className="rating-timestamp">
                          {formatDate(worker.latestRating.createdAt)}
                          {ratedToday(worker) && (
                            <span className="today-tag">today</span>
                          )}
                        </small>
                      </div>
                    ) : (
                      <span className="text-muted">No ratings yet</span>
                    )}
                  </td>

                  {/* TODAY column: Rate / Edit (today only) */}
                  <td className="action-cell">
                    {isAlreadyRated(worker._id) ? (
                      <button
                        className="btn btn-edit"
                        onClick={() => handleEditRating(worker)}
                        title="Edit today's rating"
                      >
                        Edit
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleRateWorker(worker)}
                        title="Rate this worker for today"
                      >
                        Rate
                      </button>
                    )}
                  </td>

                  {/* HISTORY column: always available, read-only */}
                  <td className="action-cell">
                    <button
                      className="btn btn-history"
                      onClick={() => handleViewHistory(worker)}
                      title="View past ratings"
                    >
                      History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SupervisorDetails;
import { useState, useEffect, useCallback, useMemo } from "react";
import { ratingsService, supervisorService } from "../../services/api";
import { getRatingColor } from "../../utils/helpers";
import RatingForm from "../../components/RatingForm";
import "../../styles/Supervisor/SupervisorPages.css";
import "../../styles/User/WorkerDashboard.css";

const ratingFields = [
  { key: "workAreaCompliance", short: "WA" },
  { key: "taskCompletion", short: "TC" },
  { key: "cleanliness", short: "CL" },
  { key: "wasteManagement", short: "WM" },
  { key: "organization", short: "OR" },
  { key: "uniformCompliance", short: "UC" },
  { key: "independence", short: "IN" },
  { key: "initiative", short: "IV" },
  { key: "teamworkSupport", short: "TS" },
  { key: "punctuality", short: "PU" },
  { key: "attendance", short: "AT" }
];

const KPI_FIELDS = ratingFields;

function getPreviousMonthKey() {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric"
  });
}

function formatMonthLabel(monthKey) {
  if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) return monthKey;
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long"
  });
}

function WorkerRatings({ worker }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingWorker, setRatingWorker] = useState(null);
  const [editingRating, setEditingRating] = useState(null);
  const [ratedWorkerIds, setRatedWorkerIds] = useState(new Set());
  const [ratedWorkerMap, setRatedWorkerMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(getPreviousMonthKey());
  const [filterMonth, setFilterMonth] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const fetchWorkers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await supervisorService.getDashboard(selectedMonth);
      const filtered = res.data.filter(
        (u) => u.role === "worker" && u._id !== worker._id
      );
      setWorkers(filtered);
    } catch (err) {
      console.error("Error fetching workers:", err);
    } finally {
      setLoading(false);
    }
  }, [worker._id, selectedMonth]);

  const allowedRatingMonth = getPreviousMonthKey();
  const isRatingMonthAvailable = selectedMonth === allowedRatingMonth;

  const fetchWorkerRatings = useCallback(async () => {
    if (!worker?._id) {
      setRatedWorkerIds(new Set());
      return;
    }
    try {
      const response = await supervisorService.getSupervisorRatings(worker._id, selectedMonth);
      const ratedIds = new Set((response.data || []).map((rating) => String(rating.ratedUser)));
      const map = (response.data || []).reduce((acc, rating) => {
        acc[String(rating.ratedUser)] = rating;
        return acc;
      }, {});
      setRatedWorkerIds(ratedIds);
      setRatedWorkerMap(map);
    } catch (err) {
      console.error("Error fetching worker ratings:", err);
    }
  }, [worker?._id, selectedMonth]);

  useEffect(() => {
    fetchWorkers();
    fetchWorkerRatings();
  }, [fetchWorkers, fetchWorkerRatings]);

  const handleApplyFilter = () => {
    const month = filterMonth || getPreviousMonthKey();
    setSelectedMonth(month);
    setActiveFilter(filterMonth ? `Month: ${filterMonth}` : "");
  };

  const handleResetFilter = () => {
    const previousMonth = getPreviousMonthKey();
    setFilterMonth("");
    setActiveFilter("");
    setSelectedMonth(previousMonth);
  };

  const handleRatingSuccess = () => {
    setRatingWorker(null);
    setEditingRating(null);
    fetchWorkers();
    fetchWorkerRatings();
  };

  const isAlreadyRated = useCallback((workerId) => ratedWorkerIds.has(String(workerId)), [ratedWorkerIds]);

  const handleRequestEdit = async (targetWorkerId) => {
    const rating = ratedWorkerMap[String(targetWorkerId)];
    if (!rating?._id) return;

    const reason = window.prompt("Why do you need to edit this rating?");
    if (reason === null) return;

    try {
      await ratingsService.requestWorkerEdit(rating._id, worker._id, reason);
      await fetchWorkerRatings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send edit request.");
    }
  };

  const handleRateWorker = (w) => {
    setEditingRating(null);
    setRatingWorker(w);
  };

  const handleEditWorker = async (targetWorker) => {
    try {
      const response = await supervisorService.getExistingRating(worker._id, targetWorker._id, selectedMonth);
      setEditingRating(response.data || null);
      setRatingWorker(targetWorker);
    } catch (err) {
      alert(err.response?.data?.message || "Unable to load rating for edit.");
    }
  };

  const ratedThisMonth = useCallback((w) => {
    if (!w.latestRating) return false;
    const ratingMonth = w.latestRating.dateKey ||
      new Date(w.latestRating.createdAt).toISOString().slice(0, 7);
    return ratingMonth === selectedMonth;
  }, [selectedMonth]);

  const { filteredWorkers, ratedCount, unratedCount } = useMemo(() => {
    const ratedWorkers = workers.filter((w) => isAlreadyRated(w._id)).length;
    const unratedWorkers = workers.length - ratedWorkers;
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const list = workers
      .filter((w) => {
        const matchesSearch = w.name.toLowerCase().includes(normalizedSearch);
        const matchesFilter =
          filterStatus === "all" ||
          (filterStatus === "rated" && isAlreadyRated(w._id)) ||
          (filterStatus === "unrated" && !isAlreadyRated(w._id));
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return { filteredWorkers: list, ratedCount: ratedWorkers, unratedCount: unratedWorkers };
  }, [workers, searchTerm, filterStatus, isAlreadyRated]);

  return (
    <div className="page-content supervisor-details">
      {ratingWorker && (
        <RatingForm
          worker={ratingWorker}
          userId={worker?._id}
          onSuccess={handleRatingSuccess}
          onCancel={() => {
            setRatingWorker(null);
            setEditingRating(null);
          }}
          isEditing={Boolean(editingRating)}
          initialValues={editingRating}
          selectedMonth={selectedMonth}
        />
      )}

      <div className="page-header">
        <h1>Rate Colleagues</h1>
        <p>Rate colleagues for completed months only</p>
      </div>

      <div className="wf-filter-bar">
        <div className="wf-filter-inputs">
          <div className="wf-filter-group">
            <label>By month</label>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            />
          </div>
          <button className="wf-btn-apply" onClick={handleApplyFilter}>
            Apply
          </button>
          {activeFilter && (
            <button className="wf-btn-reset" onClick={handleResetFilter}>
              x {activeFilter}
            </button>
          )}
        </div>
      </div>

      <div className="details-stats-row">
        <div className="quick-stat-pill">
          <span className="label">Visible Workers</span>
          <span className="value">{filteredWorkers.length}</span>
        </div>
        <div className="quick-stat-pill">
          <span className="label">Rated by You</span>
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
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All ({workers.length})
          </button>
          <button
            className={`filter-btn ${filterStatus === "rated" ? "active" : ""}`}
            onClick={() => setFilterStatus("rated")}
          >
            Rated ({ratedCount})
          </button>
          <button
            className={`filter-btn ${filterStatus === "unrated" ? "active" : ""}`}
            onClick={() => setFilterStatus("unrated")}
          >
            Unrated ({unratedCount})
          </button>
        </div>

        <div className="quick-stat-pill">
          <span className="label">Rating Month</span>
          <span className="value">{formatMonthLabel(selectedMonth)}</span>
        </div>
      </div>

      {!isRatingMonthAvailable && (
        <div className="no-data" style={{ marginBottom: "12px" }}>
          Rating unavailable for {formatMonthLabel(selectedMonth)}. Workers can only rate in {formatMonthLabel(allowedRatingMonth)}.
        </div>
      )}

      {loading ? (
        <div className="loading">Loading workers...</div>
      ) : filteredWorkers.length === 0 ? (
        <div className="no-data">
          {searchTerm ? "No workers found matching your search." : "No workers to display."}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="workers-table worker-ratings-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Avg Rating</th>
                <th>Latest Rating</th>
                <th>Selected Month</th>
                <th>Last Comment</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((w, index) => (
                <tr key={w._id} className={isAlreadyRated(w._id) ? "rated-row" : ""}>
                  <td data-label="#"> {index + 1}</td>
                  <td data-label="Name">
                    <div className="worker-name-cell">
                      <div className="worker-badge">
                        {w.name.charAt(0).toUpperCase()}
                      </div>
                      {w.name}
                    </div>
                  </td>
                  <td data-label="Avg Rating">
                    {typeof w.monthAverageRating === "number" ? (
                      <span
                        className="rating-badge"
                        style={{ backgroundColor: getRatingColor(w.monthAverageRating) }}
                      >
                        {w.monthAverageRating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="rating-badge rating-badge--none">-</span>
                    )}
                  </td>

                  <td className="latest-rating-cell" data-label="Latest Rating">
                    {w.latestRating ? (() => {
                      const scores = KPI_FIELDS.map((f) => w.latestRating[f.key] ?? 0);
                      const avg = scores.reduce((a, b) => a + b, 0) / KPI_FIELDS.length;

                      const lowest = KPI_FIELDS
                        .map((f) => ({ ...f, value: w.latestRating[f.key] ?? 0 }))
                        .sort((a, b) => a.value - b.value)[0];

                      return (
                        <div className="rating-summary">
                          <div
                            className="summary-avg"
                            style={{ backgroundColor: getRatingColor(avg) }}
                          >
                            {avg.toFixed(1)} avg
                          </div>

                          <div className="summary-low">
                            low {lowest.short}: {lowest.value}
                          </div>

                          <small className="rating-timestamp">
                            {formatDate(w.latestRating.createdAt)}
                            {ratedThisMonth(w) && (
                              <span className="today-tag">selected month</span>
                            )}
                          </small>
                        </div>
                      );
                    })() : (
                      <span className="text-muted">No ratings yet</span>
                    )}
                  </td>

                  <td className="action-cell" data-label="Action">
                    {isAlreadyRated(w._id) ? (
                      ratedWorkerMap[String(w._id)]?.workerEditRequestStatus === "pending" ? (
                        <span className="status-badge">Edit Pending</span>
                      ) : ratedWorkerMap[String(w._id)]?.workerEditRequestStatus === "approved" ? (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleEditWorker(w)}
                          title={`Edit your rating for ${selectedMonth}`}
                        >
                          Edit
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleRequestEdit(w._id)}
                          title="Ask admin to unlock this rating for editing"
                        >
                          Request Edit
                        </button>
                      )
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleRateWorker(w)}
                        title={`Rate this colleague for ${selectedMonth}`}
                        disabled={!isRatingMonthAvailable}
                      >
                        Rate
                      </button>
                    )}
                  </td>

                  <td className="comment-cell" data-label="Last Comment">
                    {w.latestRating?.comment ? (
                      <div className="comment-preview" title={w.latestRating.comment}>
                        <span className="comment-text">{w.latestRating.comment.substring(0, 40)}{w.latestRating.comment.length > 40 ? "..." : ""}</span>
                      </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
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

export default WorkerRatings;

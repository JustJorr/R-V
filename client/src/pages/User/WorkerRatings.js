import { useState, useEffect, useCallback, useMemo } from "react";
import { supervisorService } from "../../services/api";
import { getRatingColor, getRatingStatus } from "../../utils/helpers";
import { useNavigate } from "react-router-dom";
import RatingForm from "../../components/RatingForm";
import "../../styles/Supervisor/SupervisorPages.css";

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

function getCurrentMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getPreviousMonthKey() {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
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
  const [ratedWorkerIds, setRatedWorkerIds] = useState(new Set());
  const [isEditingRating, setIsEditingRating] = useState(false);
  const [existingRatingData, setExistingRatingData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const navigate = useNavigate();

  const currentMonth = getCurrentMonthKey();
  const previousMonth = getPreviousMonthKey();

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

  const fetchWorkerRatings = useCallback(async () => {
    if (!worker?._id) {
      setRatedWorkerIds(new Set());
      return;
    }
    try {
      const response = await supervisorService.getSupervisorRatings(worker._id, selectedMonth);
      const ratedIds = new Set((response.data || []).map(rating => rating.ratedUser));
      setRatedWorkerIds(ratedIds);
    } catch (err) {
      console.error("Error fetching worker ratings:", err);
    }
  }, [worker?._id, selectedMonth]);

  useEffect(() => {
    fetchWorkers();
    fetchWorkerRatings();
  }, [fetchWorkers, fetchWorkerRatings]);

  const handleRatingSuccess = () => {
    setRatingWorker(null);
    fetchWorkers();
    fetchWorkerRatings();
  };

  const isAlreadyRated = useCallback((workerId) => ratedWorkerIds.has(workerId), [ratedWorkerIds]);

  const handleRateWorker = (w) => {
    setRatingWorker(w);
    setIsEditingRating(false);
    setExistingRatingData(null);
  };

  const handleEditRating = async (targetWorker) => {
    if (!worker?._id) return;
    try {
      const response = await supervisorService.getExistingRating(worker._id, targetWorker._id, selectedMonth);
      setRatingWorker(targetWorker);
      setIsEditingRating(true);
      setExistingRatingData(response.data);
    } catch (err) {
      console.error("Error fetching rating for editing:", err);
      alert(`Could not load rating for ${selectedMonth}`);
    }
  };

  const ratedThisMonth = useCallback((w) => {
    if (!w.latestRating) return false;
    const ratingMonth = w.latestRating.dateKey ||
      new Date(w.latestRating.createdAt).toISOString().slice(0, 7);
    return ratingMonth === selectedMonth;
  }, [selectedMonth]);

  const { filteredWorkers, ratedCount, unratedCount } = useMemo(() => {
    const ratedWorkers = workers.filter(w => isAlreadyRated(w._id)).length;
    const unratedWorkers = workers.length - ratedWorkers;
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const list = workers
      .filter(w => {
        const matchesSearch =
          w.name.toLowerCase().includes(normalizedSearch) ||
          w.email.toLowerCase().includes(normalizedSearch);
        const matchesFilter =
          filterStatus === "all" ||
          (filterStatus === "rated" && isAlreadyRated(w._id)) ||
          (filterStatus === "unrated" && !isAlreadyRated(w._id));
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
      {ratingWorker && (
        <RatingForm
          worker={ratingWorker}
          userId={worker?._id}
          onSuccess={handleRatingSuccess}
          onCancel={() => setRatingWorker(null)}
          isEditing={isEditingRating}
          initialValues={existingRatingData}
          selectedMonth={selectedMonth}
        />
      )}

      <div className="page-header">
        <h1>Rate Colleagues</h1>
        <p>Give feedback to your teammates · view history any time</p>
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
            placeholder="🔍 Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sort-group">
          <label htmlFor="details-sort">Sort</label>
          <select
            id="details-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Name (A-Z)</option>
            <option value="rating">Highest Rating</option>
            <option value="recent">Latest Activity</option>
          </select>
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

        <div className="filter-buttons">
          <button
            className={`filter-btn ${selectedMonth === currentMonth ? "active" : ""}`}
            onClick={() => setSelectedMonth(currentMonth)}
          >
            This Month
          </button>
          <button
            className={`filter-btn ${selectedMonth === previousMonth ? "active" : ""}`}
            onClick={() => setSelectedMonth(previousMonth)}
          >
            Last Month
          </button>
        </div>

        <div className="quick-stat-pill">
          <span className="label">Viewing Month</span>
          <span className="value">{formatMonthLabel(selectedMonth)}</span>
        </div>
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
                <th>Total Ratings</th>
                <th>Status</th>
                <th>Latest Rating</th>
                <th>Selected Month</th>
                <th>Last Comment</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((w, index) => (
                <tr key={w._id} className={isAlreadyRated(w._id) ? "rated-row" : ""}>
                  <td>{index + 1}</td>
                  <td>
                    <div
                      className="worker-name-cell clickable"
                      onClick={() => navigate(`/worker/${w._id}`)}
                    >
                      <div className="worker-badge">
                        {w.name.charAt(0).toUpperCase()}
                      </div>
                      {w.name}
                    </div>
                  </td>
                  <td className="worker-email">{w.email}</td>
                  <td>
                    {typeof w.monthAverageRating === "number" ? (
                      <span
                        className="rating-badge"
                        style={{ backgroundColor: getRatingColor(w.monthAverageRating) }}
                      >
                        {w.monthAverageRating.toFixed(1)} ★
                      </span>
                    ) : (
                      <span className="rating-badge rating-badge--none">—</span>
                    )}
                  </td>
                  <td className="center">{w.totalRatings}</td>
                  <td className="center">
                    <span
                      className={`status-badge ${getRatingStatus(w.averageRating)
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {getRatingStatus(w.averageRating)}
                    </span>
                  </td>
                  <td className="latest-rating-cell">
                    {w.latestRating ? (() => {
                      const scores = KPI_FIELDS.map(f => w.latestRating[f.key] ?? 0);
                      const avg = scores.reduce((a, b) => a + b, 0) / KPI_FIELDS.length;

                      const lowest = KPI_FIELDS
                        .map(f => ({ ...f, value: w.latestRating[f.key] ?? 0 }))
                        .sort((a, b) => a.value - b.value)[0];

                      return (
                        <div className="rating-summary">
                          {/* ⭐ Average */}
                          <div
                            className="summary-avg"
                            style={{ backgroundColor: getRatingColor(avg) }}
                          >
                            {avg.toFixed(1)} ★
                          </div>

                          {/* ⚠️ Weakest KPI */}
                          <div className="summary-low">
                            ↓ {lowest.short}: {lowest.value}
                          </div>

                          {/* 📅 Date */}
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

                  <td className="action-cell">
                    {isAlreadyRated(w._id) ? (
                      <button
                        className="btn btn-edit"
                        onClick={() => handleEditRating(w)}
                        title={`Edit rating for ${selectedMonth}`}
                      >
                        ✏️ Edit
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleRateWorker(w)}
                        title={`Rate this colleague for ${selectedMonth}`}
                      >
                        ⭐ Rate
                      </button>
                    )}
                  </td>

                  <td className="comment-cell">
                    {w.latestRating?.comment ? (
                      <div className="comment-preview" title={w.latestRating.comment}>
                        <span className="comment-text">{w.latestRating.comment.substring(0, 40)}{w.latestRating.comment.length > 40 ? "..." : ""}</span>
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
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

import { useState, useEffect, useCallback, useMemo } from "react";
import { supervisorService } from "../../services/api";
import { getRatingColor, getRatingStatus } from "../../utils/helpers";
import { useNavigate } from "react-router-dom";
import RatingForm from "../../components/RatingForm";
import "../../styles/Supervisor/SupervisorPages.css";
import "../../styles/User/WorkerDashboard.css";

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

function getPreviousMonthKey() {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString(undefined, {
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

function SupervisorRatings({ worker: supervisor }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingWorker, setRatingWorker] = useState(null);
  const [ratedWorkerIds, setRatedWorkerIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedMonth, setSelectedMonth] = useState(getPreviousMonthKey());
  const [filterMonth, setFilterMonth] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const navigate = useNavigate();

  const previousMonth = getPreviousMonthKey();
  const isRatingMonthAvailable = selectedMonth === previousMonth;

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await supervisorService.getDashboard(selectedMonth);
      setWorkers(response.data || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  const fetchSupervisorRatings = useCallback(async () => {
    if (!supervisor?._id) {
      setRatedWorkerIds(new Set());
      return;
    }
    try {
      const response = await supervisorService.getSupervisorRatings(supervisor._id, selectedMonth);
      const ratedIds = new Set((response.data || []).map((r) => r.ratedUser));
      setRatedWorkerIds(ratedIds);
    } catch (err) {
      console.error("Error fetching supervisor ratings:", err);
    }
  }, [supervisor?._id, selectedMonth]);

  useEffect(() => {
    fetchDashboardData();
    fetchSupervisorRatings();
  }, [fetchDashboardData, fetchSupervisorRatings]);

  const handleApplyFilter = () => {
    const month = filterMonth || previousMonth;
    setSelectedMonth(month);
    setActiveFilter(filterMonth ? `Month: ${filterMonth}` : "");
  };

  const handleResetFilter = () => {
    setFilterMonth("");
    setActiveFilter("");
    setSelectedMonth(previousMonth);
  };

  const handleRatingSuccess = () => {
    setRatingWorker(null);
    fetchDashboardData();
    fetchSupervisorRatings();
  };

  const isAlreadyRated = useCallback((workerId) => ratedWorkerIds.has(workerId), [ratedWorkerIds]);

  const handleRateWorker = (worker) => {
    setRatingWorker(worker);
  };

  const ratedThisMonth = useCallback((worker) => {
    if (!worker.latestRating) return false;
    const ratingMonth = worker.latestRating.dateKey ||
      new Date(worker.latestRating.createdAt).toISOString().slice(0, 7);
    return ratingMonth === selectedMonth;
  }, [selectedMonth]);

  const { filteredWorkers, ratedCount, unratedCount } = useMemo(() => {
    const ratedWorkers = workers.filter((w) => isAlreadyRated(w._id)).length;
    const unratedWorkers = workers.length - ratedWorkers;
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const list = workers
      .filter((worker) => {
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
      {ratingWorker && (
        <RatingForm
          worker={ratingWorker}
          userId={supervisor?._id}
          onSuccess={handleRatingSuccess}
          onCancel={() => setRatingWorker(null)}
          isEditing={false}
          initialValues={null}
          selectedMonth={selectedMonth}
        />
      )}

      <div className="page-header">
        <h1>Worker Details and Ratings</h1>
        <p>Rate workers for completed month only</p>
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
          <span className="label">Rated in Month</span>
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

        <div className="quick-stat-pill">
          <span className="label">Viewing Month</span>
          <span className="value">{formatMonthLabel(selectedMonth)}</span>
        </div>
      </div>

      {!isRatingMonthAvailable && (
        <div className="no-data" style={{ marginBottom: "12px" }}>
          Rating unavailable for {formatMonthLabel(selectedMonth)}. Rating is only available in {formatMonthLabel(previousMonth)}.
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
          <table className="workers-table supervisor-ratings-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Avg Rating</th>
                <th>Sessions</th>
                <th>Status</th>
                <th>Latest Rating</th>
                <th>Selected Month</th>
                <th>Last Comment</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((worker, index) => (
                <tr key={worker._id} className={isAlreadyRated(worker._id) ? "rated-row" : ""}>
                  <td data-label="#">{index + 1}</td>
                  <td data-label="Name">
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
                  <td className="worker-email" data-label="Email">{worker.email}</td>
                  <td data-label="Avg Rating">
                    {typeof worker.monthAverageRating === "number" ? (
                      <span
                        className="rating-badge"
                        style={{ backgroundColor: getRatingColor(worker.monthAverageRating) }}
                      >
                        {Number(worker.monthAverageRating).toFixed(1)} *
                      </span>
                    ) : (
                      <span className="rating-badge rating-badge--none">-</span>
                    )}
                  </td>
                  <td className="center" data-label="Sessions">{worker.totalRatings}</td>
                  <td className="center" data-label="Status">
                    <span className={`status-badge ${getRatingStatus(worker.averageRating).toLowerCase().replace(/\s+/g, "-")}`}>
                      {getRatingStatus(worker.averageRating)}
                    </span>
                  </td>
                  <td className="latest-rating-cell" data-label="Latest Rating">
                    {worker.latestRating ? (() => {
                      const scores = KPI_FIELDS.map((f) => worker.latestRating[f.key] ?? 0);
                      const avg = scores.reduce((a, b) => a + b, 0) / KPI_FIELDS.length;

                      const lowest = KPI_FIELDS
                        .map((f) => ({ ...f, value: worker.latestRating[f.key] ?? 0 }))
                        .sort((a, b) => a.value - b.value)[0];

                      return (
                        <div className="rating-summary">
                          <div
                            className="summary-avg"
                            style={{ backgroundColor: getRatingColor(avg) }}
                          >
                            {avg.toFixed(1)} *
                          </div>

                          <div className="summary-low">
                            v {lowest.short}: {lowest.value}
                          </div>

                          <small className="rating-timestamp">
                            {formatDate(worker.latestRating.createdAt)}
                            {ratedThisMonth(worker) && (
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
                    {isAlreadyRated(worker._id) ? (
                      <span className="status-badge excellent">Rated</span>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleRateWorker(worker)}
                        title={`Rate this worker for ${selectedMonth}`}
                        disabled={!isRatingMonthAvailable}
                      >
                        Rate
                      </button>
                    )}
                  </td>

                  <td className="comment-cell" data-label="Last Comment">
                    {worker.latestRating?.comment ? (
                      <div className="comment-preview" title={worker.latestRating.comment}>
                        <span className="comment-text">{worker.latestRating.comment.substring(0, 40)}{worker.latestRating.comment.length > 40 ? "..." : ""}</span>
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

export default SupervisorRatings;

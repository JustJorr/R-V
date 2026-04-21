import { useState, useEffect, useCallback, useMemo } from "react";
import { supervisorService } from "../../services/api";
import { getRatingColor, getRatingStatus } from "../../utils/helpers";
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

function SupervisorDetails({ worker: supervisor }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingWorker, setRatingWorker] = useState(null);
  const [ratedWorkerIds, setRatedWorkerIds] = useState(new Set());
  const [isEditingRating, setIsEditingRating] = useState(false);
  const [existingRatingData, setExistingRatingData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [refreshing, setRefreshing] = useState(false);

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
      const ratedIds = new Set((response.data || []).map(rating => rating.ratedUser));
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

  const isAlreadyRated = useCallback((workerId) => ratedWorkerIds.has(workerId), [ratedWorkerIds]);

  const handleRateWorker = (worker) => {
    setRatingWorker(worker);
    setIsEditingRating(false);
    setExistingRatingData(null);
  };

  const handleEditRating = async (worker) => {
    if (!supervisor?._id) return;

    try {
      const response = await supervisorService.getExistingRating(supervisor._id, worker._id);
      setRatingWorker(worker);
      setIsEditingRating(true);
      setExistingRatingData(response.data);
    } catch (err) {
      console.error("Error fetching rating for editing:", err);
      alert("Could not load rating for editing");
    }
  };

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
        if (sortBy === "rating") {
          return (b.averageRating || 0) - (a.averageRating || 0);
        }

        if (sortBy === "recent") {
          const aDate = a.latestRating?.createdAt ? new Date(a.latestRating.createdAt).getTime() : 0;
          const bDate = b.latestRating?.createdAt ? new Date(b.latestRating.createdAt).getTime() : 0;
          return bDate - aDate;
        }

        return a.name.localeCompare(b.name);
      });

    return {
      filteredWorkers: list,
      ratedCount: ratedWorkers,
      unratedCount: unratedWorkers
    };
  }, [workers, searchTerm, filterStatus, sortBy, isAlreadyRated]);

  return (
    <div className="page-content supervisor-details">
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

      <div className="page-header">
        <h1>Worker Details and Ratings</h1>
        <p>Manage and rate worker performance</p>
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

        <button
          className="btn btn-refresh"
          onClick={fetchDashboardData}
          disabled={refreshing}
        >
          {refreshing ? "⏳ Refreshing..." : "🔄 Refresh"}
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
                <th>Total Ratings</th>
                <th>Status</th>
                <th>Latest Rating</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((worker, index) => (
                <tr key={worker._id} className={isAlreadyRated(worker._id) ? "rated-row" : ""}>
                  <td>{index + 1}</td>
                  <td> 
                    <div className="worker-name-cell">
                      <div className="worker-badge">{worker.name.charAt(0).toUpperCase()}</div>
                      {worker.name}
                      </div>
                  </td>
                  <td className="worker-email">{worker.email}</td>
                  <td>
                    <span
                      className="rating-badge"
                      style={{ backgroundColor: getRatingColor(worker.averageRating) }}
                    >
                      {worker.totalRatings > 0 ? worker.averageRating.toFixed(1) : "—"}★
                    </span>
                  </td>
                  <td className="center">{worker.totalRatings}</td>
                  <td className="center">
                    <span
                      className={`status-badge ${getRatingStatus(worker.averageRating)
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {getRatingStatus(worker.averageRating)}
                    </span>
                  </td>
                  <td className="latest-rating-cell">
                    {worker.latestRating ? (
                      <div className="rating-info">
                        <div className="rating-fields">
                          {ratingFields.map(f => (
                            <span key={f.key} className="field-badge">
                              {f.short}: {worker.latestRating[f.key] ?? 0}★
                            </span>
                          ))}
                        </div>
                        <small className="rating-timestamp">
                          {new Date(worker.latestRating.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    ) : (
                      <span className="text-muted">No ratings</span>
                    )}
                  </td>
                  <td className="action-cell">
                    {isAlreadyRated(worker._id) ? (
                      <button
                        className="btn btn-edit"
                        onClick={() => handleEditRating(worker)}
                        title="Click to edit your rating"
                      >
                        ✏️ Edit
                      </button>
                    ) : (
                      <button className="btn btn-primary" onClick={() => handleRateWorker(worker)}>
                        ⭐ Rate
                      </button>
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

export default SupervisorDetails;

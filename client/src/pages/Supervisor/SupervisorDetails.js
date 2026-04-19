import { useState, useEffect, useCallback } from "react";
import { supervisorService } from "../../services/api";
import { getRatingColor, getRatingStatus } from "../../utils/helpers";
import RatingForm from "../../components/RatingForm";
import "../../styles/Supervisor/SupervisorPages.css";

function SupervisorDetails({ worker }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingWorker, setRatingWorker] = useState(null);
  const [ratedWorkerIds, setRatedWorkerIds] = useState(new Set());
  const [isEditingRating, setIsEditingRating] = useState(false);
  const [existingRatingData, setExistingRatingData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await supervisorService.getDashboard();
      setWorkers(response.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSupervisorRatings = useCallback(async () => {
    try {
      const response = await supervisorService.getSupervisorRatings(worker._id);
      const ratedIds = new Set(response.data.map(rating => rating.ratedUser));
      setRatedWorkerIds(ratedIds);
    } catch (err) {
      console.error("Error fetching supervisor ratings:", err);
    }
  }, [worker._id]);

  useEffect(() => {
    fetchDashboardData();
    fetchSupervisorRatings();
  }, [fetchDashboardData, fetchSupervisorRatings]);

  const handleRatingSuccess = () => {
    setRatingWorker(null);
    fetchDashboardData();
    fetchSupervisorRatings();
  };

  const isAlreadyRated = (workerId) => ratedWorkerIds.has(workerId);

  const handleRateWorker = (worker) => {
    setRatingWorker(worker);
    setIsEditingRating(false);
    setExistingRatingData(null);
  };

  const handleEditRating = async (worker) => {
    try {
      const response = await supervisorService.getExistingRating(worker._id, worker._id);
      setRatingWorker(worker);
      setIsEditingRating(true);
      setExistingRatingData(response.data);
    } catch (err) {
      console.error("Error fetching rating for editing:", err);
      alert("Could not load rating for editing");
    }
  };

  // Filter and search workers
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          worker.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || 
                          (filterStatus === "rated" && isAlreadyRated(worker._id)) ||
                          (filterStatus === "unrated" && !isAlreadyRated(worker._id));
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page-content supervisor-details">
      {ratingWorker && (
        <RatingForm
          worker={ratingWorker}
          userId={worker._id}
          onSuccess={handleRatingSuccess}
          onCancel={() => setRatingWorker(null)}
          isEditing={isEditingRating}
          initialValues={existingRatingData}
        />
      )}

      <div className="page-header">
        <h1>Worker Details & Ratings</h1>
        <p>Manage and rate worker performance</p>
      </div>

      {/* Search and Filter Bar */}
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
            Rated ({ratedWorkerIds.size})
          </button>
          <button 
            className={`filter-btn ${filterStatus === "unrated" ? "active" : ""}`}
            onClick={() => setFilterStatus("unrated")}
          >
            Unrated ({workers.length - ratedWorkerIds.size})
          </button>
        </div>
      </div>

      {/* Workers Table */}
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
                  <td className="worker-name-cell">
                    <div className="worker-badge">{worker.name.charAt(0).toUpperCase()}</div>
                    {worker.name}
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
                    <span className={`status-badge ${getRatingStatus(worker.averageRating).toLowerCase().replace(" ", "-")}`}>
                      {getRatingStatus(worker.averageRating)}
                    </span>
                  </td>
                  <td className="latest-rating-cell">
                    {worker.latestRating ? (
                      <div className="rating-info">
                        <div className="rating-fields">
                          <span className="field-badge">TS: {worker.latestRating.technicalSkills}★</span>
                          <span className="field-badge">CM: {worker.latestRating.communication}★</span>
                          <span className="field-badge">TW: {worker.latestRating.teamwork}★</span>
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
                      <button
                        className="btn btn-primary"
                        onClick={() => handleRateWorker(worker)}
                      >
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

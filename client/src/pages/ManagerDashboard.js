import { useState, useEffect, useCallback } from "react";
import { managerService } from "../services/api";
import { getRatingColor, getRatingStatus } from "../utils/helpers";
import RatingForm from "../components/RatingForm";
import "../styles/ManagerDashboard.css";

function ManagerDashboard({ user, onLogout }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingWorker, setRatingWorker] = useState(null);
  const [ratedWorkerIds, setRatedWorkerIds] = useState(new Set());
  const [isEditingRating, setIsEditingRating] = useState(false);
  const [existingRatingData, setExistingRatingData] = useState(null);
  const [stats, setStats] = useState({
    totalWorkers: 0,
    avgRating: 0,
    topWorker: null,
    bottomWorker: null
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await managerService.getDashboard();
      setWorkers(response.data);
      
      // Calculate stats
      if (response.data.length > 0) {
        const totalRating = response.data.reduce((sum, w) => sum + w.averageRating, 0);
        const avgRating = (totalRating / response.data.length).toFixed(2);
        const topWorker = response.data[0];
        const bottomWorker = response.data[response.data.length - 1];
        
        setStats({
          totalWorkers: response.data.length,
          avgRating,
          topWorker,
          bottomWorker
        });
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchManagerRatings = useCallback(async () => {
    try {
      // Get all ratings made by this manager
      const response = await managerService.getManagerRatings(user._id);
      const ratedIds = new Set(response.data.map(rating => rating.ratedUser));
      setRatedWorkerIds(ratedIds);
    } catch (err) {
      console.error("Error fetching manager ratings:", err);
    }
  }, [user._id]);

  useEffect(() => {
    fetchDashboardData();
    fetchManagerRatings();
  }, [fetchDashboardData, fetchManagerRatings]);

  const handleRatingSuccess = () => {
    setRatingWorker(null);
    fetchDashboardData();
    fetchManagerRatings();
  };

  const isAlreadyRated = (workerId) => ratedWorkerIds.has(workerId);

  const handleRateWorker = (worker) => {
    setRatingWorker(worker);
    setIsEditingRating(false);
    setExistingRatingData(null);
  };

  const handleEditRating = async (worker) => {
    try {
      const response = await managerService.getExistingRating(user._id, worker._id);
      setRatingWorker(worker);
      setIsEditingRating(true);
      setExistingRatingData(response.data);
    } catch (err) {
      console.error("Error fetching rating for editing:", err);
      alert("Could not load rating for editing");
    }
  };

  return (
    <div className="manager-dashboard">
      {/* Rating Form Modal */}
      {ratingWorker && (
        <RatingForm
          worker={ratingWorker}
          userId={user._id}
          onSuccess={handleRatingSuccess}
          onCancel={() => setRatingWorker(null)}
          isEditing={isEditingRating}
          initialValues={existingRatingData}
        />
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Manager Dashboard</h1>
          <p>Welcome, {user.name}</p>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Workers</h3>
          <p className="stat-number">{stats.totalWorkers}</p>
        </div>
        <div className="stat-card">
          <h3>Average Rating</h3>
          <p className="stat-number" style={{ color: getRatingColor(stats.avgRating) }}>
            {stats.avgRating}★
          </p>
        </div>
        <div className="stat-card">
          <h3>Top Performer</h3>
          <p className="stat-text">
            {stats.topWorker ? `${stats.topWorker.name}` : "N/A"}
          </p>
          {stats.topWorker && (
            <p className="stat-rating">{stats.topWorker.averageRating}★</p>
          )}
        </div>
        <div className="stat-card">
          <h3>Needs Support</h3>
          <p className="stat-text">
            {stats.bottomWorker && stats.bottomWorker.averageRating > 0 ? `${stats.bottomWorker.name}` : "N/A"}
          </p>
          {stats.bottomWorker && stats.bottomWorker.averageRating > 0 && (
            <p className="stat-rating">{stats.bottomWorker.averageRating}★</p>
          )}
        </div>
      </div>

      {/* Workers Table */}
      <div className="workers-section">
        <h2>Workers Overview</h2>
        
        {loading ? (
          <div className="loading">Loading workers...</div>
        ) : workers.length === 0 ? (
          <div className="no-data">No workers found in the system.</div>
        ) : (
          <div className="table-container">
            <table className="workers-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Average Rating</th>
                  <th>Total Ratings</th>
                  <th>Status</th>
                  <th>Latest Rating</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker, index) => (
                  <tr key={worker._id}>
                    <td>{index + 1}</td>
                    <td className="worker-name">{worker.name}</td>
                    <td className="worker-email">{worker.email}</td>
                    <td>
                      <span className="rating-badge" style={{ backgroundColor: getRatingColor(worker.averageRating) }}>
                        {worker.totalRatings > 0 ? worker.averageRating.toFixed(1) : "—"}★
                      </span>
                    </td>
                    <td className="center">{worker.totalRatings}</td>
                    <td className="center">
                      <span className="status-badge">
                        {getRatingStatus(worker.averageRating)}
                      </span>
                    </td>
                    <td className="latest-rating">
                      {worker.latestRating ? (
                        <div>
                          <p className="rating-fields">
                            <span className="field">TS: {worker.latestRating.technicalSkills}★</span>
                            <span className="field">CM: {worker.latestRating.communication}★</span>
                            <span className="field">TW: {worker.latestRating.teamwork}★</span>
                          </p>
                          <p className="rating-rater">
                            by {worker.latestRating.ratedBy ? worker.latestRating.ratedBy.name : "Unknown"}
                          </p>
                          <p className="rating-time">
                            {new Date(worker.latestRating.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <span>No ratings</span>
                      )}
                    </td>
                    <td className="action-cell">
                      {isAlreadyRated(worker._id) ? (
                        <button 
                          className="rate-btn rated" 
                          onClick={() => handleEditRating(worker)}
                          title="Click to edit your rating"
                        >
                          ✓ Rated
                        </button>
                      ) : (
                        <button
                          className="rate-btn"
                          onClick={() => handleRateWorker(worker)}
                        >
                          Rate
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

      {/* Additional Info */}
      <div className="info-section">
        <h3>System Information</h3>
        <div className="info-cards">
          <div className="info-card">
            <strong>Your Role:</strong> Manager
          </div>
          <div className="info-card">
            <strong>Login Time:</strong> {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;

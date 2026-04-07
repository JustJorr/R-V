import { useState, useEffect, useCallback } from "react";
import { usersService, managerService } from "../../services/api";
import RatingForm from "../../components/RatingForm";
import "../../styles/Manager/ManagerPages.css";

function WorkerRatings({ user }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingWorker, setRatingWorker] = useState(null);
  const [existingRatings, setExistingRatings] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // 🔥 Fetch workers
  const fetchWorkers = useCallback(async () => {
    try {
      setLoading(true);

      const res = await usersService.getAllUsers();

      const filtered = res.data.filter(
        (u) => u.role === "user" && u._id !== user._id
      );

      setWorkers(filtered);

      // 🔥 get existing ratings
      const ratingsMap = {};

      for (let worker of filtered) {
        try {
          const r = await managerService.getExistingRating(
            user._id,
            worker._id
          );

          if (r.data) {
            ratingsMap[worker._id] = r.data;
          }
        } catch {}
      }

      setExistingRatings(ratingsMap);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleSuccess = () => {
    setRatingWorker(null);
    fetchWorkers();
  };

  const filteredWorkers = workers.filter((w) =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-content manager-details">

      {/* Modal */}
      {ratingWorker && (
        <RatingForm
          worker={ratingWorker}
          userId={user._id}
          onSuccess={handleSuccess}
          onCancel={() => setRatingWorker(null)}
          isEditing={!!existingRatings[ratingWorker._id]}
          initialValues={existingRatings[ratingWorker._id]}
        />
      )}

      {/* Header */}
      <div className="page-header">
        <h1>Rate Colleagues</h1>
        <p>Give anonymous feedback to your teammates</p>
      </div>

      {/* Search */}
      <div className="details-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search workers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading">Loading workers...</div>
      ) : filteredWorkers.length === 0 ? (
        <div className="no-data">No workers found.</div>
      ) : (
        <div className="table-responsive">
          <table className="workers-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredWorkers.map((worker, index) => {
                const existing = existingRatings[worker._id];

                return (
                  <tr key={worker._id} className={existing ? "rated-row" : ""}>
                    <td>{index + 1}</td>

                    <td className="worker-name-cell">
                      <div className="worker-badge">
                        {worker.name.charAt(0).toUpperCase()}
                      </div>
                      {worker.name}
                    </td>

                    <td className="worker-email">{worker.email}</td>

                    <td className="center">
                      <span className={`status-badge ${existing ? "excellent" : "average"}`}>
                        {existing ? "Rated" : "Not Rated"}
                      </span>
                    </td>

                    <td className="action-cell">
                      <button
                        className={`btn ${existing ? "btn-edit" : "btn-primary"}`}
                        onClick={() => setRatingWorker(worker)}
                      >
                        {existing ? "✏️ Edit" : "⭐ Rate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
}

export default WorkerRatings;
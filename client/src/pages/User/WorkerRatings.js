import { useEffect, useState, useCallback } from "react";
import { usersService, managerService } from "../../services/api";
import RatingForm from "../../components/RatingForm";
import "../../styles/User/WorkerDashboard.css";

function WorkerRatings({ user }) {
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [existingRatings, setExistingRatings] = useState({});
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch workers + existing ratings
  const fetchWorkers = useCallback(async () => {
    try {
      const res = await usersService.getAllUsers();

      const filtered = res.data.filter(
        (u) => u.role === "user" && u._id !== user._id
      );

      setWorkers(filtered);

      // 🔥 Check existing ratings (same logic as manager)
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
        } catch {
          // no rating yet → ignore
        }
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

  return (
    <div className="worker-dashboard">
      <div className="page-header">
        <h1>Rate Colleagues</h1>
        <p>Give feedback to your teammates</p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="features-grid">
          {workers.map((worker) => {
            const existing = existingRatings[worker._id];

            return (
              <div key={worker._id} className="feature-card">
                <h3>{worker.name}</h3>
                <p>{worker.email}</p>

                <button
                  className={`action-btn ${existing ? "outline" : ""}`}
                  onClick={() => setSelectedWorker(worker)}
                >
                  {existing ? "✏️ Edit Rating" : "⭐ Rate"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 🔥 Modal */}
      {selectedWorker && (
        <RatingForm
          worker={selectedWorker}
          userId={user._id}
          isEditing={!!existingRatings[selectedWorker._id]}
          initialValues={existingRatings[selectedWorker._id]}
          onSuccess={() => {
            setSelectedWorker(null);
            fetchWorkers();
          }}
          onCancel={() => setSelectedWorker(null)}
        />
      )}
    </div>
  );
}

export default WorkerRatings;
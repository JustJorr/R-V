import { useEffect, useState, useCallback } from "react";
import { usersService } from "../../services/api";
import RatingForm from "../../components/RatingForm";
import "../../styles/User/WorkerDashboard.css";

function WorkerRatings({ user }) {
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Wrap in useCallback
  const fetchWorkers = useCallback(async () => {
    try {
      const res = await usersService.getAllUsers();

      const filtered = res.data.filter(
        (u) => u.role === "worker" && u._id !== user._id
      );

      setWorkers(filtered);
    } catch (err) {
      console.error("Error fetching workers", err);
    } finally {
      setLoading(false);
    }
  }, [user._id]); // ✅ dependency here

  // ✅ useEffect now depends on fetchWorkers
  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  return (
    <div className="worker-dashboard">
      <h1>Rate Colleagues</h1>

      {loading ? (
        <p>Loading workers...</p>
      ) : (
        <div className="features-grid">
          {workers.map((worker) => (
            <div key={worker._id} className="feature-card">
              <h3>{worker.name}</h3>
              <p>{worker.email}</p>

              <button
                className="action-btn"
                onClick={() => setSelectedWorker(worker)}
              >
                ⭐ Rate
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Now works again */}
      {selectedWorker && (
        <RatingForm
          worker={selectedWorker}
          userId={user._id}
          onSuccess={() => {
            setSelectedWorker(null);
            fetchWorkers(); // ✅ works
          }}
          onCancel={() => setSelectedWorker(null)}
        />
      )}
    </div>
  );
}

export default WorkerRatings;
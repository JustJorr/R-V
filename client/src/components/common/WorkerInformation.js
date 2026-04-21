import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supervisorService } from "../../services/api";
import { getRatingColor, getRatingStatus } from "../../utils/helpers";
import "../../styles/common/WorkerInformation.css";

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

function WorkerInformation() {
  const { id } = useParams();

  const [worker, setWorker] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ DEFINE FIRST
  const fetchWorker = useCallback(async () => {
    try {
      setLoading(true);
      const res = await supervisorService.getWorkerById(id);
      setWorker(res.data.worker);
      setRatings(res.data.ratings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ✅ THEN USE
  useEffect(() => {
    fetchWorker();
  }, [fetchWorker]);

  if (loading) return <div className="wi-loading">Loading...</div>;
  if (!worker) return <div className="wi-error">Worker not found</div>;

  return (
    <div className="worker-info-page">
      {/* HEADER */}
      <div className="wi-header">
        <div className="wi-avatar">
          {worker.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1>{worker.name}</h1>
          <p>{worker.email}</p>
        </div>
      </div>

      {/* STATS */}
      <div className="wi-stats">
        <div className="wi-stat">
          <span>Average Rating</span>
          <strong style={{ color: getRatingColor(worker.averageRating) }}>
            {worker.averageRating?.toFixed(1) || "—"} ★
          </strong>
        </div>

        <div className="wi-stat">
          <span>Status</span>
          <strong>{getRatingStatus(worker.averageRating)}</strong>
        </div>

        <div className="wi-stat">
          <span>Total Ratings</span>
          <strong>{worker.totalRatings}</strong>
        </div>
      </div>

      {/* HISTORY */}
      <div className="wi-history">
        <h2>Rating History</h2>

        {ratings.length === 0 ? (
          <p>No ratings yet.</p>
        ) : (
          ratings.map(r => {
            const avg =
              KPI_FIELDS.reduce((sum, f) => sum + (r[f.key] || 0), 0) /
              KPI_FIELDS.length;

            return (
              <div key={r._id} className="wi-card">
                <div className="wi-card-header">
                  <span>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                  <span
                    className="wi-badge"
                    style={{ background: getRatingColor(avg) }}
                  >
                    {avg.toFixed(1)}★
                  </span>
                </div>

                <div className="wi-kpi-grid">
                  {KPI_FIELDS.map(f => (
                    <div key={f.key} className="wi-kpi">
                      <span>{f.short}</span>
                      <strong>{r[f.key]}</strong>
                    </div>
                  ))}
                </div>

                {r.comment && (
                  <p className="wi-comment">"{r.comment}"</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default WorkerInformation;
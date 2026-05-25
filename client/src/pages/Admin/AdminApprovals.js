import { useEffect, useState } from "react";
import { adminService } from "../../services/api";
import "../../styles/Admin/AdminPages.css";

function AdminApprovals() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionInProgress, setActionInProgress] = useState("");

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminService.getPendingWorkerApprovals();
      setWorkers(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load pending approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const handleApprove = async (workerId) => {
    try {
      setActionInProgress(workerId);
      setError("");
      await adminService.approveWorker(workerId);
      setWorkers(workers.filter((w) => w._id !== workerId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve worker");
    } finally {
      setActionInProgress("");
    }
  };

  const handleReject = async (workerId) => {
    try {
      setActionInProgress(workerId);
      setError("");
      await adminService.rejectWorker(workerId);
      setWorkers(workers.filter((w) => w._id !== workerId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject worker");
    } finally {
      setActionInProgress("");
    }
  };

  return (
    <div className="page-content admin-page">
      <div className="page-header">
        <h1>👷 Worker Approvals</h1>
        <p>Review and approve new worker registrations</p>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading">
          <span>⏳</span> Loading pending approvals...
        </div>
      ) : workers.length === 0 ? (
        <div className="admin-empty">
          <p>No pending worker approvals at this time.</p>
        </div>
      ) : (
        <div className="table-responsive admin-table">
          <table className="workers-table admin-home-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Registered At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => (
                <tr key={worker._id}>
                  <td data-label="Name">{worker.name}</td>
                  <td data-label="Email">{worker.email}</td>
                  <td data-label="Registered At">
                    {new Date(worker.createdAt).toLocaleString()}
                  </td>
                  <td data-label="Action">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleApprove(worker._id)}
                      disabled={actionInProgress === worker._id}
                      style={{ marginRight: 8 }}
                    >
                      {actionInProgress === worker._id ? "Processing..." : "✓ Approve"}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleReject(worker._id)}
                      disabled={actionInProgress === worker._id}
                    >
                      {actionInProgress === worker._id ? "Processing..." : "✕ Reject"}
                    </button>
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

export default AdminApprovals;

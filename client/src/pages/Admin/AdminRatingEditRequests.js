import { useEffect, useState } from "react";
import { adminService } from "../../services/api";
import "../../styles/Admin/AdminPages.css";

function AdminRatingEditRequests() {
  const admin = JSON.parse(localStorage.getItem("worker") || "{}");
  const [requests, setRequests] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [requestsRes, workersRes] = await Promise.all([
        adminService.getPendingRatingEditRequests(),
        adminService.getPendingWorkerApprovals()
      ]);
      setRequests(requestsRes.data || []);
      setWorkers(workersRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReview = async (ratingId, action) => {
    try {
      setSubmittingId(ratingId);
      await adminService.reviewRatingEditRequest(ratingId, admin._id, action);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} request.`);
    } finally {
      setSubmittingId("");
    }
  };

  const handleApprove = async (workerId) => {
    try {
      setSubmittingId(workerId);
      setError("");
      await adminService.approveWorker(workerId);
      setWorkers(workers.filter((w) => w._id !== workerId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve worker");
    } finally {
      setSubmittingId("");
    }
  };

  const handleReject = async (workerId) => {
    try {
      setSubmittingId(workerId);
      setError("");
      await adminService.rejectWorker(workerId);
      setWorkers(workers.filter((w) => w._id !== workerId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject worker");
    } finally {
      setSubmittingId("");
    }
  };

  return (
    <div className="page-content admin-page">
      <div className="page-header">
        <h1>📋 Approvals & Requests</h1>
        <p>Manage worker registrations and rating edit requests</p>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading">Loading data...</div>
      ) : (
        <>
          {/* ===== WORKER APPROVALS SECTION ===== */}
          <div className="admin-section admin-card" style={{ marginBottom: "40px" }}>
            <h2 className="section-title">👷 Worker Approvals</h2>
            {workers.length === 0 ? (
              <div className="admin-empty">No pending worker approvals.</div>
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
                            disabled={submittingId === worker._id}
                            style={{ marginRight: 8 }}
                          >
                            {submittingId === worker._id ? "Processing..." : "✓ Approve"}
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleReject(worker._id)}
                            disabled={submittingId === worker._id}
                          >
                            {submittingId === worker._id ? "Processing..." : "✕ Reject"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ===== RATING EDIT REQUESTS SECTION ===== */}
          <div className="admin-section admin-card">
            <h2 className="section-title">📝 Rating Edit Requests</h2>
            {requests.length === 0 ? (
              <div className="admin-empty">No pending edit requests.</div>
            ) : (
              <div className="table-responsive admin-table">
                <table className="workers-table admin-home-table">
                  <thead>
                    <tr>
                      <th>Worker (Rater)</th>
                      <th>Rated User</th>
                      <th>Month</th>
                      <th>Requested At</th>
                      <th>Reason</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r._id}>
                        <td data-label="Worker (Rater)">
                          {r.ratedBy?.name || "-"}
                          <div className="text-muted">{r.ratedBy?.email || "-"}</div>
                        </td>
                        <td data-label="Rated User">
                          {r.ratedUser?.name || "-"}
                          <div className="text-muted">{r.ratedUser?.email || "-"}</div>
                        </td>
                        <td data-label="Month">{r.dateKey || "-"}</td>
                        <td data-label="Requested At">
                          {r.workerEditRequestAt ? new Date(r.workerEditRequestAt).toLocaleString() : "-"}
                        </td>
                        <td data-label="Reason">{r.workerEditRequestReason || "-"}</td>
                        <td data-label="Action">
                          <button
                            className="btn btn-primary"
                            onClick={() => handleReview(r._id, "approve")}
                            disabled={submittingId === r._id}
                            style={{ marginRight: 8 }}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleReview(r._id, "reject")}
                            disabled={submittingId === r._id}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminRatingEditRequests;

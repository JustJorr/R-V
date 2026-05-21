import { useEffect, useState } from "react";
import { adminService } from "../../services/api";
import "../../styles/Admin/AdminPages.css";

function AdminRatingEditRequests() {
  const admin = JSON.parse(localStorage.getItem("worker") || "{}");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState("");
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminService.getPendingRatingEditRequests();
      setRequests(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load edit requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleReview = async (ratingId, action) => {
    try {
      setSubmittingId(ratingId);
      await adminService.reviewRatingEditRequest(ratingId, admin._id, action);
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} request.`);
    } finally {
      setSubmittingId("");
    }
  };

  return (
    <div className="page-content admin-page">
      <div className="page-header">
        <h1>Rating Edit Requests</h1>
        <p>Review and approve worker requests to edit submitted ratings</p>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="admin-empty">No pending requests.</div>
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
  );
}

export default AdminRatingEditRequests;

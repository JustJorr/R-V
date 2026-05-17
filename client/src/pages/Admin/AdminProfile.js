import { useEffect, useState } from "react";
import { usersService } from "../../services/api";
import "../../styles/Admin/AdminPages.css";

function AdminProfile({ worker, onLogout, onProfileUpdated }) {
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: worker?.name || "",
    email: worker?.email || "",
    role: worker?.role || "admin"
  });

  useEffect(() => {
    setFormData({
      name: worker?.name || "",
      email: worker?.email || "",
      role: worker?.role || "admin"
    });
  }, [worker]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!worker?._id) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await usersService.updateProfile(worker._id, { name: formData.name });
      onProfileUpdated?.(response.data);
      setMessage("Profile updated successfully.");
      setEditMode(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: worker?.name || "",
      email: worker?.email || "",
      role: worker?.role || "admin"
    });
    setMessage("");
    setError("");
    setEditMode(false);
  };

  return (
    <div className="page-content admin-page admin-profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>View and manage your account settings</p>
      </div>

      <div className="admin-profile-container">
        <div className="admin-profile-header">
          <div className="admin-profile-avatar">{worker?.name?.charAt(0)?.toUpperCase() || "A"}</div>
          <div className="admin-profile-headline">
            <h2>{worker?.name}</h2>
            <p>{worker?.email}</p>
            <span className="admin-profile-badge">{worker?.role?.toUpperCase()}</span>
          </div>
        </div>

        <div className="admin-profile-grid">
          <div className="admin-card">
            <h3>Account Information</h3>
            {editMode ? (
              <>
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="admin-input"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="admin-input"
                    disabled
                  />
                </div>
              </>
            ) : (
              <>
                <div className="admin-profile-row">
                  <span>Full Name</span>
                  <strong>{formData.name}</strong>
                </div>
                <div className="admin-profile-row">
                  <span>Email Address</span>
                  <strong>{formData.email}</strong>
                </div>
              </>
            )}
            <div className="admin-profile-row">
              <span>Account Role</span>
              <strong>{formData.role}</strong>
            </div>
          </div>

          <div className="admin-card">
            <h3>Statistics</h3>
            <div className="admin-profile-stats">
              <div className="admin-profile-stat"><span>Account Created</span><strong>{worker?.createdAt ? new Date(worker.createdAt).toLocaleDateString() : "Not available"}</strong></div>
              <div className="admin-profile-stat"><span>Average Rating</span><strong>{typeof worker?.averageRating === "number" ? worker.averageRating.toFixed(1) : "N/A"}</strong></div>
              <div className="admin-profile-stat"><span>Total Ratings</span><strong>{worker?.totalRatings ?? "N/A"}</strong></div>
              <div className="admin-profile-stat"><span>Account ID</span><strong>{worker?._id ? String(worker._id).slice(-8) : "N/A"}</strong></div>
            </div>
          </div>
        </div>

        <div className="admin-card admin-profile-full">
          <h3>Preferences</h3>
          <div className="admin-profile-pref">Receive email notifications</div>
          <div className="admin-profile-pref">Show admin dashboard tips</div>
        </div>

        <div className="admin-profile-actions" style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          {editMode ? (
            <>
              <button className="admin-btn primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button className="admin-btn secondary" onClick={handleCancel}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button className="admin-btn primary" onClick={() => setEditMode(true)}>
                Edit Profile
              </button>
              <button
                className="admin-btn primary"
                onClick={() => {
                  if (window.confirm("Are you sure you want to logout?")) {
                    onLogout();
                  }
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>

        {message && <p className="profile-success">{message}</p>}
        {error && <p className="profile-error">{error}</p>}
      </div>
    </div>
  );
}

export default AdminProfile;

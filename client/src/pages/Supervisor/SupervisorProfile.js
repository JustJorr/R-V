import { useEffect, useState } from "react";
import { usersService } from "../../services/api";
import "../../styles/Supervisor/SupervisorPages.css";

function SupervisorProfile({ worker, onLogout, onProfileUpdated }) {
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: worker?.name || "",
    email: worker?.email || "",
    role: worker?.role || "supervisor"
  });

  useEffect(() => {
    setFormData({
      name: worker?.name || "",
      email: worker?.email || "",
      role: worker?.role || "supervisor"
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
      role: worker?.role || "supervisor"
    });
    setMessage("");
    setError("");
    setEditMode(false);
  };

  return (
    <div className="page-content supervisor-profile">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>View and manage your account settings</p>
      </div>

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-large">{worker?.name?.charAt(0).toUpperCase()}</div>
          <div className="profile-header-info">
            <h2>{worker?.name}</h2>
            <p className="profile-email">{worker?.email}</p>
            <span className="profile-badge">{worker?.role?.toUpperCase()}</span>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-card">
            <h3>Account Information</h3>
            {editMode ? (
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" />
              </div>
            ) : (
              <div className="info-row"><span className="info-label">Full Name</span><span className="info-value">{formData.name}</span></div>
            )}

            {editMode ? (
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" disabled />
              </div>
            ) : (
              <div className="info-row"><span className="info-label">Email Address</span><span className="info-value">{formData.email}</span></div>
            )}

            <div className="info-row"><span className="info-label">Account Role</span><span className="info-value">{formData.role}</span></div>
          </div>

          <div className="profile-card">
            <h3>Statistics</h3>
            <div className="stats-list">
              <div className="stat-row"><span className="stat-label">Account Created</span><span className="stat-value">{worker?.createdAt ? new Date(worker.createdAt).toLocaleDateString() : "Not available"}</span></div>
              <div className="stat-row"><span className="stat-label">Average Rating</span><span className="stat-value">{typeof worker?.averageRating === "number" ? worker.averageRating.toFixed(1) : "N/A"}</span></div>
              <div className="stat-row"><span className="stat-label">Total Ratings Given</span><span className="stat-value">{worker?.totalRatings ?? "N/A"}</span></div>
            </div>
          </div>
        </div>

        <div className="profile-card full-width">
          <h3>Preferences</h3>
          <div className="preference-item"><div className="preference-content"><label><input type="checkbox" defaultChecked /> Receive email notifications</label><p className="preference-desc">Get notified about worker updates and system alerts</p></div></div>
          <div className="preference-item"><div className="preference-content"><label><input type="checkbox" defaultChecked /> Show tips and suggestions</label><p className="preference-desc">Display helpful tips when using the dashboard</p></div></div>
        </div>

        <div className="profile-actions">
          {editMode ? (
            <>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
              <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={() => setEditMode(true)}>Edit Profile</button>
              <button className="btn btn-primary" onClick={() => { if (window.confirm("Are you sure you want to logout?")) onLogout(); }}>Logout</button>
            </>
          )}
        </div>

        {message && <p className="profile-success">{message}</p>}
        {error && <p className="profile-error">{error}</p>}
      </div>
    </div>
  );
}

export default SupervisorProfile;

import { useState } from "react";
import "../../styles/Manager/ManagerPages.css";

function ManagerProfile({ worker }) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: worker?.name || "",
    email: worker?.email || "",
    role: worker?.role || "manager"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // In a real app, you'd make an API call to update the profile
    alert("Profile updated successfully!");
    setEditMode(false);
  };

  const handleCancel = () => {
    setFormData({
      name: worker?.name || "",
      email: worker?.email || "",
      role: worker?.role || "manager"
    });
    setEditMode(false);
  };

  return (
    <div className="page-content manager-profile">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>View and manage your account settings</p>
      </div>

      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-large">
            {worker?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-header-info">
            <h2>{worker?.name}</h2>
            <p className="profile-email">{worker?.email}</p>
            <span className="profile-badge">{worker?.role?.toUpperCase()}</span>
          </div>
        </div>

        {/* Profile Info Cards */}
        <div className="profile-grid">
          <div className="profile-card">
            <h3>Account Information</h3>
            {editMode ? (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            ) : (
              <div className="info-row">
                <span className="info-label">Full Name</span>
                <span className="info-value">{formData.name}</span>
              </div>
            )}

            {editMode ? (
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  disabled
                />
              </div>
            ) : (
              <div className="info-row">
                <span className="info-label">Email Address</span>
                <span className="info-value">{formData.email}</span>
              </div>
            )}

            <div className="info-row">
              <span className="info-label">Account Role</span>
              <span className="info-value">{formData.role}</span>
            </div>
          </div>

          <div className="profile-card">
            <h3>Statistics</h3>
            <div className="stats-list">
              <div className="stat-row">
                <span className="stat-label">Account Created</span>
                <span className="stat-value">March 2024</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Last Login</span>
                <span className="stat-value">Today at 10:30 AM</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Total Ratings Given</span>
                <span className="stat-value">12</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="profile-card full-width">
          <h3>Preferences</h3>
          <div className="preference-item">
            <div className="preference-content">
              <label>
                <input type="checkbox" defaultChecked /> Receive email notifications
              </label>
              <p className="preference-desc">Get notified about worker updates and system alerts</p>
            </div>
          </div>
          <div className="preference-item">
            <div className="preference-content">
              <label>
                <input type="checkbox" defaultChecked /> Show tips and suggestions
              </label>
              <p className="preference-desc">Display helpful tips when using the dashboard</p>
            </div>
          </div>
          <div className="preference-item">
            <div className="preference-content">
              <label>
                <input type="checkbox" /> Enable dark mode
              </label>
              <p className="preference-desc">Use a dark color scheme throughout the application</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          {editMode ? (
            <>
              <button className="btn btn-primary" onClick={handleSave}>
                Save Changes
              </button>
              <button className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={() => setEditMode(true)}>
                Edit Profile
              </button>
              <button className="btn btn-outline">
                Change Password
              </button>
            </>
          )}
        </div>

        {/* Danger Zone */}
        <div className="profile-card danger-zone">
          <h3>Danger Zone</h3>
          <p>Irreversible actions</p>
          <button className="btn btn-danger">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManagerProfile;

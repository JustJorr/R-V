import { useEffect, useState } from "react";
import { usersService } from "../../services/api";
import "../../styles/Supervisor/SupervisorPages.css";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useLanguage } from "../../context/LanguageContext";

function SupervisorProfile({ worker, onLogout, onProfileUpdated }) {
  const { language, setLanguage, t } = useLanguage();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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
      setMessage(t("profile.updatedSuccess"));
      setEditMode(false);
    } catch (err) {
      setError(err?.response?.data?.message || t("profile.updateFailed"));
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
        <h1>{t("profile.title")}</h1>
        <p>{t("profile.subtitle")}</p>
        <div className="language-toggle profile-lang-toggle">
          <span>{t("common.language")}:</span>
          <button type="button" className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>{t("common.english")}</button>
          <button type="button" className={language === "id" ? "active" : ""} onClick={() => setLanguage("id")}>{t("common.indonesian")}</button>
        </div>
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
            <h3>{t("profile.accountInfo")}</h3>
            {editMode ? (
              <div className="form-group">
                <label>{t("common.fullName")}</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" />
              </div>
            ) : (
              <div className="info-row"><span className="info-label">{t("common.fullName")}</span><span className="info-value">{formData.name}</span></div>
            )}

            {editMode ? (
              <div className="form-group">
                <label>{t("common.email")}</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" disabled />
              </div>
            ) : (
              <div className="info-row"><span className="info-label">{t("common.email")}</span><span className="info-value">{formData.email}</span></div>
            )}

            <div className="info-row"><span className="info-label">{t("common.role")}</span><span className="info-value">{formData.role}</span></div>
          </div>

          <div className="profile-card">
            <h3>{t("profile.statistics")}</h3>
            <div className="stats-list">
              <div className="stat-row"><span className="stat-label">{t("profile.accountCreated")}</span><span className="stat-value">{worker?.createdAt ? new Date(worker.createdAt).toLocaleDateString() : t("profile.notAvailable")}</span></div>
              <div className="stat-row"><span className="stat-label">{t("profile.avgRating")}</span><span className="stat-value">{typeof worker?.averageRating === "number" ? worker.averageRating.toFixed(1) : "N/A"}</span></div>
              <div className="stat-row"><span className="stat-label">{t("profile.totalRatingsGiven")}</span><span className="stat-value">{worker?.totalRatings ?? "N/A"}</span></div>
            </div>
          </div>
        </div>

        <div className="profile-card full-width">
          <h3>{t("profile.preferences")}</h3>
          <div className="preference-item"><div className="preference-content"><label><input type="checkbox" defaultChecked /> {t("profile.receiveEmail")}</label><p className="preference-desc">{t("profile.receiveEmailSupervisorDesc")}</p></div></div>
          <div className="preference-item"><div className="preference-content"><label><input type="checkbox" defaultChecked /> {t("profile.showTipsSupervisor")}</label><p className="preference-desc">{t("profile.showTipsSupervisorDesc")}</p></div></div>
        </div>

        <div className="profile-actions">
          {editMode ? (
            <>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? `${t("common.saveChanges")}...` : t("common.saveChanges")}</button>
              <button className="btn btn-secondary" onClick={handleCancel}>{t("common.cancel")}</button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={() => setEditMode(true)}>{t("common.editProfile")}</button>
              <button className="btn btn-primary" onClick={() => setShowLogoutConfirm(true)}>{t("common.logout")}</button>
            </>
          )}
        </div>

        {message && <p className="profile-success">{message}</p>}
        {error && <p className="profile-error">{error}</p>}
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title={t("profile.logoutTitle")}
        message={t("profile.logoutConfirm")}
        confirmText={t("common.logout")}
        cancelText={t("common.cancel")}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onLogout();
        }}
      />
    </div>
  );
}

export default SupervisorProfile;

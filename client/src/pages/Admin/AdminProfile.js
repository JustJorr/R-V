function AdminProfile({ worker }) {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Profile</h1>
      </div>

      <div className="recent-item">
        <h3>{worker.name}</h3>
        <p>{worker.email}</p>
        <span className="field-badge">Admin</span>
      </div>
    </div>
  );
}

export default AdminProfile;
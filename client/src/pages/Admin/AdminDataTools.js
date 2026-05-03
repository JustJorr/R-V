function AdminDataTools() {
  return (
    <div className="page-content admin-page">
      <div className="page-header">
        <h1>Data Tools</h1>
        <p>Import and export administration</p>
      </div>

      <div className="admin-card admin-section">
        <h2 style={{ marginTop: 0 }}>Excel Operations</h2>
        <p className="summary-note" style={{ marginBottom: 14 }}>
          We will finalize the Excel format and then wire these actions.
        </p>

        <div className="admin-actions">
          <button className="admin-btn primary" type="button" disabled>
            Import Excel (Coming Soon)
          </button>
          <button className="admin-btn" type="button" disabled>
            Export Excel (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDataTools;

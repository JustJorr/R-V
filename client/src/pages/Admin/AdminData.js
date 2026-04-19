function AdminData() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Data Tools</h1>
        <p>Import / Export system data</p>
      </div>

      <div className="actions-vertical">
        <button className="action-btn">📥 Import Excel</button>
        <button className="action-btn outline">📤 Export Data</button>
      </div>
    </div>
  );
}

export default AdminData;
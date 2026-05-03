import { useState } from "react";
import { adminDataService } from "../../services/api";

function AdminDataTools() {
  const [lang, setLang] = useState("en");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const res = await adminDataService.exportExcel(lang);

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ratings_${lang}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return alert("Please select a file");

    try {
      setLoading(true);
      await adminDataService.importExcel(file);
      alert("✅ Import successful");
    } catch {
      alert("❌ Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content admin-page">
      <div className="page-header">
        <h1>📂 Data Tools</h1>
        <p>Import and export system data (Excel)</p>
      </div>

      <div className="admin-card admin-section">
        <h2>🌐 Language</h2>

        <select
          className="sort-select"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
        >
          <option value="en">🇬🇧 English</option>
          <option value="id">🇮🇩 Indonesian</option>
        </select>
      </div>

      <div className="admin-card admin-section">
        <h2>📤 Export Data</h2>
        <button
          className="admin-btn primary"
          onClick={handleExport}
          disabled={loading}
        >
          {loading ? "⏳ Exporting..." : "📥 Download Excel"}
        </button>
      </div>

      <div className="admin-card admin-section">
        <h2>📥 Import Data</h2>

        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          className="admin-btn"
          onClick={handleImport}
          disabled={loading}
        >
          {loading ? "⏳ Importing..." : "⬆️ Upload Excel"}
        </button>
      </div>
    </div>
  );
}

export default AdminDataTools;
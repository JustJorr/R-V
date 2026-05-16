import { useState } from "react";
import { adminDataService } from "../../services/api";

function AdminDataTools() {
  const [lang, setLang] = useState("en");
  const [exportScope, setExportScope] = useState("month");
  const [exportMonth, setExportMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);

      const res =
        await adminDataService.exportExcel(
          lang,
          {
            scope: exportScope,
            month:
              exportScope === "month"
                ? exportMonth
                : undefined
          }
        );

      const url =
        window.URL.createObjectURL(
          new Blob([res.data])
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        `ratings_${
          exportScope === "overall"
            ? "overall"
            : exportMonth
        }_${lang}.xlsx`
      );

      document.body.appendChild(link);

      link.click();
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);

      const res =
        await adminDataService.downloadTemplate(
          lang
        );

      const url =
        window.URL.createObjectURL(
          new Blob([res.data])
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        `ratings_template_${lang}.xlsx`
      );

      document.body.appendChild(link);

      link.click();
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      return alert("Please select a file");
    }

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
        <p>
          Import and export system data
          (Excel)
        </p>
      </div>

      <div className="admin-card admin-section">
        <h2>🌐 Language</h2>

        <select
          className="sort-select"
          value={lang}
          onChange={(e) =>
            setLang(e.target.value)
          }
        >
          <option value="en">
            🇬🇧 English
          </option>

          <option value="id">
            🇮🇩 Indonesian
          </option>
        </select>
      </div>

      <div className="admin-card admin-section">
        <h2>📤 Export Data</h2>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: "12px"
          }}
        >
          <select
            className="sort-select export-filter-select"
            value={exportScope}
            onChange={(e) =>
              setExportScope(
                e.target.value
              )
            }
          >
            <option value="month">
              Selected Month
            </option>

            <option value="overall">
              Overall (All Ratings)
            </option>
          </select>

          <input
            type="month"
            className="sort-select export-filter-select"
            value={exportMonth}
            onChange={(e) =>
              setExportMonth(
                e.target.value
              )
            }
            disabled={
              exportScope === "overall"
            }
          />
        </div>

        <button
          className="admin-btn primary"
          onClick={handleExport}
          disabled={loading}
        >
          {loading
            ? "⏳ Exporting..."
            : "📥 Download Excel"}
        </button>
      </div>

      <div className="admin-card admin-section">
        <h2>📥 Import Data</h2>

        <input
          type="file"
          accept=".xlsx"
          onChange={(e) =>
            setFile(
              e.target.files[0]
            )
          }
        />

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "12px"
          }}
        >
          <button
            className="admin-btn"
            onClick={handleImport}
            disabled={loading}
          >
            {loading
              ? "⏳ Importing..."
              : "⬆️ Upload Excel"}
          </button>

          <button
            className="admin-btn secondary"
            onClick={
              handleDownloadTemplate
            }
            disabled={loading}
          >
            📄 Download Template
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDataTools;

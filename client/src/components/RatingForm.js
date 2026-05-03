import { useState, useEffect } from "react";
import { ratingsService } from "../services/api";
import "../styles/Supervisor/RatingForm.css";

// 🌐 Dual language labels (EN / ID)
const ratingFields = [
  { key: "workAreaCompliance", label: "Works within assigned area / Bekerja sesuai area tugas" },
  { key: "taskCompletion", label: "Completes tasks per standards / Menyelesaikan tugas sesuai standar" },
  { key: "cleanliness", label: "Area free of dust/stains / Kebersihan area terjaga" },
  { key: "wasteManagement", label: "Proper waste handling / Pengelolaan sampah yang benar" },
  { key: "organization", label: "Area neat and organized / Area rapi dan terorganisir" },
  { key: "uniformCompliance", label: "Proper uniform / PPE usage / Kepatuhan seragam / APD" },
  { key: "independence", label: "Works independently / Bekerja mandiri" },
  { key: "initiative", label: "Shows initiative / Memiliki inisiatif" },
  { key: "teamworkSupport", label: "Helps other areas / Membantu area lain (kerja tim)" },
  { key: "punctuality", label: "Arrives on time / Tepat waktu" },
  { key: "attendance", label: "Attendance consistency / Kehadiran konsisten" }
];

function RatingForm({
  worker,
  userId,
  onSuccess,
  onCancel,
  isEditing = false,
  initialValues = null,
  selectedMonth = null
}) {

  const [ratings, setRatings] = useState(
    ratingFields.reduce((acc, f) => {
      acc[f.key] = initialValues?.[f.key] ?? 3;
      return acc;
    }, {})
  );

  const [comment, setComment] = useState(initialValues?.comment ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialValues) {
      const updated = {};
      ratingFields.forEach(f => {
        updated[f.key] = initialValues[f.key] ?? 3;
      });
      setRatings(updated);
      setComment(initialValues.comment || "");
    }
  }, [initialValues]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await ratingsService.submitRating(
        userId,
        worker._id,
        ratings,
        comment,
        selectedMonth
      );

      onSuccess();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Error submitting rating. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = (
    Object.values(ratings).reduce((a, b) => a + b, 0) / ratingFields.length
  ).toFixed(1);

  return (
    <div className="rating-form-overlay">
      <div className="rating-form-container">

        <div className="form-header">
          <h2>
            {isEditing ? "Edit Rating / Edit Penilaian" : "Rate / Nilai"} — {worker.name}
          </h2>
          <button className="close-btn" onClick={onCancel} type="button">✕</button>
        </div>

        {isEditing && (
          <p className="form-edit-notice">
            Editing rating for {selectedMonth || "this month"} / Mengedit penilaian untuk {selectedMonth || "bulan ini"}.
          </p>
        )}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>

          {ratingFields.map(field => (
            <div className="rating-field" key={field.key}>
              <label>
                {field.label}
                <span className="rating-value">{ratings[field.key]}★</span>
              </label>

              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={ratings[field.key]}
                  onChange={(e) =>
                    setRatings(prev => ({
                      ...prev,
                      [field.key]: parseFloat(e.target.value)
                    }))
                  }
                  className="slider"
                />

                <div className="rating-labels">
                  <span>0</span>
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>
            </div>
          ))}

          <div className="average-rating">
            <strong>
              Overall Average / Rata-rata: {averageRating}★
            </strong>
          </div>

          <div className="form-group">
            <label>Comments / Komentar (Optional):</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add feedback or comments... / Tambahkan komentar..."
              rows="4"
            />
          </div>

          <div className="form-buttons">
            <button
              type="button"
              className="cancel-btn"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel / Batal
            </button>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading
                ? (isEditing ? "Updating... / Memperbarui..." : "Submitting... / Mengirim...")
                : (isEditing ? "Update Rating / Perbarui" : "Submit Rating / Kirim")}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default RatingForm;
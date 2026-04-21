import { useState, useEffect } from "react";
import { ratingsService } from "../services/api";
import "../styles/Supervisor/RatingForm.css";

const ratingFields = [
  { key: "workAreaCompliance", label: "Works within assigned area" },
  { key: "taskCompletion", label: "Completes tasks per standards" },
  { key: "cleanliness", label: "Area free of dust/stains" },
  { key: "wasteManagement", label: "Proper waste handling" },
  { key: "organization", label: "Area neat and organized" },
  { key: "uniformCompliance", label: "Proper uniform / PPE usage" },
  { key: "independence", label: "Works independently" },
  { key: "initiative", label: "Shows initiative" },
  { key: "teamworkSupport", label: "Helps other areas" },
  { key: "punctuality", label: "Arrives on time" },
  { key: "attendance", label: "Attendance consistency" }
];

function RatingForm({ worker, userId, onSuccess, onCancel, isEditing = false, initialValues = null }) {

  const [ratings, setRatings] = useState(
    ratingFields.reduce((acc, f) => {
      acc[f.key] = initialValues?.[f.key] ?? 3;
      return acc;
    }, {})
  );

  const [comment, setComment] = useState(initialValues?.comment ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync form state when initialValues change (e.g. opening edit for a different worker)
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
      // ratingsService.submitRating never sends a dateKey —
      // the server always uses today's date server-side.
      await ratingsService.submitRating(
        userId,
        worker._id,
        ratings,
        comment
      );

      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || "Error submitting rating. Please try again.";
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
          <h2>{isEditing ? "Edit Rating" : "Rate"} — {worker.name}</h2>
          <button className="close-btn" onClick={onCancel} type="button">✕</button>
        </div>

        {isEditing && (
          <p className="form-edit-notice">
            Editing today's rating. Past ratings are view-only.
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
            <strong>Overall Average: {averageRating}★</strong>
          </div>

          <div className="form-group">
            <label>Comments (Optional):</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add feedback or comments..."
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
              Cancel
            </button>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading
                ? (isEditing ? "Updating..." : "Submitting...")
                : (isEditing ? "Update Rating" : "Submit Rating")}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default RatingForm;
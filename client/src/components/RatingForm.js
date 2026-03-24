import { useState, useEffect } from "react";
import { ratingsService } from "../services/api";
import "../styles/Manager/RatingForm.css";

function RatingForm({ worker, userId, onSuccess, onCancel, isEditing = false, initialValues = null }) {
  const [technicalSkills, setTechnicalSkills] = useState(initialValues?.technicalSkills ?? 3);
  const [communication, setCommunication] = useState(initialValues?.communication ?? 3);
  const [teamwork, setTeamwork] = useState(initialValues?.teamwork ?? 3);
  const [comment, setComment] = useState(initialValues?.comment ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialValues) {
      setTechnicalSkills(initialValues.technicalSkills);
      setCommunication(initialValues.communication);
      setTeamwork(initialValues.teamwork);
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
        technicalSkills,
        communication,
        teamwork,
        comment
      );

      alert(`Successfully ${isEditing ? "updated" : "added"} rating for ${worker.name}!`);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Error submitting rating");
    } finally {
      setLoading(false);
    }
  };

  const averageRating = (
    (parseInt(technicalSkills) + parseInt(communication) + parseInt(teamwork)) / 3
  ).toFixed(1);

  return (
    <div className="rating-form-overlay">
      <div className="rating-form-container">
        <div className="form-header">
          <h2>Rate {worker.name}</h2>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Technical Skills */}
          <div className="rating-field">
            <label>
              Technical Skills
              <span className="rating-value">{technicalSkills}★</span>
            </label>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={technicalSkills}
                onChange={(e) => setTechnicalSkills(e.target.value)}
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

          {/* Communication */}
          <div className="rating-field">
            <label>
              Communication
              <span className="rating-value">{communication}★</span>
            </label>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={communication}
                onChange={(e) => setCommunication(e.target.value)}
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

          {/* Teamwork */}
          <div className="rating-field">
            <label>
              Teamwork
              <span className="rating-value">{teamwork}★</span>
            </label>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={teamwork}
                onChange={(e) => setTeamwork(e.target.value)}
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

          {/* Average Display */}
          <div className="average-rating">
            <strong>Overall Average: {averageRating}★</strong>
          </div>

          {/* Comment */}
          <div className="form-group">
            <label>Comments (Optional):</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add feedback or comments..."
              rows="4"
            ></textarea>
          </div>

          {/* Buttons */}
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
              {loading ? (isEditing ? "Updating..." : "Submitting...") : (isEditing ? "Update Rating" : "Submit Rating")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RatingForm;

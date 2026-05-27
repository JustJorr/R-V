import { useState, useEffect, useCallback, useMemo } from "react";
import { ratingsService, supervisorService } from "../../services/api";
import { getRatingColor } from "../../utils/helpers";
import RatingForm from "../../components/RatingForm";
import "../../styles/Supervisor/SupervisorPages.css";
import "../../styles/User/WorkerDashboard.css";
import { useLanguage } from "../../context/LanguageContext";

const ratingFields = [
  { key: "workAreaCompliance", short: "WA" },
  { key: "taskCompletion", short: "TC" },
  { key: "cleanliness", short: "CL" },
  { key: "wasteManagement", short: "WM" },
  { key: "organization", short: "OR" },
  { key: "uniformCompliance", short: "UC" },
  { key: "independence", short: "IN" },
  { key: "initiative", short: "IV" },
  { key: "teamworkSupport", short: "TS" },
  { key: "punctuality", short: "PU" },
  { key: "attendance", short: "AT" }
];

const KPI_FIELDS = ratingFields;

function getPreviousMonthKey() {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric"
  });
}

function formatMonthLabel(monthKey) {
  if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) return monthKey;
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long"
  });
}

function WorkerRatings({ worker }) {
  const { t } = useLanguage();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingWorker, setRatingWorker] = useState(null);
  const [editingRating, setEditingRating] = useState(null);
  const [ratedWorkerIds, setRatedWorkerIds] = useState(new Set());
  const [ratedWorkerMap, setRatedWorkerMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(getPreviousMonthKey());
  const [filterMonth, setFilterMonth] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [editRequestModal, setEditRequestModal] = useState({ isOpen: false, workerId: null, reason: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchWorkers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await supervisorService.getDashboard(selectedMonth);
      const filtered = res.data.filter(
        (u) => u.role === "worker" && u._id !== worker._id
      );
      setWorkers(filtered);
    } catch (err) {
      console.error("Error fetching workers:", err);
    } finally {
      setLoading(false);
    }
  }, [worker._id, selectedMonth]);

  const allowedRatingMonth = getPreviousMonthKey();
  const isRatingMonthAvailable = selectedMonth === allowedRatingMonth;

  const fetchWorkerRatings = useCallback(async () => {
    if (!worker?._id) {
      setRatedWorkerIds(new Set());
      return;
    }
    try {
      const response = await supervisorService.getSupervisorRatings(worker._id, selectedMonth);
      const ratedIds = new Set((response.data || []).map((rating) => String(rating.ratedUser)));
      const map = (response.data || []).reduce((acc, rating) => {
        acc[String(rating.ratedUser)] = rating;
        return acc;
      }, {});
      setRatedWorkerIds(ratedIds);
      setRatedWorkerMap(map);
    } catch (err) {
      console.error("Error fetching worker ratings:", err);
    }
  }, [worker?._id, selectedMonth]);

  useEffect(() => {
    fetchWorkers();
    fetchWorkerRatings();
  }, [fetchWorkers, fetchWorkerRatings]);

  const handleApplyFilter = () => {
    const month = filterMonth || getPreviousMonthKey();
    setSelectedMonth(month);
    setActiveFilter(filterMonth ? `Month: ${filterMonth}` : "");
  };

  const handleResetFilter = () => {
    const previousMonth = getPreviousMonthKey();
    setFilterMonth("");
    setActiveFilter("");
    setSelectedMonth(previousMonth);
  };

  const handleRatingSuccess = () => {
    setRatingWorker(null);
    setEditingRating(null);
    fetchWorkers();
    fetchWorkerRatings();
  };

  const isAlreadyRated = useCallback((workerId) => ratedWorkerIds.has(String(workerId)), [ratedWorkerIds]);

  const handleRequestEdit = async (targetWorkerId) => {
    const rating = ratedWorkerMap[String(targetWorkerId)];
    if (!rating?._id) return;
    setEditRequestModal({ isOpen: true, workerId: targetWorkerId, reason: "" });
  };

  const handleSubmitEditRequest = async () => {
    const rating = ratedWorkerMap[String(editRequestModal.workerId)];
    if (!rating?._id || !editRequestModal.reason.trim()) return;

    try {
      setSubmitting(true);
      await ratingsService.requestWorkerEdit(rating._id, worker._id, editRequestModal.reason);
      await fetchWorkerRatings();
      setEditRequestModal({ isOpen: false, workerId: null, reason: "" });
    } catch (err) {
      alert(err.response?.data?.message || t("workerRatings.submitRequest"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseEditModal = () => {
    setEditRequestModal({ isOpen: false, workerId: null, reason: "" });
  };

  const handleRateWorker = (w) => {
    setEditingRating(null);
    setRatingWorker(w);
  };

  const handleEditWorker = async (targetWorker) => {
    try {
      const response = await supervisorService.getExistingRating(worker._id, targetWorker._id, selectedMonth);
      setEditingRating(response.data || null);
      setRatingWorker(targetWorker);
    } catch (err) {
      alert(err.response?.data?.message || t("workerRatings.edit"));
    }
  };

  const ratedThisMonth = useCallback((w) => {
    if (!w.latestRating) return false;
    const ratingMonth = w.latestRating.dateKey ||
      new Date(w.latestRating.createdAt).toISOString().slice(0, 7);
    return ratingMonth === selectedMonth;
  }, [selectedMonth]);

  const { filteredWorkers, ratedCount, unratedCount } = useMemo(() => {
    const ratedWorkers = workers.filter((w) => isAlreadyRated(w._id)).length;
    const unratedWorkers = workers.length - ratedWorkers;
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const list = workers
      .filter((w) => {
        const matchesSearch = w.name.toLowerCase().includes(normalizedSearch);
        const matchesFilter =
          filterStatus === "all" ||
          (filterStatus === "rated" && isAlreadyRated(w._id)) ||
          (filterStatus === "unrated" && !isAlreadyRated(w._id));
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return { filteredWorkers: list, ratedCount: ratedWorkers, unratedCount: unratedWorkers };
  }, [workers, searchTerm, filterStatus, isAlreadyRated]);

  return (
    <div className="page-content supervisor-details">
      {ratingWorker && (
        <RatingForm
          worker={ratingWorker}
          userId={worker?._id}
          onSuccess={handleRatingSuccess}
          onCancel={() => {
            setRatingWorker(null);
            setEditingRating(null);
          }}
          isEditing={Boolean(editingRating)}
          initialValues={editingRating}
          selectedMonth={selectedMonth}
        />
      )}

      {/* Edit Request Modal */}
      {editRequestModal.isOpen && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
              <h3>{t("workerRatings.modalTitle")}</h3>
              <button className="modal-close" onClick={handleCloseEditModal}>—</button>
            </div>
            <div className="modal-body">
              <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
                {t("workerRatings.modalReasonLabel")}
              </label>
              <textarea
                value={editRequestModal.reason}
                onChange={(e) => setEditRequestModal({ ...editRequestModal, reason: e.target.value })}
                placeholder={t("workerRatings.modalReasonPlaceholder")}
                style={{
                  width: "100%",
                  minHeight: "100px",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontFamily: "inherit",
                  fontSize: "14px"
                }}
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={handleSubmitEditRequest}
                disabled={submitting || !editRequestModal.reason.trim()}
              >
                {submitting ? t("workerRatings.submitting") : t("workerRatings.submitRequest")}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleCloseEditModal}
                disabled={submitting}
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <h1>{t("workerRatings.rateColleaguesTitle")}</h1>
        <p>{t("workerRatings.rateColleaguesSubtitle")}</p>
      </div>

      <div className="wf-filter-bar">
        <div className="wf-filter-inputs">
          <div className="wf-filter-group">
            <label>{t("workerRatings.byMonth")}</label>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            />
          </div>
          <button className="wf-btn-apply" onClick={handleApplyFilter}>
            {t("workerRatings.apply")}
          </button>
          {activeFilter && (
            <button className="wf-btn-reset" onClick={handleResetFilter}>
              x {activeFilter}
            </button>
          )}
        </div>
      </div>

      <div className="details-stats-row">
        <div className="quick-stat-pill">
          <span className="label">{t("workerRatings.visibleWorkers")}</span>
          <span className="value">{filteredWorkers.length}</span>
        </div>
        <div className="quick-stat-pill">
          <span className="label">{t("workerRatings.ratedByYou")}</span>
          <span className="value">{ratedCount}</span>
        </div>
        <div className="quick-stat-pill">
          <span className="label">{t("workerRatings.notYetRated")}</span>
          <span className="value">{unratedCount}</span>
        </div>
      </div>

      <div className="details-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder={t("workerRatings.searchByName")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            {t("workerRatings.all")} ({workers.length})
          </button>
          <button
            className={`filter-btn ${filterStatus === "rated" ? "active" : ""}`}
            onClick={() => setFilterStatus("rated")}
          >
            {t("workerRatings.rated")} ({ratedCount})
          </button>
          <button
            className={`filter-btn ${filterStatus === "unrated" ? "active" : ""}`}
            onClick={() => setFilterStatus("unrated")}
          >
            {t("workerRatings.unrated")} ({unratedCount})
          </button>
        </div>

        <div className="quick-stat-pill">
          <span className="label">{t("workerRatings.ratingMonth")}</span>
          <span className="value">{formatMonthLabel(selectedMonth)}</span>
        </div>
      </div>

      {!isRatingMonthAvailable && (
        <div className="no-data" style={{ marginBottom: "12px" }}>
          {t("workerRatings.ratingUnavailable")} {formatMonthLabel(selectedMonth)}. {t("workerRatings.workersCanOnlyRate")} {formatMonthLabel(allowedRatingMonth)}.
        </div>
      )}

      {loading ? (
        <div className="loading">{t("workerRatings.loadingWorkers")}</div>
      ) : filteredWorkers.length === 0 ? (
        <div className="no-data">
          {searchTerm ? t("workerRatings.noWorkersSearch") : t("workerRatings.noWorkersDisplay")}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="workers-table worker-ratings-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t("workerRatings.tableName")}</th>
                <th>{t("workerRatings.tableAvgRating")}</th>
                <th>{t("workerRatings.tableLatestRating")}</th>
                <th>{t("workerRatings.tableSelectedMonth")}</th>
                <th>{t("workerRatings.tableLastComment")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((w, index) => (
                <tr key={w._id} className={isAlreadyRated(w._id) ? "rated-row" : ""}>
                  <td data-label="#"> {index + 1}</td>
                  <td data-label={t("workerRatings.tableName")}>
                    <div className="worker-name-cell">
                      <div className="worker-badge">
                        {w.name.charAt(0).toUpperCase()}
                      </div>
                      {w.name}
                    </div>
                  </td>
                  <td data-label={t("workerRatings.tableAvgRating")}>
                    {typeof w.monthAverageRating === "number" ? (
                      <span
                        className="rating-badge"
                        style={{ backgroundColor: getRatingColor(w.monthAverageRating) }}
                      >
                        {w.monthAverageRating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="rating-badge rating-badge--none">-</span>
                    )}
                  </td>

                  <td className="latest-rating-cell" data-label={t("workerRatings.tableLatestRating")}>
                    {w.latestRating ? (() => {
                      const scores = KPI_FIELDS.map((f) => w.latestRating[f.key] ?? 0);
                      const avg = scores.reduce((a, b) => a + b, 0) / KPI_FIELDS.length;

                      const lowest = KPI_FIELDS
                        .map((f) => ({ ...f, value: w.latestRating[f.key] ?? 0 }))
                        .sort((a, b) => a.value - b.value)[0];

                      return (
                        <div className="rating-summary">
                          <div
                            className="summary-avg"
                            style={{ backgroundColor: getRatingColor(avg) }}
                          >
                            {avg.toFixed(1)} {t("workerRatings.avgShort")}
                          </div>

                          <div className="summary-low">
                            {t("workerRatings.lowShort")} {t(`kpiShort.${lowest.key}`)}: {lowest.value}
                          </div>

                          <small className="rating-timestamp">
                            {formatDate(w.latestRating.createdAt)}
                            {ratedThisMonth(w) && (
                              <span className="today-tag">{t("workerRatings.selectedMonthTag")}</span>
                            )}
                          </small>
                        </div>
                      );
                    })() : (
                      <span className="text-muted">{t("workerRatings.noRatingsYet")}</span>
                    )}
                  </td>

                  <td className="action-cell" data-label={t("workerRatings.action")}>
                    {isAlreadyRated(w._id) ? (
                      ratedWorkerMap[String(w._id)]?.workerEditRequestStatus === "pending" ? (
                        <span className="status-badge">{t("workerRatings.editPending")}</span>
                      ) : ratedWorkerMap[String(w._id)]?.workerEditRequestStatus === "approved" ? (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleEditWorker(w)}
                          title={`Edit your rating for ${selectedMonth}`}
                        >
                          {t("workerRatings.edit")}
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleRequestEdit(w._id)}
                          title={t("workerRatings.askAdminUnlock")}
                        >
                          {t("workerRatings.requestEdit")}
                        </button>
                      )
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleRateWorker(w)}
                        title={`Rate this colleague for ${selectedMonth}`}
                        disabled={!isRatingMonthAvailable}
                      >
                        {t("workerRatings.rate")}
                      </button>
                    )}
                  </td>

                  <td className="comment-cell" data-label={t("workerRatings.tableLastComment")}>
                    {w.latestRating?.comment ? (
                      <div className="comment-preview" title={w.latestRating.comment}>
                        <span className="comment-text">{w.latestRating.comment.substring(0, 40)}{w.latestRating.comment.length > 40 ? "..." : ""}</span>
                      </div>
                    ) : (
                      <span className="text-muted">{t("workerRatings.dash")}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default WorkerRatings;



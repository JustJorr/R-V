import axios from "axios";
import { config } from "../config/config";

const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.timeout
});

// =======================
// AUTH SERVICE
// =======================
export const authService = {
  login: (email, password) =>
    apiClient.post("/api/login", { email, password }),

  register: (name, email, password, role) =>
    apiClient.post("/api/users", { name, email, password, role })
};

// =======================
// USERS SERVICE (basic)
// =======================
export const usersService = {
  getAllUsers: () =>
    apiClient.get("/api/users"),

  getUserById: (id) =>
    apiClient.get(`/api/users/${id}`),

  updateProfile: (id, payload) =>
    apiClient.put(`/api/users/${id}/profile`, payload)
};

// =======================
// SUPERVISOR SERVICE
// =======================
export const supervisorService = {
  getDashboard: (month) =>
    apiClient.get("/api/supervisor/dashboard", {
      params: month ? { month } : {}
    }),

  getDashboardWithFilters: (params = {}) =>
    apiClient.get("/api/supervisor/dashboard", { params }),

  getRatingsForUser: (userId, params = {}) =>
    apiClient.get(`/api/ratings/worker/${userId}`, { params }),

  getSupervisorRatings: (supervisorId, month) =>
    apiClient.get(`/api/supervisor/ratings/${supervisorId}`, {
      params: month ? { month } : {}
    }),

  getExistingRating: (supervisorId, workerId, month) =>
    apiClient.get(`/api/rating/${supervisorId}/${workerId}`, {
      params: month ? { month } : {}
    }),

  getWorkerById: (workerId) =>
    apiClient.get(`/api/users/${workerId}`),

  getWorkerHistory: (workerId, supervisorId = null) => {
    const params = supervisorId ? { supervisorId } : {};
    return apiClient.get(`/api/ratings/worker/${workerId}/history`, { params });
  }
};

// =======================
// RATINGS SERVICE
// =======================
export const ratingsService = {
  submitRating: (ratedBy, ratedUser, ratings, comment, dateKey) =>
    apiClient.post("/api/ratings", {
      ratedBy,
      ratedUser,
      ...ratings,
      comment,
      ...(dateKey ? { dateKey } : {})
    }),

  getRatingsForUser: (userId, params = {}) =>
    apiClient.get(`/api/ratings/worker/${userId}`, { params }),

  requestWorkerEdit: (ratingId, workerId, reason) =>
    apiClient.post(`/api/ratings/${ratingId}/request-edit`, { workerId, reason })
};

// =======================
// ADMIN SERVICE (USERS + DASHBOARD)
// =======================
export const adminService = {
  getAllUsers: () =>
    apiClient.get("/api/admin/users"),

  updateUserRole: (id, role) =>
    apiClient.put(`/api/admin/users/${id}/role`, { role }),

  deleteUser: (id) =>
    apiClient.delete(`/api/admin/users/${id}`),

  changePassword: (id, password) =>
    apiClient.put(`/api/admin/users/${id}/password`, { password }),

  getDashboard: () =>
    apiClient.get("/api/admin/dashboard"),

  createUser: (payload) =>
    apiClient.post("/api/users", payload),

  getPendingRatingEditRequests: () =>
    apiClient.get("/api/admin/rating-edit-requests"),

  reviewRatingEditRequest: (ratingId, adminId, action) =>
    apiClient.put(`/api/admin/rating-edit-requests/${ratingId}`, {
      adminId,
      action
    })
};

export const adminDataService = {

  importExcel: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post("/api/admin/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  },

  exportExcel: (lang = "en", options = {}) =>
    apiClient.get("/api/admin/export", {
      params: {
        lang,
        ...(options.scope ? { scope: options.scope } : {}),
        ...(options.month ? { month: options.month } : {})
      },
      responseType: "blob"
    }),

  downloadTemplate: (lang) =>
    apiClient.get(`/api/admin/template?lang=${lang}`, {
      responseType: "blob"
    }
  ),
};

export default apiClient;

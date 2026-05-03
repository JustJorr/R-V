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
    apiClient.get(`/api/users/${id}`)
};

// =======================
// SUPERVISOR SERVICE
// =======================
export const supervisorService = {
  getDashboard: () =>
    apiClient.get("/api/supervisor/dashboard"),

  getDashboardWithFilters: (params = {}) =>
    apiClient.get("/api/supervisor/dashboard", { params }),

  getRatingsForUser: (userId, params = {}) =>
    apiClient.get(`/api/ratings/worker/${userId}`, { params }),

  getSupervisorRatings: (supervisorId) =>
    apiClient.get(`/api/supervisor/ratings/${supervisorId}`),

  getExistingRating: (supervisorId, workerId) =>
    apiClient.get(`/api/rating/${supervisorId}/${workerId}`),

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
  submitRating: (ratedBy, ratedUser, ratings, comment) =>
    apiClient.post("/api/ratings", {
      ratedBy,
      ratedUser,
      ...ratings,
      comment
    }),

  getRatingsForUser: (userId, params = {}) =>
    apiClient.get(`/api/ratings/worker/${userId}`, { params })
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
    apiClient.post("/api/users", payload)
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

  exportExcel: (lang = "en") =>
    apiClient.get(`/api/admin/export?lang=${lang}`, {
      responseType: "blob"
    })
};

export default apiClient;
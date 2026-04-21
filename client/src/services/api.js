import axios from "axios";
import { config } from "../config/config";

const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.timeout
});

// Auth Service
export const authService = {
  login: (email, password) =>
    apiClient.post("/api/login", { email, password }),

  register: (name, email, password, role) =>
    apiClient.post("/api/users", { name, email, password, role })
};

// Users Service
export const usersService = {
  getAllUsers: () =>
    apiClient.get("/api/users"),

  getUserById: (id) =>
    apiClient.get(`/api/users/${id}`)
};

// Supervisor Service
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

  /**
   * Fetch past (non-today) rating history for a worker.
   * Optionally scoped to a specific supervisor.
   */
  getWorkerHistory: (workerId, supervisorId = null) => {
    const params = supervisorId ? { supervisorId } : {};
    return apiClient.get(`/api/ratings/worker/${workerId}/history`, { params });
  }
};

// Ratings Service
export const ratingsService = {
  /**
   * Submit or update a rating for today.
   * The server always uses today's dateKey — never pass a dateKey from the client.
   */
  submitRating: (ratedBy, ratedUser, ratings, comment) =>
    apiClient.post("/api/ratings", {
      ratedBy,
      ratedUser,
      ...ratings,
      comment
    }),

  getRatingsForUser: (userId) =>
    apiClient.get(`/api/ratings/worker/${userId}`)
};

export default apiClient;
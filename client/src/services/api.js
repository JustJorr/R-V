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
  
  getRatingsForUser: (userId) =>
    apiClient.get(`/api/ratings/worker/${userId}`),

  getSupervisorRatings: (supervisorId) =>
    apiClient.get(`/api/supervisor/ratings/${supervisorId}`),

  getExistingRating: (supervisorId, workerId) =>
    apiClient.get(`/api/rating/${supervisorId}/${workerId}`)
};

// Ratings Service
export const ratingsService = {
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

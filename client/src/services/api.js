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

// Manager Service
export const managerService = {
  getDashboard: () =>
    apiClient.get("/api/manager/dashboard"),
  
  getRatingsForUser: (userId) =>
    apiClient.get(`/api/ratings/user/${userId}`)
};

// Ratings Service
export const ratingsService = {
  submitRating: (ratedBy, ratedUser, score, comment) =>
    apiClient.post("/api/ratings", { 
      ratedBy, 
      ratedUser, 
      score, 
      comment 
    }),
  
  getRatingsForUser: (userId) =>
    apiClient.get(`/api/ratings/user/${userId}`)
};

export default apiClient;

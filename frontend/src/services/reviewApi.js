// src/services/reviewApi.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL 
const API_VERSION = import.meta.env.VITE_API_VERSION || "/api/v1";

const api = axios.create({
  baseURL: `${BASE_URL}${API_VERSION}`,
  withCredentials: true,
});

export const getAllReviews = async () => {
  try {
    const response = await api.get("/reviews/get");
    return response.data; // Expected { success: true, allReviews: [...] } or just [...]
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

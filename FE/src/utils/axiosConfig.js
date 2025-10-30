import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:6789/api",
  timeout: 15000, // Tăng timeout lên 15s cho các request tạo order
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Axios interceptor error:", error);
    
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Only redirect to login if we're on a protected route
      // or if the user was actually trying to access protected content
      const currentPath = window.location.pathname;
      const protectedRoutes = ['/account', '/admin', '/orders', '/order-detail', '/notifications'];
      const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));
      
      if (isProtectedRoute) {
        // Store the intended route to redirect after login
        localStorage.setItem("intendedRoute", currentPath);
        window.location.href = '/login';
      }
      // If not on protected route, let the app continue normally without redirect
    }
    
    // Log detailed error information for debugging
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    } else if (error.request) {
      console.error("Error request:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

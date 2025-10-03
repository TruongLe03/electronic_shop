import axiosInstance from "../utils/axiosConfig";
import { extractResponseData } from "../utils/responseUtils";

// Đăng ký
export const register = async (registerData) => {
  try {
    const response = await axiosInstance.post("/auth/register", registerData);
    
    // Extract data using responseUtils
    const data = extractResponseData(response);
    
    if (data && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error("Register error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

// Đăng nhập
export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });

    // Extract data using responseUtils
    const data = extractResponseData(response);
    
    if (data && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

// Đăng xuất
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// Email validation functions
export const validateEmailFormat = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const checkEmailExists = async (email) => {
  try {
    const response = await axiosInstance.post("/otp/check-email", {
      email
    });
    return extractResponseData(response);
  } catch (error) {
    console.error("Check email error:", error);
    throw error.response ? error.response.data : error;
  }
};

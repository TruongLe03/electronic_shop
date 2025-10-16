import axiosInstance from "../utils/axiosConfig";

// Gửi OTP để reset password
export const sendResetOTP = async (email) => {
  try {
    const response = await axiosInstance.post("/auth/password/send-otp", {
      email,
    });
    return response.data;
  } catch (error) {
    console.error("Send reset OTP error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Verify OTP
export const verifyResetOTP = async (email, otp) => {
  try {
    const response = await axiosInstance.post("/auth/password/verify-otp", {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    console.error("Verify OTP error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Reset password
export const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await axiosInstance.post("/auth/password/reset-with-otp", {
      email,
      otp,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Reset password error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Check email exists
export const checkEmailExists = async (email) => {
  try {
    const response = await axiosInstance.post("/auth/email/check", {
      email,
    });
    return response.data;
  } catch (error) {
    console.error("Check email error:", error);
    throw error.response ? error.response.data : error;
  }
};

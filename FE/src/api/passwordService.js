import axiosInstance from '../utils/axiosConfig';

// Gửi OTP để reset password
export const sendResetOTP = async (email) => {
  try {
    const response = await axiosInstance.post('/otp/send-reset-otp', {
      email
    });
    return response.data;
  } catch (error) {
    console.error('Send reset OTP error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Verify OTP
export const verifyResetOTP = async (email, otp) => {
  try {
    const response = await axiosInstance.post('/otp/verify-otp', {
      email,
      otp
    });
    return response.data;
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Reset password
export const resetPassword = async (email, otp, newPassword, confirmPassword) => {
  try {
    const response = await axiosInstance.post('/otp/reset-password', {
      email,
      otp,
      newPassword,
      confirmPassword
    });
    return response.data;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error.response ? error.response.data : error;
  }
};

// Check email exists
export const checkEmailExists = async (email) => {
  try {
    const response = await axiosInstance.post('/otp/check-email', {
      email
    });
    return response.data;
  } catch (error) {
    console.error('Check email error:', error);
    throw error.response ? error.response.data : error;
  }
};
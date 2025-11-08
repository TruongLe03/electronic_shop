import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { login as loginApi, logout as logoutApi, getCurrentUser } from '../api/authService';

export const useAuthStore = defineStore('auth', () => {
  // Initialize from localStorage
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  
  const user = ref(storedUser ? JSON.parse(storedUser) : null);
  const token = ref(storedToken);
  const isAuthenticated = computed(() => !!user.value && !!token.value);

  // Check if token is still valid
  function checkTokenValidity() {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!storedToken || !storedUser) {
      // Clear everything if either is missing
      logout();
      return false;
    }
    
    return true;
  }

  async function login(email, password) {
    try {
      const response = await loginApi(email, password);
      
      // Save token to localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
        token.value = response.token;
      }
      
      // Save user to localStorage and store
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        user.value = response.user;
      }
      
      console.log('Login successful:', { user: response.user, hasToken: !!response.token });
      return response;
    } catch (error) {
      console.error('Login error in store:', error);
      throw error;
    }
  }

  function logout() {
    logoutApi();
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('intendedRoute'); // Also clear intended route
    // Clear store
    user.value = null;
    token.value = null;
  }

  function updateUser(userData, authToken = null) {
    user.value = userData;
    // Cập nhật token nếu được cung cấp
    if (authToken) {
      token.value = authToken;
      localStorage.setItem('token', authToken);
    }
    // Cập nhật user trong localStorage
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
  }

  // Silently clear expired token without redirect
  function clearExpiredAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    user.value = null;
    token.value = null;
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkTokenValidity,
    clearExpiredAuth
  };
});

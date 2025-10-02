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
    // Clear store
    user.value = null;
    token.value = null;
  }

  function updateUser(userData) {
    user.value = userData;
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    updateUser
  };
});

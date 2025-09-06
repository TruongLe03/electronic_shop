import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { login as loginApi, logout as logoutApi, getCurrentUser } from '../api/authService';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(getCurrentUser());
  const isAuthenticated = computed(() => !!user.value);

  async function login(email, password) {
    try {
      const response = await loginApi(email, password);
      user.value = response.user;
      return response;
    } catch (error) {
      console.error('Login error in store:', error);
      throw error;
    }
  }

  function logout() {
    logoutApi();
    user.value = null;
  }

  function updateUser(userData) {
    user.value = userData;
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    updateUser
  };
});

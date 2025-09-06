<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { login } from "../api/authService";
import { useNotification } from "../composables/useNotification";
import { useGlobalLoading } from "../composables/useLoading";

const router = useRouter();
const authStore = useAuthStore();
const { notifyLogin, showError } = useNotification();
const { showFormLoading, hideLoading } = useGlobalLoading();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const handleLogin = async () => {
  let loader;
  try {
    if (!email.value || !password.value) {
      error.value = "Vui lòng điền đầy đủ thông tin";
      showError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    loading.value = true;
    error.value = "";
    
    // Hiển thị loading overlay
    loader = showFormLoading("Đang đăng nhập...");

    const response = await login(email.value, password.value);
    
    // Cập nhật store
    authStore.updateUser(response.user);
    
    // Hiển thị thông báo thành công
    notifyLogin(true, response.user.name || response.user.email);
    
    // Chuyển hướng
    const intendedRoute = localStorage.getItem('intendedRoute');
    if (intendedRoute) {
      localStorage.removeItem('intendedRoute');
      router.push(intendedRoute);
    } else {
      router.push("/");
    }

  } catch (err) {
    console.error("Login error:", err);
    error.value = err.message || "Đã có lỗi xảy ra";
    notifyLogin(false);
  } finally {
    loading.value = false;
    hideLoading(loader);
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-md mx-auto p-6">
      <div class="mt-8 bg-white rounded-lg shadow-md p-8">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900">Đăng nhập</h2>
          <p class="mt-2 text-gray-600">
            Chưa có tài khoản? 
            <router-link 
              to="/signup" 
              class="text-blue-600 hover:text-blue-800 font-medium"
            >
              Đăng ký ngay
            </router-link>
          </p>
        </div>

        <!-- Error Message -->
        <div 
          v-if="error" 
          class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm"
        >
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Input -->
          <div>
            <label 
              for="email" 
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              :disabled="loading"
            />
          </div>

          <!-- Password Input -->
          <div>
            <label 
              for="password" 
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              :disabled="loading"
            />
          </div>

          <!-- Forgot Password -->
          <div class="flex justify-end">
            <router-link 
              to="/forgot-password" 
              class="text-sm text-blue-600 hover:text-blue-800"
            >
              Quên mật khẩu?
            </router-link>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Đang xử lý...</span>
            <span v-else>Đăng nhập</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

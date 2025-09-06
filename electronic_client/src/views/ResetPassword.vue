<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-md mx-auto p-6">
      <div class="mt-8 bg-white rounded-lg shadow-md p-8">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900">Đặt lại mật khẩu</h2>
          <p class="mt-2 text-gray-600">
            Nhập mật khẩu mới của bạn
          </p>
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm"
        >
          {{ error }}
        </div>

        <!-- Success Message -->
        <div
          v-if="success"
          class="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm"
        >
          {{ success }}
          <div class="mt-2">
            <router-link
              to="/login"
              class="text-green-700 font-medium hover:text-green-800"
            >
              Đăng nhập ngay
            </router-link>
          </div>
        </div>

        <form v-if="!success" @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Password Input -->
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Mật khẩu mới
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

          <!-- Confirm Password Input -->
          <div>
            <label
              for="confirmPassword"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              :disabled="loading"
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Đang xử lý...</span>
            <span v-else>Đặt lại mật khẩu</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { validateResetToken, resetPassword } from '../api/passwordService';

const route = useRoute();
const router = useRouter();
const token = route.params.token;

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

// Kiểm tra token khi component được tải
onMounted(async () => {
  try {
    loading.value = true;
    await validateResetToken(token);
  } catch (err) {
    error.value = 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn';
    console.error('Token validation error:', err);
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async () => {
  try {
    // Validate passwords
    if (password.value !== confirmPassword.value) {
      error.value = 'Mật khẩu xác nhận không khớp';
      return;
    }

    if (password.value.length < 6) {
      error.value = 'Mật khẩu phải có ít nhất 6 ký tự';
      return;
    }

    loading.value = true;
    error.value = '';

    await resetPassword(token, password.value);
    
    success.value = 'Đặt lại mật khẩu thành công!';
    password.value = '';
    confirmPassword.value = '';

  } catch (err) {
    console.error('Password reset error:', err);
    error.value = err.message || 'Đã có lỗi xảy ra';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-md mx-auto p-6">
      <div class="mt-8 bg-white rounded-lg shadow-md p-8">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900">Quên mật khẩu</h2>
          <p class="mt-2 text-gray-600" v-if="!token">
            Nhập email của bạn để đặt lại mật khẩu
          </p>
          <p class="mt-2 text-gray-600" v-else>
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
        </div>

        <!-- Email Input Form -->
        <form v-if="!token" @submit.prevent="handleForgotPassword" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
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

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Đang xử lý...</span>
            <span v-else>Gửi yêu cầu</span>
          </button>
        </form>

        <!-- Reset Password Form -->
        <form v-else @submit.prevent="handleResetPassword" class="space-y-6">
          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới
            </label>
            <input
              id="newPassword"
              v-model="newPassword"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              :disabled="loading"
            />
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              :disabled="loading"
            />
          </div>

          <div class="space-y-3">
            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">Đang xử lý...</span>
              <span v-else>Đặt lại mật khẩu</span>
            </button>

            <button
              type="button"
              @click="handleRequestOTP"
              :disabled="loading"
              class="w-full text-blue-600 text-sm hover:text-blue-800"
            >
              Gửi lại mã OTP
            </button>
          </div>
        </form>

        <!-- Navigation -->
        <div class="text-center mt-6">
          <router-link
            to="/login"
            class="text-sm text-blue-600 hover:text-blue-800"
          >
            ← Quay lại đăng nhập
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from '@/utils/axiosConfig';

const router = useRouter();
const route = useRoute();
const email = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');
const token = ref(route.params.token);

const clearMessages = () => {
  error.value = '';
  success.value = '';
};

const validateToken = async () => {
  if (!token.value) return;
  
  try {
    await axios.get(`/auth/validate-token/${token.value}`);
  } catch (err) {
    error.value = 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn';
    token.value = null;
  }
};

const handleForgotPassword = async () => {
  if (!email.value || loading.value) return;

  clearMessages();
  loading.value = true;

  try {
    const response = await axios.post('/auth/forgot-password', {
      email: email.value
    });

    success.value = 'Token đặt lại mật khẩu đã được tạo';
    token.value = response.data.resetToken;
  } catch (err) {
    console.error('Forgot password error:', err);
    error.value = err.response?.data?.message || 'Đã có lỗi xảy ra';
  } finally {
    loading.value = false;
  }
};

const handleResetPassword = async () => {
  if (!newPassword.value || !confirmPassword.value || loading.value) return;

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Mật khẩu xác nhận không khớp';
    return;
  }

  clearMessages();
  loading.value = true;

  try {
    await axios.post('/auth/reset-password', {
      token: token.value,
      newPassword: newPassword.value
    });

    success.value = 'Đặt lại mật khẩu thành công';
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (err) {
    console.error('Reset password error:', err);
    error.value = err.response?.data?.message || 'Đã có lỗi xảy ra';
    if (err.response?.status === 400) {
      token.value = null;
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (token.value) {
    validateToken();
  }
});
</script>

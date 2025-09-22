<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-md mx-auto p-6">
      <div class="mt-8 bg-white rounded-lg shadow-md p-8">
        
        <!-- Progress Steps -->
        <div class="mb-8">
          <div class="flex items-center justify-center space-x-4">
            <div class="flex items-center">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              ]">
                1
              </div>
              <span class="ml-2 text-sm font-medium text-gray-900">Email</span>
            </div>
            
            <div class="w-8 h-0.5 bg-gray-300"></div>
            
            <div class="flex items-center">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              ]">
                2
              </div>
              <span class="ml-2 text-sm font-medium text-gray-900">OTP</span>
            </div>
            
            <div class="w-8 h-0.5 bg-gray-300"></div>
            
            <div class="flex items-center">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              ]">
                3
              </div>
              <span class="ml-2 text-sm font-medium text-gray-900">Mật khẩu</span>
            </div>
          </div>
        </div>

        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900">
            {{ stepTitles[currentStep - 1] }}
          </h2>
          <p class="mt-2 text-gray-600">
            {{ stepDescriptions[currentStep - 1] }}
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

        <!-- Step 1: Email Input -->
        <form v-if="currentStep === 1" @submit.prevent="sendOTP" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              :disabled="loading"
              placeholder="Nhập email của bạn"
            />
          </div>

          <button
            type="submit"
            :disabled="loading || !form.email"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Đang gửi...</span>
            <span v-else>Gửi mã OTP</span>
          </button>
        </form>

        <!-- Step 2: OTP Verification -->
        <form v-else-if="currentStep === 2" @submit.prevent="verifyOTP" class="space-y-6">
          <div>
            <label for="otp" class="block text-sm font-medium text-gray-700 mb-1">
              Mã OTP (6 số)
            </label>
            <input
              id="otp"
              v-model="form.otp"
              type="text"
              required
              maxlength="6"
              pattern="[0-9]{6}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
              :disabled="loading"
              placeholder="000000"
            />
            <p class="mt-1 text-sm text-gray-500">
              Mã OTP đã được gửi đến email: {{ form.email }}
            </p>
          </div>

          <div class="flex space-x-3">
            <button
              type="button"
              @click="goBack"
              class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Quay lại
            </button>
            <button
              type="submit"
              :disabled="loading || form.otp.length !== 6"
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">Đang xác thực...</span>
              <span v-else>Xác thực OTP</span>
            </button>
          </div>

          <div class="text-center">
            <button
              type="button"
              @click="resendOTP"
              :disabled="loading || !canResend"
              class="text-blue-600 hover:text-blue-800 text-sm disabled:text-gray-400"
            >
              <span v-if="canResend">Gửi lại mã OTP</span>
              <span v-else>Gửi lại sau {{ resendCountdown }}s</span>
            </button>
          </div>
        </form>

        <!-- Step 3: New Password -->
        <form v-else-if="currentStep === 3" @submit.prevent="resetPassword" class="space-y-6">
          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới
            </label>
            <input
              id="newPassword"
              v-model="form.newPassword"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              :disabled="loading"
              placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
            />
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              :disabled="loading"
              placeholder="Nhập lại mật khẩu mới"
            />
            <p v-if="form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword" 
               class="mt-1 text-sm text-red-600">
              Mật khẩu xác nhận không khớp
            </p>
          </div>

          <div class="flex space-x-3">
            <button
              type="button"
              @click="goBack"
              class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Quay lại
            </button>
            <button
              type="submit"
              :disabled="loading || !canResetPassword"
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">Đang đặt lại...</span>
              <span v-else>Đặt lại mật khẩu</span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { sendResetOTP, verifyResetOTP, resetPassword as resetPasswordAPI } from '@/api/passwordService';

const router = useRouter();

// State
const currentStep = ref(1);
const loading = ref(false);
const error = ref('');
const success = ref('');
const resendCountdown = ref(0);
const resendTimer = ref(null);

// Form data
const form = ref({
  email: '',
  otp: '',
  newPassword: '',
  confirmPassword: ''
});

// Step titles and descriptions
const stepTitles = [
  'Quên mật khẩu',
  'Xác thực OTP',
  'Đặt lại mật khẩu'
];

const stepDescriptions = [
  'Nhập email của bạn để nhận mã OTP',
  'Nhập mã OTP đã được gửi đến email',
  'Tạo mật khẩu mới cho tài khoản'
];

// Computed
const canResend = computed(() => resendCountdown.value === 0);
const canResetPassword = computed(() => 
  form.value.newPassword && 
  form.value.confirmPassword && 
  form.value.newPassword === form.value.confirmPassword &&
  form.value.newPassword.length >= 6
);

// Methods
const clearMessages = () => {
  error.value = '';
  success.value = '';
};

const startResendCountdown = () => {
  resendCountdown.value = 60;
  resendTimer.value = setInterval(() => {
    resendCountdown.value--;
    if (resendCountdown.value <= 0) {
      clearInterval(resendTimer.value);
    }
  }, 1000);
};

const sendOTP = async () => {
  clearMessages();
  loading.value = true;

  try {
    const response = await sendResetOTP(form.value.email);
    success.value = response.message;
    currentStep.value = 2;
    startResendCountdown();
  } catch (err) {
    error.value = err.message || 'Không thể gửi mã OTP. Vui lòng thử lại.';
  } finally {
    loading.value = false;
  }
};

const verifyOTP = async () => {
  clearMessages();
  loading.value = true;

  try {
    const response = await verifyResetOTP(form.value.email, form.value.otp);
    success.value = response.message;
    currentStep.value = 3;
  } catch (err) {
    error.value = err.message || 'Mã OTP không đúng. Vui lòng thử lại.';
  } finally {
    loading.value = false;
  }
};

const resetPassword = async () => {
  clearMessages();
  loading.value = true;

  try {
    const response = await resetPasswordAPI(
      form.value.email,
      form.value.otp,
      form.value.newPassword,
      form.value.confirmPassword
    );
    
    success.value = response.message;
    
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (err) {
    error.value = err.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.';
  } finally {
    loading.value = false;
  }
};

const resendOTP = async () => {
  await sendOTP();
};

const goBack = () => {
  clearMessages();
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// Lifecycle
onMounted(() => {
  // Reset form when component mounts
  form.value = {
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  };
});

onUnmounted(() => {
  if (resendTimer.value) {
    clearInterval(resendTimer.value);
  }
});
</script>
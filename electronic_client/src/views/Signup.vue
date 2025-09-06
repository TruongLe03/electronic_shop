<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { register } from "../api/authService";
import { useNotification } from "../composables/useNotification";
import { useGlobalLoading } from "../composables/useLoading";

const router = useRouter();
const authStore = useAuthStore();
const { notifyRegister, showError, showSuccess } = useNotification();
const { showFormLoading, hideLoading } = useGlobalLoading();

const formData = ref({
  email: "",
  username: "",
  phone_number: "",
  password: "",
  confirmPassword: "",
});

const errors = ref({});
const loading = ref(false);

const validateForm = () => {
  const newErrors = {};

  // Validate email
  if (!formData.value.email) {
    newErrors.email = "Vui lòng nhập email";
  } else if (!/\S+@\S+\.\S+/.test(formData.value.email)) {
    newErrors.email = "Email không hợp lệ";
  }

  // Validate username
  if (!formData.value.username) {
    newErrors.username = "Vui lòng nhập tên đăng nhập";
  } else if (formData.value.username.length < 3) {
    newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
  }

  // Validate phone
  if (!formData.value.phone_number) {
    newErrors.phone_number = "Vui lòng nhập số điện thoại";
  } else if (!/^[0-9]{10}$/.test(formData.value.phone_number)) {
    newErrors.phone_number = "Số điện thoại không hợp lệ";
  }
  // Validate password
  if (!formData.value.password) {
    newErrors.password = "Vui lòng nhập mật khẩu";
  } else if (formData.value.password.length < 6) {
    newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
  }

  // Validate confirm password
  if (!formData.value.confirmPassword) {
    newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
  } else if (formData.value.password !== formData.value.confirmPassword) {
    newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
  }

  return newErrors;
};

const handleSubmit = async () => {
  let loader;
  try {
    // Reset errors
    errors.value = {};

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      errors.value = validationErrors;
      return;
    }

    loading.value = true;
    
    // Hiển thị loading overlay
    loader = showFormLoading("Đang đăng ký tài khoản...");

    // Remove confirmPassword from data sent to server
    const { confirmPassword, ...userData } = formData.value;

    const response = await register(userData);

    // Check if we have a user in the response
    if (!response.user) {
      throw new Error("Invalid response from server");
    }

    // Cập nhật store
    authStore.updateUser(response.user);

    // Show success message and redirect to home page
    notifyRegister(true);
    router.push("/");
  } catch (error) {
    console.error("Registration error:", error);
    notifyRegister(false);
    if (error.message === "Email đã tồn tại") {
      errors.value.email = error.message;
    } else {
      errors.value.general = error.message || "Đã có lỗi xảy ra khi đăng ký";
    }
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
        <!-- Header -->
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900">Đăng ký tài khoản</h2>
          <p class="mt-2 text-gray-600">
            Đã có tài khoản?
            <router-link
              to="/login"
              class="text-blue-600 hover:text-blue-800 font-medium"
            >
              Đăng nhập
            </router-link>
          </p>
        </div>

        <!-- Error Message -->
        <div
          v-if="errors.general"
          class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm"
        >
          {{ errors.general }}
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Username -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Họ tên
            </label>
            <input
              v-model="formData.username"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.username }"
              :disabled="loading"
            />
            <p v-if="errors.username" class="mt-1 text-sm text-red-600">
              {{ errors.username }}
            </p>
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              v-model="formData.phone_number"
              type="tel"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.phone_number }"
              :disabled="loading"
            />
            <p v-if="errors.phone_number" class="mt-1 text-sm text-red-600">
              {{ errors.phone_number }}
            </p>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              v-model="formData.email"
              type="email"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.email }"
              :disabled="loading"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">
              {{ errors.email }}
            </p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              v-model="formData.password"
              type="password"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.password }"
              :disabled="loading"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">
              {{ errors.password }}
            </p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              v-model="formData.confirmPassword"
              type="password"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.confirmPassword }"
              :disabled="loading"
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Đang xử lý...</span>
            <span v-else>Đăng ký</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@stores/auth";
import { register, validateEmailFormat, checkEmailExists } from "@api/authService";
import { useNotification } from "@/composables/client/useNotification";
import { useGlobalLoading } from "@/composables/client/useLoading";

const router = useRouter();
const authStore = useAuthStore();
const { notifyRegister, showError, showSuccess } = useNotification();
const { showFormLoading, hideLoading } = useGlobalLoading();

// Kiểm tra nếu user đã đăng nhập và là admin thì redirect
onMounted(() => {
  if (authStore.isAuthenticated) {
    if (authStore.user?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  }
});

// Watch email changes with debounce
let emailTimeout;
watch(
  () => formData.value.email,
  (newEmail) => {
    clearTimeout(emailTimeout);
    
    // Reset validation state immediately
    emailValidation.value = { isChecking: false, isValid: null, message: "" };
    
    // If email is empty, don't validate
    if (!newEmail || newEmail.trim() === "") {
      return;
    }
    
    emailTimeout = setTimeout(() => {
      validateEmailAsync(newEmail);
    }, 500); // Debounce 500ms
  }
);

const formData = ref({
  email: "",
  username: "",
  phone_number: "",
  password: "",
  confirmPassword: "",
});

const errors = ref({});
const loading = ref(false);
const emailValidation = ref({
  isChecking: false,
  isValid: null,
  message: ""
});

const validateForm = () => {
  const newErrors = {};

  // Validate email
  if (!formData.value.email) {
    newErrors.email = "Vui lòng nhập email";
  } else if (!validateEmailFormat(formData.value.email)) {
    newErrors.email = "Email không đúng định dạng";
  } else if (emailValidation.value.isValid === false) {
    newErrors.email = emailValidation.value.message;
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

// Email validation functions
const validateEmailAsync = async (email) => {
  // Reset validation state first
  emailValidation.value = { isChecking: false, isValid: null, message: "" };
  
  if (!email || email.trim() === "") {
    return;
  }

  if (!validateEmailFormat(email)) {
    emailValidation.value = { 
      isChecking: false, 
      isValid: false, 
      message: "Email không đúng định dạng" 
    };
    return;
  }

  emailValidation.value.isChecking = true;

  try {
    const response = await checkEmailExists(email);
    console.log('Email validation response:', response); // Debug log
    
    // response đã được extract bởi extractResponseData utility
    if (response.exists) {
      emailValidation.value = {
        isChecking: false,
        isValid: false,
        message: "Email đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập."
      };
    } else {
      emailValidation.value = {
        isChecking: false,
        isValid: true,
        message: "Email hợp lệ, có thể đăng ký"
      };
    }
  } catch (error) {
    console.error('Email validation error:', error); // Debug log
    emailValidation.value = {
      isChecking: false,
      isValid: false,
      message: "Không thể kiểm tra email. Vui lòng thử lại."
    };
  }
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

    // Show success message
    notifyRegister(true);

    // Redirect based on role
    if (response.user.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/");
    }
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
            <div class="relative">
              <input
                v-model="formData.email"
                type="email"
                required
                class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-10"
                :class="{
                  'border-red-500': errors.email || emailValidation.isValid === false,
                  'border-green-500': emailValidation.isValid === true,
                  'border-gray-300': emailValidation.isValid === null
                }"
                :disabled="loading"
                placeholder="Nhập email của bạn"
              />
              
              <!-- Loading spinner -->
              <div v-if="emailValidation.isChecking" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              
              <!-- Success icon -->
              <div v-else-if="emailValidation.isValid === true" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              
              <!-- Error icon -->
              <div v-else-if="emailValidation.isValid === false" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            
            <!-- Error message -->
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">
              {{ errors.email }}
            </p>
            
            <!-- Email validation message -->
            <p v-else-if="emailValidation.message" 
               :class="[
                 'mt-1 text-sm',
                 emailValidation.isValid === true ? 'text-green-600' : 'text-red-600'
               ]">
              {{ emailValidation.message }}
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

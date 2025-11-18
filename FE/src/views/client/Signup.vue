<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@stores/auth";
import { useCartStore } from "@stores/cart";
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
  } else if (formData.value.username.length < 2) {
    newErrors.username = "Tên đăng nhập phải có ít nhất 2 ký tự";
  }

  // Validate phone
  if (!formData.value.phone_number) {
    newErrors.phone_number = "Vui lòng nhập số điện thoại";
  } else if (!/^(0|\+84)[3-9][0-9]{8}$/.test(formData.value.phone_number)) {
    newErrors.phone_number = "Số điện thoại không hợp lệ (phải bắt đầu bằng 0 hoặc +84, theo sau là 3-9 và 8 chữ số)";
  }
  // Validate password
  if (!formData.value.password) {
    newErrors.password = "Vui lòng nhập mật khẩu";
  } else if (formData.value.password.length < 6) {
    newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
  } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/.test(formData.value.password)) {
    newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ và số";
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

    // Check if we have a user and token in the response
    if (!response.user || !response.token) {
      throw new Error("Invalid response from server");
    }

    // Tự động đăng nhập sau khi đăng ký thành công
    // Token đã được lưu trong authService, giờ cập nhật store với token
    authStore.updateUser(response.user, response.token);

    // Đồng bộ giỏ hàng local lên server sau khi đăng ký
    const cartStore = useCartStore();
    await cartStore.syncLocalCartToServer();

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
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
    <div class="w-full max-w-lg">
      <!-- Logo/Brand Section -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Electronic Shop</h1>
        <p class="text-gray-600">Tạo tài khoản mới</p>
      </div>

      <!-- Main Form Card -->
      <div class="bg-white backdrop-blur-sm bg-opacity-90 rounded-2xl shadow-xl border border-gray-100 p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900">Đăng ký tài khoản</h2>
          <p class="mt-2 text-gray-600">
            Đã có tài khoản?
            <router-link
              to="/login"
              class="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Đăng nhập
            </router-link>
          </p>
        </div>

        <!-- Error Message -->
        <div
          v-if="errors.general"
          class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center"
        >
          <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          {{ errors.general }}
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Username -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              Họ tên
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                v-model="formData.username"
                type="text"
                class="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 placeholder-gray-400"
                :class="errors.username ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'"
                :disabled="loading"
                placeholder="Nhập họ tên của bạn"
              />
            </div>
            <p v-if="errors.username" class="text-sm text-red-600 flex items-center">
              <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              {{ errors.username }}
            </p>
          </div>

          <!-- Phone -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              Số điện thoại
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input
                v-model="formData.phone_number"
                type="tel"
                required
                class="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 placeholder-gray-400"
                :class="errors.phone_number ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'"
                :disabled="loading"
                placeholder="Nhập số điện thoại (VD: 0123456789)"
              />
            </div>
            <p v-if="errors.phone_number" class="text-sm text-red-600 flex items-center">
              <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              {{ errors.phone_number }}
            </p>
          </div>

          <!-- Email -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                v-model="formData.email"
                type="email"
                required
                class="w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 placeholder-gray-400"
                :class="{
                  'border-red-300 focus:border-red-500 focus:ring-red-200': errors.email || emailValidation.isValid === false,
                  'border-green-300 focus:border-green-500 focus:ring-green-200': emailValidation.isValid === true,
                  'border-gray-200 focus:border-purple-500 focus:ring-purple-200': emailValidation.isValid === null && !errors.email
                }"
                :disabled="loading"
                placeholder="Nhập email của bạn"
              />
              
              <!-- Validation Icons -->
              <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <!-- Loading spinner -->
                <div v-if="emailValidation.isChecking" class="flex items-center">
                  <svg class="w-5 h-5 text-purple-500 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                
                <!-- Success icon -->
                <div v-else-if="emailValidation.isValid === true" class="flex items-center">
                  <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <!-- Error icon -->
                <div v-else-if="emailValidation.isValid === false" class="flex items-center">
                  <div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Error message -->
            <p v-if="errors.email" class="text-sm text-red-600 flex items-center mt-2">
              <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              {{ errors.email }}
            </p>
            
            <!-- Email validation message -->
            <p v-else-if="emailValidation.message" 
               :class="[
                 'mt-2 text-sm font-medium flex items-center',
                 emailValidation.isValid === true ? 'text-green-600' : 'text-red-600'
               ]">
              <svg v-if="!emailValidation.isChecking" class="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path v-if="emailValidation.isValid === true" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                <path v-else fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              {{ emailValidation.message }}
            </p>
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              Mật khẩu
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                v-model="formData.password"
                type="password"
                required
                class="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 placeholder-gray-400"
                :class="errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'"
                :disabled="loading"
                placeholder="Mật khẩu (ít nhất 6 ký tự, có chữ và số)"
              />
            </div>
            <p v-if="errors.password" class="text-sm text-red-600 flex items-center">
              <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              {{ errors.password }}
            </p>
          </div>

          <!-- Confirm Password -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              Xác nhận mật khẩu
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input
                v-model="formData.confirmPassword"
                type="password"
                required
                class="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 placeholder-gray-400"
                :class="errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'"
                :disabled="loading"
                placeholder="Nhập lại mật khẩu"
              />
            </div>
            <p v-if="errors.confirmPassword" class="text-sm text-red-600 flex items-center">
              <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              {{ errors.confirmPassword }}
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading || emailValidation.isValid === false"
            class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:ring-4 focus:ring-purple-200 focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg mt-6"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang xử lý...
            </span>
            <span v-else class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Tạo tài khoản
            </span>
          </button>
        </form>

        <!-- Divider -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <p class="text-center text-sm text-gray-500">
            Bằng việc đăng ký, bạn đồng ý với 
            <a href="#" class="text-purple-600 hover:text-purple-700 font-medium">Điều khoản sử dụng</a> 
            và 
            <a href="#" class="text-purple-600 hover:text-purple-700 font-medium">Chính sách bảo mật</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

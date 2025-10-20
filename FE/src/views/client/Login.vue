<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@stores/auth";
import { useCartStore } from "@stores/cart";
import { useNotification } from "@/composables/client/useNotification";
import { useGlobalLoading } from "@/composables/client/useLoading";
import { checkEmailExists } from "@api/authService";

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const { notifyLogin, showError } = useNotification();
const { showFormLoading, hideLoading } = useGlobalLoading();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

// Email validation states
const emailValidation = ref({
  isChecking: false,
  isValid: null,
  message: "",
  exists: null,
});

let emailCheckTimeout = null;

// Email validation function
const validateEmailAsync = async (emailValue) => {
  if (!emailValue) {
    emailValidation.value = {
      isChecking: false,
      isValid: null,
      message: "",
      exists: null,
    };
    return;
  }

  // Check email format first
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailValue)) {
    emailValidation.value = {
      isChecking: false,
      isValid: false,
      message: "Email không đúng định dạng",
      exists: null,
    };
    return;
  }

  try {
    emailValidation.value.isChecking = true;
    emailValidation.value.message = "Đang kiểm tra email...";

    const response = await checkEmailExists(emailValue);

    await nextTick();

    // response đã được extract bởi extractResponseData utility
    if (response.exists) {
      emailValidation.value = {
        isChecking: false,
        isValid: true,
        message: "Email đã đăng ký, có thể đăng nhập",
        exists: true,
      };
    } else {
      emailValidation.value = {
        isChecking: false,
        isValid: false,
        message: "Email chưa được đăng ký. Vui lòng đăng ký trước.",
        exists: false,
      };
    }
  } catch (error) {
    console.error("Email validation error:", error);
    emailValidation.value = {
      isChecking: false,
      isValid: false,
      message: "Không thể kiểm tra email",
      exists: null,
    };
  }
};

// Watch email changes with debounce
watch(email, (newEmail) => {
  if (emailCheckTimeout) {
    clearTimeout(emailCheckTimeout);
  }

  emailCheckTimeout = setTimeout(() => {
    validateEmailAsync(newEmail);
  }, 500);
});

// Get email input style
const getEmailInputStyle = () => {
  if (emailValidation.value.isChecking) {
    return "border-blue-300 focus:border-blue-500 focus:ring-blue-200";
  }
  if (emailValidation.value.isValid === true) {
    return "border-green-300 focus:border-green-500 focus:ring-green-200";
  }
  if (emailValidation.value.isValid === false) {
    return "border-red-300 focus:border-red-500 focus:ring-red-200";
  }
  return "border-gray-200 focus:border-blue-500 focus:ring-blue-200";
};

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

const handleLogin = async () => {
  let loader;
  try {
    if (!email.value || !password.value) {
      error.value = "Vui lòng điền đầy đủ thông tin";
      showError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Kiểm tra email validation trước khi đăng nhập
    if (emailValidation.value.isValid === false) {
      error.value = emailValidation.value.message;
      showError(emailValidation.value.message);
      return;
    }

    loading.value = true;
    error.value = "";

    // Hiển thị loading overlay
    loader = showFormLoading("Đang đăng nhập...");

    // Sử dụng authStore.login thay vì gọi trực tiếp API
    const response = await authStore.login(email.value, password.value);

    console.log("Login response:", response);
    console.log("Auth store after login:", {
      user: authStore.user,
      token: authStore.token,
      isAuthenticated: authStore.isAuthenticated,
    });

    // Hiển thị thông báo thành công
    notifyLogin(true, response.user.name || response.user.email);

    // Load cart sau khi login thành công
    try {
      await cartStore.fetchCart();
      // Nếu có sản phẩm chờ thêm vào giỏ trước khi login, xử lý nó
      if (typeof cartStore.checkPendingCartItem === 'function') {
        try {
          await cartStore.checkPendingCartItem();
        } catch (e) {
          console.error('Error processing pending cart item after login:', e);
        }
      }
    } catch (error) {
      console.error("Error loading cart after login:", error);
    }

    // Chuyển hướng dựa trên role
    if (response.user.role === "admin") {
      // Nếu là admin thì chuyển thẳng đến dashboard
      router.push("/admin");
    } else {
      // Nếu là user thường thì xử lý như bình thường
      const intendedRoute = localStorage.getItem("intendedRoute");
      if (intendedRoute) {
        localStorage.removeItem("intendedRoute");
        router.push(intendedRoute);
      } else {
        router.push("/");
      }
    }
  } catch (err) {
    console.error("Login error:", err);

    // Xử lý các loại lỗi khác nhau
    if (err.message.includes("Email không tồn tại")) {
      error.value =
        "Email này chưa được đăng ký. Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới.";
    } else if (err.message.includes("Mật khẩu không đúng")) {
      error.value =
        "Mật khẩu không đúng. Vui lòng thử lại hoặc sử dụng chức năng quên mật khẩu.";
    } else if (err.message.includes("Email không đúng định dạng")) {
      error.value = "Email không đúng định dạng. Vui lòng kiểm tra lại.";
    } else {
      error.value = err.message || "Đã có lỗi xảy ra khi đăng nhập";
    }

    notifyLogin(false);
  } finally {
    loading.value = false;
    hideLoading(loader);
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo/Brand Section -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Electronic Shop</h1>
        <p class="text-gray-600">Chào mừng bạn trở lại</p>
      </div>

      <!-- Main Form Card -->
      <div class="bg-white backdrop-blur-sm bg-opacity-90 rounded-2xl shadow-xl border border-gray-100 p-8">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900">Đăng nhập</h2>
          <p class="mt-2 text-gray-600">
            Chưa có tài khoản?
            <router-link
              to="/signup"
              class="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Đăng ký ngay
            </router-link>
          </p>
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center"
        >
          <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Input -->
          <div class="space-y-2">
            <label
              for="email"
              class="block text-sm font-semibold text-gray-700"
            >
              Email
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                :class="`w-full pl-12 pr-12 py-3 border-2 rounded-xl transition-all duration-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 ${getEmailInputStyle()}`"
                :disabled="loading"
                placeholder="Nhập email của bạn"
              />

              <!-- Email validation icons -->
              <div
                class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none"
              >
                <!-- Loading icon -->
                <div v-if="emailValidation.isChecking" class="flex items-center">
                  <svg
                    class="w-5 h-5 text-blue-500 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
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

            <!-- Email validation message -->
            <div
              v-if="emailValidation.message && email"
              :class="`mt-2 text-sm font-medium flex items-center ${
                emailValidation.isChecking
                  ? 'text-blue-600'
                  : emailValidation.isValid === true
                  ? 'text-green-600'
                  : 'text-red-600'
              }`"
            >
              <svg v-if="!emailValidation.isChecking" class="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path v-if="emailValidation.isValid === true" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                <path v-else fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              {{ emailValidation.message }}
            </div>
          </div>

          <!-- Password Input -->
          <div class="space-y-2">
            <label
              for="password"
              class="block text-sm font-semibold text-gray-700"
            >
              Mật khẩu
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                class="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 focus:outline-none transition-all duration-200 placeholder-gray-400"
                :disabled="loading"
                placeholder="Nhập mật khẩu của bạn"
              />
            </div>
          </div>

          <!-- Forgot Password -->
          <div class="flex justify-end">
            <router-link
              to="/forgot-password"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Quên mật khẩu?
            </router-link>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading || emailValidation.isValid === false"
            class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:ring-4 focus:ring-blue-200 focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Đăng nhập
            </span>
          </button>
        </form>

        <!-- Divider -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <p class="text-center text-sm text-gray-500">
            Bằng việc đăng nhập, bạn đồng ý với 
            <a href="#" class="text-blue-600 hover:text-blue-700 font-medium">Điều khoản sử dụng</a> 
            và 
            <a href="#" class="text-blue-600 hover:text-blue-700 font-medium">Chính sách bảo mật</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

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
    return "border-blue-300 focus:border-blue-500 focus:ring-blue-500";
  }
  if (emailValidation.value.isValid === true) {
    return "border-green-300 focus:border-green-500 focus:ring-green-500";
  }
  if (emailValidation.value.isValid === false) {
    return "border-red-300 focus:border-red-500 focus:ring-red-500";
  }
  return "border-gray-300 focus:border-blue-500 focus:ring-blue-500";
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
            <div class="relative">
              <input
                id="email"
                v-model="email"
                type="email"
                required
                :class="`w-full px-4 py-2 pr-10 border rounded-lg transition-colors ${getEmailInputStyle()}`"
                :disabled="loading"
                placeholder="Nhập email của bạn"
              />

              <!-- Email validation icons -->
              <div
                class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
              >
                <!-- Loading icon -->
                <svg
                  v-if="emailValidation.isChecking"
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

                <!-- Success icon -->
                <svg
                  v-else-if="emailValidation.isValid === true"
                  class="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>

                <!-- Error icon -->
                <svg
                  v-else-if="emailValidation.isValid === false"
                  class="w-5 h-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <!-- Email validation message -->
            <div
              v-if="emailValidation.message && email"
              :class="`mt-1 text-xs ${
                emailValidation.isChecking
                  ? 'text-blue-600'
                  : emailValidation.isValid === true
                  ? 'text-green-600'
                  : 'text-red-600'
              }`"
            >
              {{ emailValidation.message }}
            </div>
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
              placeholder="Nhập mật khẩu của bạn"
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

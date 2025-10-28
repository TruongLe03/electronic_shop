<template>
  <Header />
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Progress Steps -->
      <div class="mb-8">
        <div class="flex items-center justify-center">
          <div class="flex items-center space-x-4">
            <!-- Step 1 -->
            <div class="flex items-center">
              <div
                class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold"
              >
                1
              </div>
              <span class="ml-2 text-sm font-medium text-blue-600"
                >Thông tin</span
              >
            </div>
            <div class="w-8 h-0.5 bg-gray-300"></div>
            <!-- Step 2 -->
            <div class="flex items-center">
              <div
                class="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold"
              >
                2
              </div>
              <span class="ml-2 text-sm font-medium text-gray-500"
                >Thanh toán</span
              >
            </div>
            <div class="w-8 h-0.5 bg-gray-300"></div>
            <!-- Step 3 -->
            <div class="flex items-center">
              <div
                class="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold"
              >
                3
              </div>
              <span class="ml-2 text-sm font-medium text-gray-500"
                >Xác nhận</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Checkout Form -->
        <div class="lg:w-2/3">
          <form
            id="checkout-form"
            @submit.prevent="processCheckout"
            class="space-y-6"
          >
            <!-- Customer Information -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-gray-800">
                  Thông tin khách hàng
                </h3>
                <div
                  v-if="authStore.isAuthenticated"
                  class="text-sm text-green-600 flex items-center"
                >
                  <svg
                    class="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Đã tự động điền thông tin
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    v-model="form.fullName"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    v-model="form.email"
                    type="email"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập địa chỉ email"
                  />
                </div>
              </div>
            </div>

            <!-- Delivery Information -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-xl font-bold text-gray-800 mb-4">
                Thông tin giao hàng
              </h3>

              <!-- Address Display Mode -->
              <div
                v-if="hasCompleteAddress && !isEditingAddress"
                class="space-y-4"
              >
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div class="flex items-start">
                    <svg
                      class="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-green-800 mb-1">
                        Địa chỉ giao hàng
                      </p>
                      <p class="text-gray-700 mb-3">{{ fullAddressText }}</p>
                      <button
                        @click="isEditingAddress = true"
                        type="button"
                        class="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                      >
                        <svg
                          class="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Thay đổi địa chỉ
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Address Form Mode -->
              <div
                v-if="!hasCompleteAddress || isEditingAddress"
                class="space-y-4"
              >
                <div
                  v-if="isEditingAddress"
                  class="flex justify-end space-x-2 mb-4"
                >
                  <button
                    @click="cancelAddressEdit"
                    type="button"
                    class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
                  >
                    Hủy thay đổi
                  </button>
                  <button
                    @click="saveAddressChanges"
                    type="button"
                    class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Lưu địa chỉ
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Tỉnh/Thành phố *
                    </label>
                    <select
                      v-model="form.province"
                      @change="onProvinceChange"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      <option
                        v-for="province in provinces"
                        :key="province.code"
                        :value="province.code"
                      >
                        {{ province.name }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Quận/Huyện *
                    </label>
                    <select
                      v-model="form.district"
                      @change="onDistrictChange"
                      :disabled="!form.province"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Chọn quận/huyện</option>
                      <option
                        v-for="district in districts"
                        :key="district.code"
                        :value="district.code"
                      >
                        {{ district.name }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Phường/Xã *
                    </label>
                    <select
                      v-model="form.ward"
                      :disabled="!form.district"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Chọn phường/xã</option>
                      <option
                        v-for="ward in wards"
                        :key="ward.code"
                        :value="ward.code"
                      >
                        {{ ward.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ cụ thể *
                  </label>
                  <input
                    v-model="form.address"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Số nhà, tên đường..."
                  />
                </div>
              </div>

              <!-- Notes field (chỉ 1 lần, luôn hiển thị) -->
              <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú đơn hàng
                </label>
                <textarea
                  v-model="form.notes"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ghi chú thêm về đơn hàng..."
                ></textarea>
              </div>
            </div>

            <!-- Payment Methods -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-xl font-bold text-gray-800 mb-4">
                Phương thức thanh toán
              </h3>
              <div class="space-y-3">
                <!-- COD -->
                <label
                  class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    v-model="form.paymentMethod"
                    type="radio"
                    value="cod"
                    class="mr-3 text-blue-600"
                  />
                  <div class="flex items-center">
                    <svg
                      class="w-6 h-6 mr-3 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                    <div>
                      <div class="font-semibold">
                        Thanh toán khi nhận hàng (COD)
                      </div>
                      <div class="text-sm text-gray-600">
                        Thanh toán bằng tiền mặt khi nhận hàng
                      </div>
                    </div>
                  </div>
                </label>
                <!-- VNPay -->
                <label
                  class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    v-model="form.paymentMethod"
                    type="radio"
                    value="vnpay"
                    class="mr-3 text-blue-600"
                  />
                  <div class="flex items-center">
                    <div
                      class="w-6 h-6 mr-3 bg-blue-600 rounded-full flex items-center justify-center"
                    >
                      <span class="text-white text-xs font-bold">V</span>
                    </div>
                    <div>
                      <div class="font-semibold">VNPay</div>
                      <div class="text-sm text-gray-600">
                        Thanh toán qua cổng VNPay
                      </div>
                    </div>
                  </div>
                </label>

                <!-- Bank -->
                <label
                  class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    v-model="form.paymentMethod"
                    type="radio"
                    value="bank"
                    class="mr-3 text-blue-600"
                  />
                  <div class="flex items-center">
                    <svg
                      class="w-6 h-6 mr-3 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <div>
                      <div class="font-semibold">Chuyển khoản ngân hàng</div>
                      <div class="text-sm text-gray-600">
                        Chuyển khoản qua ATM/Internet Banking
                      </div>
                    </div>
                  </div>
                </label>

                <!-- MoMo -->
                <label
                  class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    v-model="form.paymentMethod"
                    type="radio"
                    value="momo"
                    class="mr-3 text-blue-600"
                  />
                  <div class="flex items-center">
                    <div
                      class="w-6 h-6 mr-3 bg-pink-500 rounded-full flex items-center justify-center"
                    >
                      <span class="text-white text-xs font-bold">M</span>
                    </div>
                    <div>
                      <div class="font-semibold">Ví MoMo</div>
                      <div class="text-sm text-gray-600">
                        Thanh toán qua ví điện tử MoMo
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>

        <!-- Order Summary -->
        <div class="lg:w-1/3">
          <div class="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h3 class="text-xl font-bold text-gray-800 mb-4">
              Đơn hàng của bạn
            </h3>

            <!-- Order Items -->
            <div class="space-y-3 mb-6">
              <div
                v-for="item in displayItems"
                :key="item.productId || item.id"
                class="flex items-center gap-3"
              >
                <img
                  :src="getFullImage(item.image)"
                  :alt="item.name"
                  class="w-12 h-12 object-contain bg-gray-50 rounded-md"
                  @error="
                    (e) => {
                      e.target.src = getFullImage(null);
                    }
                  "
                />
                <div class="flex-1">
                  <p class="font-medium text-gray-800">{{ item.name }}</p>
                  <p class="text-sm text-gray-600">
                    {{ formatPrice(item.discount_price || item.price) }}
                    <span class="text-gray-400">x {{ item.quantity }}</span>
                  </p>
                </div>
                <p class="font-bold text-gray-900">
                  {{
                    formatPrice(
                      (item.discount_price || item.price) * item.quantity
                    )
                  }}
                </p>
              </div>
            </div>

            <hr class="border-gray-200 mb-4" />

            <!-- Order Total -->
            <div class="space-y-2 mb-6">
              <div class="flex justify-between text-sm text-gray-600">
                <span>Tạm tính</span>
                <span>{{ formatPrice(subtotal) }}</span>
              </div>
              <div class="flex justify-between text-sm text-gray-600">
                <span>Phí vận chuyển</span>
                <span>{{ formatPrice(shippingFee) }}</span>
              </div>
              <hr class="border-gray-200" />
              <div class="flex justify-between text-lg font-bold text-gray-800">
                <span>Tổng cộng</span>
                <span class="text-blue-600">{{ formatPrice(total) }}</span>
              </div>
            </div>

            <!-- Place Order Button -->
            <button
              type="submit"
              form="checkout-form"
              :disabled="!isFormValid || isProcessingOrder"
              class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              {{ isProcessingOrder ? "Đang xử lý..." : buttonText }}
            </button>

            <p class="text-xs text-gray-500 mt-3 text-center">
              Bằng việc đặt hàng, bạn đồng ý với
              <a href="#" class="text-blue-600 hover:underline"
                >Điều khoản sử dụng</a
              >
              của chúng tôi
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useCartStore } from "@stores/cart";
import { useAuthStore } from "@stores/auth";
import { useNotification } from "@/composables/client/useNotification";
import { useGlobalLoading } from "@/composables/client/useLoading";
import { orderService } from "@api/orderService";
import { userService } from "@api/userService";
import { addressService } from "@api/addressService";
import { paymentService } from "@api/paymentService";
import { getFullImage } from "@utils/imageUtils";
import Header from "@components/client/Header.vue";
import Footer from "@components/client/Footer.vue";

const router = useRouter();
const route = useRoute();
const cartStore = useCartStore();
const authStore = useAuthStore();
const { showSuccess, showError, showWarning } = useNotification();
const { showPageLoading, hideLoading } = useGlobalLoading();

// State
const order = ref(null);
const loading = ref(false);
const orderItems = ref([]); // Items to be ordered
const orderType = ref(""); // 'direct' or 'cart'
const isEditingAddress = ref(false); // To control address display mode
const isProcessingOrder = ref(false); // Prevent double submission

// Address data
const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);

// Form data
const form = ref({
  fullName: "",
  phone: "",
  email: "",
  province: "",
  district: "",
  ward: "",
  address: "",
  notes: "",
  paymentMethod: "cod",
});

const shippingFee = 30000; // Phí ship 30,000 VND

// Computed values
const subtotal = computed(() => {
  if (orderType.value === "direct" && orderItems.value.length > 0) {
    // For direct purchase, calculate from orderItems
    return orderItems.value.reduce((sum, item) => {
      const price = item.discount_price || item.price;
      return sum + price * item.quantity;
    }, 0);
  } else if (orderType.value === "cart") {
    // For cart checkout, use cart store
    return cartStore.cartTotal || 0;
  }
  return 0;
});

const total = computed(() => {
  return subtotal.value + shippingFee;
});

const displayItems = computed(() => {
  if (orderType.value === "direct") {
    return orderItems.value;
  } else if (orderType.value === "cart") {
    return cartStore.cartItems;
  }
  return [];
});

const isFormValid = computed(() => {
  const basicInfoValid =
    form.value.fullName &&
    form.value.phone &&
    form.value.email &&
    form.value.paymentMethod;

  // Check address validity
  const addressValid = hasCompleteAddress.value;

  console.log("Form validation:", {
    basicInfoValid,
    addressValid,
    hasCompleteAddress: hasCompleteAddress.value,
    formData: form.value,
  });

  return basicInfoValid && addressValid;
});

// Button text based on payment method
const buttonText = computed(() => {
  switch (form.value.paymentMethod) {
    case "cod":
      return "Đặt hàng";
    case "vnpay":
      return "Thanh toán với VNPay";
    case "momo":
      return "Thanh toán với MoMo";
    case "bank":
      return "Chuyển khoản ngân hàng";
    default:
      return "Đặt hàng";
  }
});

// Check if address is complete
const hasCompleteAddress = computed(() => {
  // If user has a full address text (from previous orders) with commas, consider it complete
  if (
    form.value.address &&
    form.value.address.includes(",") &&
    form.value.address.split(",").length >= 3
  ) {
    return true;
  }

  // Otherwise, check if all fields are filled for new address
  return (
    form.value.province &&
    form.value.district &&
    form.value.ward &&
    form.value.address
  );
});

// Full address text for display
const fullAddressText = computed(() => {
  if (!hasCompleteAddress.value) return "";

  // If address already contains full text (from previous order), use it directly
  if (
    form.value.address &&
    form.value.address.includes(",") &&
    form.value.address.split(",").length >= 3
  ) {
    return form.value.address;
  }

  // Otherwise, construct from separate fields
  const provinceName =
    provinces.value.find((p) => p.code == form.value.province)?.name ||
    form.value.province;
  const districtName =
    districts.value.find((d) => d.code == form.value.district)?.name ||
    form.value.district;
  const wardName =
    wards.value.find((w) => w.code == form.value.ward)?.name || form.value.ward;

  return `${form.value.address}, ${wardName}, ${districtName}, ${provinceName}`;
});

// Methods
const loadProvinces = async () => {
  try {
    const response = await addressService.getProvinces();
    if (response.success) {
      provinces.value = response.data;
    } else {
      showError(response.message);
    }
  } catch (error) {
    console.error("Error loading provinces:", error);
    showError("Không thể tải danh sách tỉnh/thành phố");
  }
};

const onProvinceChange = async () => {
  // Reset dependent fields
  form.value.district = "";
  form.value.ward = "";
  districts.value = [];
  wards.value = [];

  if (form.value.province) {
    try {
      const response = await addressService.getDistricts(form.value.province);
      if (response.success) {
        districts.value = response.data;
      } else {
        showError(response.message);
      }
    } catch (error) {
      console.error("Error loading districts:", error);
      showError("Không thể tải danh sách quận/huyện");
    }
  }
};

const onDistrictChange = async () => {
  // Reset dependent fields
  form.value.ward = "";
  wards.value = [];

  if (form.value.district) {
    try {
      const response = await addressService.getWards(form.value.district);
      if (response.success) {
        wards.value = response.data;
      } else {
        showError(response.message);
      }
    } catch (error) {
      console.error("Error loading wards:", error);
      showError("Không thể tải danh sách phường/xã");
    }
  }
};

const cancelAddressEdit = () => {
  isEditingAddress.value = false;
  // Optionally reload user profile to restore original values
  // loadUserProfile();
};

const saveAddressChanges = () => {
  // Validate that all address fields are filled
  if (
    !form.value.province ||
    !form.value.district ||
    !form.value.ward ||
    !form.value.address
  ) {
    showError("Vui lòng điền đầy đủ thông tin địa chỉ");
    return;
  }

  // Just exit edit mode without changing the data structure
  // Keep both individual fields and the street address as they are
  // The fullAddressText computed will handle displaying the full address
  isEditingAddress.value = false;
  showSuccess("Đã lưu địa chỉ thành công");
};

const loadUserProfile = async () => {
  if (!authStore.isAuthenticated) return;

  try {
    const response = await userService.getProfile();
    if (response.success && response.data) {
      const userData = response.data;

      // Auto-fill form with user data
      form.value.fullName = userData.name || "";
      form.value.phone = userData.phone_number || ""; // Use phone_number from model
      form.value.email = userData.email || "";

      // Auto-fill address if available
      if (userData.address) {
        form.value.address = userData.address;
      }

      // Auto-fill province and load dependent data
      if (userData.province) {
        form.value.province = userData.province;
        await onProvinceChange(); // Load districts for this province

        // Auto-fill district and load dependent data
        if (userData.district) {
          form.value.district = userData.district;
          await onDistrictChange(); // Load wards for this district

          // Auto-fill ward
          if (userData.ward) {
            form.value.ward = userData.ward;
          }
        }
      }

      console.log("User profile loaded and form auto-filled:", userData);
    }
  } catch (error) {
    console.error("Error loading user profile:", error);
    // Don't show error to user, just keep form empty
  }
};

const initializePayment = () => {
  // Check if coming from ProductDetail with product data
  if (route.query.type === "direct" && route.query.productData) {
    try {
      const productData = JSON.parse(route.query.productData);
      orderType.value = "direct";
      orderItems.value = [productData];
      console.log("Direct purchase - Product data:", productData);
    } catch (error) {
      console.error("Error parsing product data:", error);
      showError("Dữ liệu sản phẩm không hợp lệ");
      router.push("/");
      return;
    }
  }
  // Check if coming from Cart
  else if (cartStore.cartItems.length > 0) {
    orderType.value = "cart";
    console.log("Cart checkout - Cart items:", cartStore.cartItems);
  }
  // No data available
  else {
    showError("Không có sản phẩm để thanh toán");
    router.push("/cart");
    return;
  }
};

const fetchOrder = async (orderId) => {
  let loader;
  try {
    loading.value = true;
    loader = showPageLoading("Đang tải thông tin đơn hàng...");

    const response = await orderService.getOrderById(orderId);
    if (response.success) {
      order.value = response.data;
      console.log("Loaded order:", order.value);
      console.log("Order products:", order.value.products);
      if (order.value.products && order.value.products.length > 0) {
        console.log("First product image:", order.value.products[0].image);
      }
      // Pre-fill form with order info if available
      if (order.value.shipping_address) {
        form.value.address = order.value.shipping_address;
      }
    } else {
      showError("Không thể tải thông tin đơn hàng");
      console.error("Failed to load order:", response);
      // Don't redirect immediately, let user see the error
      // router.push('/cart')
    }
  } catch (error) {
    console.error("Error fetching order:", error);
    console.error("Error details:", error.response?.data);
    showError("Có lỗi xảy ra khi tải thông tin đơn hàng");
    // Don't redirect automatically, let user retry or navigate manually
    // router.push('/cart')
  } finally {
    loading.value = false;
    hideLoading(loader);
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Handle online payment methods
const handleOnlinePayment = async (orderId, paymentMethod) => {
  try {
    const loader = showPageLoading("Đang chuyển đến cổng thanh toán...");

    switch (paymentMethod) {
      case "vnpay":
        try {
          // Gọi API tạo URL thanh toán VNPay
          const response = await paymentService.createVNPayPayment({
            orderId: orderId,
            bankCode: null, // Có thể thêm chọn ngân hàng sau
          });

          if (response.success && response.data && response.data.paymentUrl) {
            showSuccess("Đang chuyển đến VNPay...");
            
            // Clear cart if order from cart before redirecting
            if (orderType.value === "cart") {
              try {
                await cartStore.fetchCart();
                if (cartStore.cartCount > 0) {
                  cartStore.clearCart();
                }
              } catch (error) {
                console.error("Error clearing cart:", error);
              }
            }
            
            // Chuyển hướng đến URL thanh toán VNPay
            window.location.href = response.data.paymentUrl;
          } else {
            throw new Error(response.message || "Không thể tạo URL thanh toán VNPay");
          }
        } catch (vnpayError) {
          console.error("VNPay error:", vnpayError);
          const errorMessage = vnpayError.response?.data?.message || 
                              vnpayError.message || 
                              "Không thể kết nối đến VNPay";
          showError(errorMessage);
        }
        break;

      default:
        showError("Phương thức thanh toán không hợp lệ");
    }

    hideLoading(loader);
  } catch (error) {
    console.error("Online payment error:", error);
    showError("Không thể kết nối đến cổng thanh toán. Vui lòng thử lại.");
    hideLoading(loader);
  }
};

const processCheckout = async () => {
  if (!isFormValid.value) {
    showError("Vui lòng điền đầy đủ thông tin");
    return;
  }

  // Prevent double submission
  if (isProcessingOrder.value) {
    showError("Đơn hàng đang được xử lý. Vui lòng đợi...");
    return;
  }

  let loader; // Declare loader outside try block
  let orderCreated = false; // Track if order was created successfully

  try {
    isProcessingOrder.value = true;
    loader = showPageLoading("Đang xử lý thanh toán...");

    // Prepare address for shipping
    let finalAddress = "";

    // If address already contains full text (from previous order), use it directly
    if (
      form.value.address &&
      form.value.address.includes(",") &&
      form.value.address.split(",").length >= 3
    ) {
      finalAddress = form.value.address;
    } else {
      // Otherwise, construct from separate fields (new address)
      const provinceName =
        provinces.value.find((p) => p.code == form.value.province)?.name || "";
      const districtName =
        districts.value.find((d) => d.code == form.value.district)?.name || "";
      const wardName =
        wards.value.find((w) => w.code == form.value.ward)?.name || "";

      finalAddress = `${form.value.address}, ${wardName}, ${districtName}, ${provinceName}`;
    }

    // Validate final address
    if (!finalAddress || finalAddress.trim() === "") {
      showError("Địa chỉ giao hàng không hợp lệ");
      hideLoading(loader);
      return;
    }

    // Prepare shipping info
    const shippingInfo = {
      name: form.value.fullName?.trim(),
      phone: form.value.phone?.trim(),
      address: finalAddress.trim(),
    };

    // Validate shipping info
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      showError("Thông tin giao hàng không đầy đủ");
      hideLoading(loader);
      return;
    }

    if (!form.value.paymentMethod) {
      showError("Vui lòng chọn phương thức thanh toán");
      hideLoading(loader);
      return;
    }

    console.log("Shipping info prepared:", shippingInfo);
    console.log("Payment method:", form.value.paymentMethod);

    let orderResponse = null;

    if (orderType.value === "direct") {
      // Create new order from direct purchase
      const productInfo = orderItems.value[0]; // Single product
      console.log("Direct order - productInfo:", productInfo);

      const productId = productInfo.productId || productInfo.id;
      if (!productId) {
        showError("Không tìm thấy thông tin sản phẩm");
        hideLoading(loader);
        return;
      }

      const orderData = {
        items: [
          {
            productId: productId,
            quantity: productInfo.quantity,
            price: productInfo.discount_price || productInfo.price,
          },
        ],
        shippingAddress: shippingInfo,
        paymentMethod: form.value.paymentMethod,
        note: form.value.notes,
      };

      console.log("Direct order - sending data:", orderData);
      orderResponse = await orderService.createDirectOrder(orderData);
    } else if (orderType.value === "cart") {
      // Create new order from cart
      if (cartStore.cartCount === 0) {
        showError("Giỏ hàng trống");
        hideLoading(loader);
        return;
      }

      // Format cart items for API
      const cartItems = cartStore.cartItems.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        discount_price: item.discount_price,
        image: item.image,
        quantity: item.quantity,
      }));

      orderResponse = await orderService.createOrderFromCart({
        shippingAddress: shippingInfo,
        paymentMethod: form.value.paymentMethod,
        note: form.value.notes,
      });
    }

    if (!orderResponse || !orderResponse.success) {
      const errorMessage = orderResponse?.message || "Không thể tạo đơn hàng";
      console.error("Order creation failed:", orderResponse);
      showError(errorMessage);
      hideLoading(loader);
      return;
    }

    const orderId = orderResponse.data._id;
    orderCreated = true; // Mark order as created successfully
    console.log("Order created successfully:", { orderId, orderResponse });

    // Note: User profile is automatically updated by backend when order is created

    // Clear cart if order from cart (for all payment methods)
    if (orderType.value === "cart") {
      try {
        // Force refresh cart from server to ensure sync
        await cartStore.fetchCart();
        // If cart is not empty on server, clear it
        if (cartStore.cartCount > 0) {
          cartStore.clearCart();
        }
      } catch (error) {
        console.error("Error clearing cart:", error);
        // Still proceed with order success even if cart clear fails
      }
    }

    // Handle payment method
    if (form.value.paymentMethod === "cod") {
      // COD payment - redirect to success page
      showSuccess("Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.");

      router.push({
        name: "orderSuccess",
        query: { orderId }, // Use query instead of params
      });
    } else {
      // Online payment - process payment
      await handleOnlinePayment(orderId, form.value.paymentMethod);
    }

    hideLoading(loader);
  } catch (error) {
    console.error("Checkout error:", error);

    // Kiểm tra xem có order nào được tạo thành công hay không trong trường hợp lỗi network
    if (!orderCreated && (error.request || error.code === "ECONNABORTED")) {
      try {
        console.log(
          "Checking for recent orders due to potential network error..."
        );
        const recentOrdersResponse = await orderService.getRecentOrdersByUser();

        if (
          recentOrdersResponse.success &&
          recentOrdersResponse.data.length > 0
        ) {
          const recentOrder = recentOrdersResponse.data[0];
          const orderTime = new Date(recentOrder.createdAt);
          const now = new Date();
          const timeDiff = now - orderTime;

          // Nếu có order được tạo trong vòng 2 phút qua, có thể đó là order vừa tạo
          if (timeDiff < 2 * 60 * 1000) {
          console.log(
            "Found recent order, redirecting to success page:",
            recentOrder._id
          );
          showSuccess("Đặt hàng thành công! Đang chuyển hướng...");

          // Clear cart if order from cart
          if (orderType.value === "cart") {
            try {
              await cartStore.fetchCart();
              if (cartStore.cartCount > 0) {
                cartStore.clearCart();
              }
            } catch (error) {
              console.error("Error clearing cart:", error);
            }
          }

          router.push({
            name: "orderSuccess",
            query: { orderId: recentOrder._id },
          });            if (loader) hideLoading(loader);
            return;
          }
        }
      } catch (verifyError) {
        console.error("Error verifying recent orders:", verifyError);
      }
    }

    // Xử lý chi tiết các loại lỗi
    let errorMessage = "Đã có lỗi xảy ra. Vui lòng thử lại.";

    if (error.success === false) {
      // Lỗi từ custom error handling
      errorMessage = error.message;
    } else if (error.response) {
      // Lỗi HTTP response
      const status = error.response.status;
      const data = error.response.data;

      if (status === 400) {
        errorMessage = data.message || "Thông tin đơn hàng không hợp lệ";
      } else if (status === 401) {
        errorMessage = "Vui lòng đăng nhập để tiếp tục";
      } else if (status === 500) {
        errorMessage = "Lỗi server. Vui lòng thử lại sau";
      } else {
        errorMessage = data.message || `Lỗi HTTP ${status}`;
      }
    } else if (error.request) {
      // Network error
      errorMessage = "Mất kết nối mạng trong quá trình đặt hàng.";
      showError(errorMessage);

      // Thêm notification cho user kiểm tra account
      setTimeout(() => {
        showWarning(
          "Vui lòng kiểm tra đơn hàng trong tài khoản để xác nhận đơn hàng đã được tạo hay chưa.",
          { duration: 8000 }
        );
      }, 3000);
    } else if (error.message) {
      errorMessage = error.message;
      showError(errorMessage);
    } else {
      showError(errorMessage);
    }
    if (loader) hideLoading(loader);
  } finally {
    isProcessingOrder.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  // Load provinces first
  await loadProvinces();

  // Initialize payment based on route params/query
  initializePayment();

  // Load user profile to auto-fill form if user is logged in
  await loadUserProfile();
});
</script>

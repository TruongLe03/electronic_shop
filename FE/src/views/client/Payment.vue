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
              <div v-if="showSavedAddress" class="space-y-4">
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
                        type="button"
                        @click="toggleEditAddress"
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
              <div v-if="showAddressForm" class="space-y-4">
                <!-- Nút hủy và chọn địa chỉ cũ -->
                <div
                  v-if="isEditingAddress && hasSavedAddress"
                  class="flex justify-between items-center"
                >
                  <p class="text-sm text-gray-600">
                    <svg
                      class="w-4 h-4 inline mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Nhập địa chỉ mới hoặc chọn địa chỉ đã lưu
                  </p>
                  <button
                    type="button"
                    @click="toggleEditAddress"
                    class="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Hủy
                  </button>
                </div>

                <!-- Dropdown chọn địa chỉ đã lưu -->
                <div v-if="savedAddressList.length > 0 && isEditingAddress">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <svg
                      class="w-4 h-4 inline mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    Chọn từ địa chỉ đã lưu
                  </label>
                  <select
                    @change="selectSavedAddress($event)"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                  >
                    <option value="">-- Chọn địa chỉ có sẵn --</option>
                    <option
                      v-for="(addr, index) in savedAddressList"
                      :key="index"
                      :value="index"
                    >
                      {{ addr }}
                    </option>
                  </select>
                  <p class="text-xs text-gray-500 mt-1">
                    Hoặc nhập địa chỉ mới bên dưới
                  </p>
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

                <!-- Nút lưu địa chỉ mới -->
                <div v-if="isEditingAddress" class="flex justify-end pt-2">
                  <button
                    type="button"
                    @click="saveNewAddress"
                    :disabled="!hasCompleteAddress"
                    class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-6 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <svg
                      class="w-5 h-5"
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
                    Lưu địa chỉ
                  </button>
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

                <!-- SePay / Bank Transfer -->
                <label
                  class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    v-model="form.paymentMethod"
                    type="radio"
                    value="sepay"
                    class="mr-3 text-blue-600"
                  />
                  <div class="flex items-center">
                    <svg
                      class="w-6 h-6 mr-3 text-purple-600"
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
                      <div class="font-semibold">
                        Chuyển khoản ngân hàng (SePay)
                      </div>
                      <div class="text-sm text-gray-600">
                        Chuyển khoản qua QR Code, tự động xác nhận
                      </div>
                    </div>
                  </div>
                </label>

                <!-- Bank (Legacy - keep for backward compatibility) -->
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

            <!-- Coupon Code -->
            <div class="mb-4">
              <!-- Applied Coupon Display -->
              <div v-if="appliedCoupon" class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Mã giảm giá
                </label>
                <div
                  class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div class="flex items-center gap-2">
                    <svg
                      class="w-5 h-5 text-green-600"
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
                    <div>
                      <p class="text-sm font-medium text-green-800">
                        Mã {{ appliedCoupon.code }} đã được áp dụng
                      </p>
                      <p class="text-xs text-green-600">
                        Giảm {{ formatPrice(discountAmount) }}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="removeCoupon"
                    class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>

              <!-- Add Coupon Button -->
              <div v-else>
                <button
                  type="button"
                  @click="showCouponModal = true"
                  class="w-full flex items-center justify-between px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                >
                  <div class="flex items-center gap-2">
                    <svg
                      class="w-5 h-5 text-gray-400 group-hover:text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span
                      class="text-sm font-medium text-gray-600 group-hover:text-blue-600"
                    >
                      Thêm mã giảm giá
                    </span>
                  </div>
                  <svg
                    class="w-5 h-5 text-gray-400 group-hover:text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Coupon Modal -->
            <div
              v-if="showCouponModal"
              class="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4"
              @click.self="showCouponModal = false"
            >
              <div
                class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              >
                <!-- Modal Header -->
                <div
                  class="flex items-center justify-between p-6 border-b border-gray-200"
                >
                  <h3 class="text-xl font-bold text-gray-800">
                    Chọn mã giảm giá
                  </h3>
                  <button
                    type="button"
                    @click="showCouponModal = false"
                    class="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      class="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <!-- Modal Body -->
                <div class="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                  <div
                    v-if="availableCoupons.length === 0"
                    class="text-center py-8"
                  >
                    <svg
                      class="w-16 h-16 mx-auto text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p class="text-gray-600">Không có mã giảm giá khả dụng</p>
                  </div>

                  <div v-else class="space-y-3">
                    <div
                      v-for="coupon in availableCoupons"
                      :key="coupon._id"
                      @click="
                        !isCouponDisabled(coupon) &&
                          selectCouponFromModal(coupon)
                      "
                      class="relative border rounded-lg p-4 transition-all cursor-pointer"
                      :class="[
                        isCouponDisabled(coupon)
                          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                          : selectedCouponId === coupon._id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-sm',
                      ]"
                    >
                      <!-- Checkbox -->
                      <div class="absolute top-4 right-4">
                        <input
                          type="radio"
                          :value="coupon._id"
                          v-model="selectedCouponId"
                          :disabled="isCouponDisabled(coupon)"
                          class="w-5 h-5 text-blue-600"
                        />
                      </div>

                      <div class="pr-8">
                        <!-- Coupon Code and Badge -->
                        <div class="flex items-center gap-2 mb-2">
                          <div
                            class="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-lg"
                          >
                            <svg
                              class="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                            <span class="font-bold text-sm">{{
                              coupon.code
                            }}</span>
                          </div>
                          <span
                            v-if="coupon.discount_type === 'percent'"
                            class="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded"
                          >
                            -{{ coupon.discount_value }}%
                          </span>
                          <span
                            v-else
                            class="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded"
                          >
                            -{{ formatPrice(coupon.discount_value) }}
                          </span>
                        </div>

                        <!-- Title -->
                        <h4 class="font-semibold text-gray-800 mb-2">
                          {{ coupon.title }}
                        </h4>

                        <!-- Description -->
                        <p
                          v-if="coupon.description"
                          class="text-sm text-gray-600 mb-3"
                        >
                          {{ coupon.description }}
                        </p>

                        <!-- Conditions -->
                        <div class="flex flex-wrap gap-3 text-xs text-gray-600">
                          <div class="flex items-center gap-1">
                            <svg
                              class="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span
                              >Đơn tối thiểu:
                              {{ formatPrice(coupon.min_order_value) }}</span
                            >
                          </div>
                          <div
                            v-if="coupon.max_discount_amount"
                            class="flex items-center gap-1"
                          >
                            <svg
                              class="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                              />
                            </svg>
                            <span
                              >Giảm tối đa:
                              {{
                                formatPrice(coupon.max_discount_amount)
                              }}</span
                            >
                          </div>
                          <div class="flex items-center gap-1">
                            <svg
                              class="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span
                              >HSD: {{ formatDate(coupon.expiry_date) }}</span
                            >
                          </div>
                        </div>

                        <!-- Not applicable message -->
                        <div
                          v-if="isCouponDisabled(coupon)"
                          class="mt-3 text-xs text-red-600 font-medium"
                        >
                          {{ getCouponDisabledReason(coupon) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Modal Footer -->
                <div class="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
                  <button
                    type="button"
                    @click="showCouponModal = false"
                    class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    @click="applySelectedCoupon"
                    :disabled="!selectedCouponId || isValidatingCoupon"
                    class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {{ isValidatingCoupon ? "Đang áp dụng..." : "Áp dụng" }}
                  </button>
                </div>
              </div>
            </div>

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
              <div
                v-if="discountAmount > 0"
                class="flex justify-between text-sm text-green-600"
              >
                <span>Giảm giá ({{ appliedCoupon?.code }})</span>
                <span>-{{ formatPrice(discountAmount) }}</span>
              </div>
              <hr class="border-gray-200" />
              <div class="flex justify-between text-lg font-bold text-gray-800">
                <span>Tổng cộng</span>
                <span class="text-blue-600">{{ formatPrice(total) }}</span>
              </div>
            </div>

            <!-- SePay Payment Form -->
            <div
              v-if="form.paymentMethod === 'sepay' && sepayPaymentData"
              class="mb-6"
            >
              <div
                class="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4"
              >
                <h4
                  class="font-bold text-blue-900 mb-3 flex items-center text-lg"
                >
                  <svg
                    class="w-6 h-6 mr-2 text-blue-600"
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
                  Thanh toán qua SePay
                </h4>
                <div class="bg-white rounded-lg p-3 mb-3">
                  <p class="text-sm text-gray-600 mb-1">
                    Đơn hàng:
                    <span class="font-semibold text-gray-800">{{
                      sepayPaymentData.orderNumber
                    }}</span>
                  </p>
                  <p class="text-sm text-gray-600">
                    Số tiền:
                    <span class="font-bold text-blue-600">{{
                      formatPrice(total)
                    }}</span>
                  </p>
                </div>
                <!-- Render form HTML từ backend -->
                <div
                  v-html="sepayPaymentData.formHtml"
                  class="sepay-form-container"
                ></div>
                <p
                  class="text-xs text-gray-500 mt-3 text-center flex items-center justify-center"
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Bảo mật bởi SePay Payment Gateway
                </p>
              </div>
            </div>

            <!-- Loading SePay Form -->
            <div
              v-else-if="form.paymentMethod === 'sepay' && isLoadingSepayForm"
              class="mb-6"
            >
              <div
                class="bg-gray-50 border-2 border-gray-200 rounded-lg p-8 text-center"
              >
                <div
                  class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"
                ></div>
                <p class="text-gray-700 font-medium">
                  Đang tải form thanh toán SePay...
                </p>
                <p class="text-gray-500 text-sm mt-2">
                  Vui lòng đợi trong giây lát
                </p>
              </div>
            </div>

            <!-- Place Order Button (for non-SePay methods) -->
            <button
              v-if="form.paymentMethod !== 'sepay'"
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
import { useNotificationStore } from "@stores/notificationStore";
import { useNotification } from "@/composables/client/useNotification";
import { useGlobalLoading } from "@/composables/client/useLoading";
import { orderService } from "@api/orderService";
import { userService } from "@api/userService";
import { addressService } from "@api/addressService";
import { paymentService } from "@api/paymentService";
import { validateCoupon, getPublicCoupons } from "@api/couponService";
import { createSepayPayment } from "@api/sepayService";
import { getFullImage } from "@utils/imageUtils";
import Header from "@components/client/Header.vue";
import Footer from "@components/client/Footer.vue";

const router = useRouter();
const route = useRoute();
const cartStore = useCartStore();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const { showSuccess, showError, showWarning } = useNotification();
const { showPageLoading, hideLoading } = useGlobalLoading();

// State
const order = ref(null);
const loading = ref(false);
const orderItems = ref([]); // Items to be ordered
const orderType = ref(""); // 'direct' or 'cart'

const isProcessingOrder = ref(false); // Prevent double submission

// SePay payment state
const sepayPaymentData = ref(null);
const isLoadingSepayForm = ref(false);

// Address data
const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);

// Coupon state
const couponCode = ref("");
const selectedCouponId = ref("");
const appliedCoupon = ref(null);
const discountAmount = ref(0);
const isValidatingCoupon = ref(false);
const availableCoupons = ref([]);
const showCouponModal = ref(false);

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
  return subtotal.value + shippingFee - discountAmount.value;
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

// State để quản lý hiển thị form hay địa chỉ đã lưu
const isEditingAddress = ref(false);
const hasSavedAddress = ref(false); // Track if user has saved address
const savedAddressData = ref(null); // Store original address data for cancel
const savedAddressList = ref([]); // Store all saved addresses
const showAddressSelector = ref(false); // Show address selection dropdown

// Check if address is complete (for validation when submitting order)
const hasCompleteAddress = computed(() => {
  // Check if all address fields are filled with meaningful data
  const hasProvince = !!form.value.province;
  const hasDistrict = !!form.value.district;
  const hasWard = !!form.value.ward;
  // Require at least 5 characters for detailed address
  const hasDetailedAddress =
    form.value.address && form.value.address.trim().length;

  return hasProvince && hasDistrict && hasWard && hasDetailedAddress;
});

// Show address form when: editing OR no saved address
const showAddressForm = computed(() => {
  return isEditingAddress.value || !hasCompleteAddress.value;
});

// Show saved address when: has complete address AND not editing
const showSavedAddress = computed(() => {
  return hasCompleteAddress.value && !isEditingAddress.value;
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
const parseAddressString = (addressString) => {
  // Parse address string: "Khu 1, Xã Bắc Sơn, Huyện Tam Nông, Tỉnh Phú Thọ"
  const parts = addressString.split(", ");

  let detailedAddress = "";
  let wardName = "";
  let districtName = "";
  let provinceName = "";

  if (parts.length >= 4) {
    detailedAddress = parts[0];
    wardName = parts[1].replace("Xã ", "").replace("Phường ", "").trim();
    districtName = parts[2].replace("Huyện ", "").replace("Quận ", "").trim();
    provinceName = parts[3].replace("Tỉnh ", "").replace("TP ", "").trim();
  } else if (parts.length >= 2) {
    detailedAddress = parts[0];
    provinceName = parts[parts.length - 1];
  }

  return { detailedAddress, wardName, districtName, provinceName };
};

const selectSavedAddress = async (event) => {
  const index = event.target.value;
  if (index === "") return;

  const selectedAddressString = savedAddressList.value[index];
  console.log("Selected saved address:", selectedAddressString);

  try {
    const { detailedAddress, wardName, districtName, provinceName } =
      parseAddressString(selectedAddressString);

    // Tìm province code
    const provinceItem = provinces.value.find((p) => p.name === provinceName);
    if (provinceItem) {
      form.value.province = provinceItem.code;
      await onProvinceChange();

      // Tìm district code
      if (districtName && districts.value.length > 0) {
        const districtItem = districts.value.find(
          (d) => d.name === districtName
        );
        if (districtItem) {
          form.value.district = districtItem.code;
          await onDistrictChange();

          // Tìm ward code
          if (wardName && wards.value.length > 0) {
            const wardItem = wards.value.find((w) => w.name === wardName);
            if (wardItem) {
              form.value.ward = wardItem.code;
            }
          }
        }
      }
    }

    // Set detailed address
    form.value.address = detailedAddress;

    // Tự động lưu địa chỉ đã chọn
    savedAddressData.value = {
      province: form.value.province,
      district: form.value.district,
      ward: form.value.ward,
      address: form.value.address,
    };

    // Đánh dấu có địa chỉ đã lưu và thoát chế độ edit
    hasSavedAddress.value = true;
    isEditingAddress.value = false;

    showSuccess("Đã chọn và lưu địa chỉ");

    // Reset dropdown
    event.target.value = "";
  } catch (error) {
    console.error("Error selecting saved address:", error);
    showError("Không thể load địa chỉ đã chọn");
  }
};

const saveNewAddress = () => {
  if (!hasCompleteAddress.value) {
    showError("Vui lòng điền đầy đủ thông tin địa chỉ");
    return;
  }

  console.log("Saving new address:", {
    province: form.value.province,
    district: form.value.district,
    ward: form.value.ward,
    address: form.value.address,
  });

  // Lưu địa chỉ mới vào savedAddressData
  savedAddressData.value = {
    province: form.value.province,
    district: form.value.district,
    ward: form.value.ward,
    address: form.value.address,
  };

  // Đánh dấu có địa chỉ đã lưu
  hasSavedAddress.value = true;

  // Thoát khỏi chế độ edit
  isEditingAddress.value = false;

  showSuccess("Đã lưu địa chỉ mới!");
  console.log(
    "Address saved successfully, isEditingAddress:",
    isEditingAddress.value
  );
};

const toggleEditAddress = async () => {
  console.log(
    "toggleEditAddress called, isEditingAddress:",
    isEditingAddress.value
  );

  if (isEditingAddress.value) {
    // Đang edit -> Hủy thay đổi -> Restore địa chỉ cũ
    console.log("Canceling edit, restoring address:", savedAddressData.value);

    if (savedAddressData.value) {
      // Restore address data
      const savedWard = savedAddressData.value.ward;

      form.value.province = savedAddressData.value.province;
      form.value.district = savedAddressData.value.district;
      form.value.ward = savedAddressData.value.ward;
      form.value.address = savedAddressData.value.address;

      // Load lại dropdowns, nhưng lưu ward để khôi phục sau khi load xong
      if (form.value.province) {
        try {
          const provinceResp = await addressService.getDistricts(
            form.value.province
          );
          if (provinceResp.success) {
            districts.value = provinceResp.data;
          }
        } catch (error) {
          console.error("Error loading districts on restore:", error);
        }
      }

      if (form.value.district) {
        try {
          const districtResp = await addressService.getWards(
            form.value.district
          );
          if (districtResp.success) {
            wards.value = districtResp.data;
          }
        } catch (error) {
          console.error("Error loading wards on restore:", error);
        }
      }

      // Restore ward sau khi dropdowns đã load
      form.value.ward = savedWard;

      console.log("Address restored successfully");
      console.log("Form after restore:", form.value);
      console.log("hasCompleteAddress:", hasCompleteAddress.value);
    }

    // Đặt về chế độ xem
    isEditingAddress.value = false;
    console.log(
      "isEditingAddress set to false, showSavedAddress should be:",
      hasCompleteAddress.value && !isEditingAddress.value
    );
  } else {
    // Không edit -> Bắt đầu edit -> Lưu địa chỉ hiện tại và clear form (show form trống)
    console.log("Starting edit, current address:", {
      province: form.value.province,
      district: form.value.district,
      ward: form.value.ward,
      address: form.value.address,
    });

    // Luôn lưu địa chỉ hiện tại để restore khi hủy
    savedAddressData.value = {
      province: form.value.province,
      district: form.value.district,
      ward: form.value.ward,
      address: form.value.address,
    };

    // Clear form để nhập địa chỉ mới
    form.value.province = "";
    form.value.district = "";
    form.value.ward = "";
    form.value.address = "";
    districts.value = [];
    wards.value = [];

    console.log("Cleared form for new address entry");
    isEditingAddress.value = true;
  }
};

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

  console.log("Province changed:", form.value.province);

  if (form.value.province) {
    try {
      const response = await addressService.getDistricts(form.value.province);
      console.log("Districts response:", response);
      if (response.success) {
        districts.value = response.data;
        console.log("Districts loaded:", districts.value);
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

const loadUserProfile = async () => {
  if (!authStore.isAuthenticated) return;

  try {
    // Lấy thông tin user
    const response = await userService.getProfile();
    if (response.success && response.data) {
      const userData = response.data;

      // Auto-fill form với thông tin cơ bản
      form.value.fullName = userData.username || "";
      form.value.phone = userData.phone_number || "";
      form.value.email = userData.email || "";
    }

    // Lấy danh sách địa chỉ của user (là array các string)
    const addressesResponse = await userService.getAddresses();
    if (
      addressesResponse.success &&
      addressesResponse.data &&
      addressesResponse.data.length > 0
    ) {
      // Lưu tất cả địa chỉ vào savedAddressList
      savedAddressList.value = addressesResponse.data;
      console.log("Loaded saved addresses:", savedAddressList.value);

      // Lấy địa chỉ đầu tiên từ array để hiển thị mặc định
      const savedAddressString = addressesResponse.data[0];

      if (savedAddressString) {
        // Backend lưu address dạng: "Khu 1, Xã Bắc Sơn, Huyện Tam Nông, Tỉnh Phú Thọ"
        // Parse để lấy địa chỉ chi tiết và tỉnh/huyện/xã
        const { detailedAddress, wardName, districtName, provinceName } =
          parseAddressString(savedAddressString);

        console.log("Parsed address:", {
          detailedAddress,
          wardName,
          districtName,
          provinceName,
        });

        // Tìm code từ tên
        if (provinceName) {
          const provinceItem = provinces.value.find(
            (p) => p.name === provinceName
          );
          if (provinceItem) {
            form.value.province = provinceItem.code;
            await onProvinceChange();

            if (districtName && districts.value.length > 0) {
              const districtItem = districts.value.find(
                (d) => d.name === districtName
              );
              if (districtItem) {
                form.value.district = districtItem.code;
                await onDistrictChange();

                if (wardName && wards.value.length > 0) {
                  const wardItem = wards.value.find((w) => w.name === wardName);
                  if (wardItem) {
                    form.value.ward = wardItem.code;
                  }
                }
              }
            }
          }
        }

        // Lưu địa chỉ chi tiết
        form.value.address = detailedAddress;

        console.log("Địa chỉ đã lưu được tải:", savedAddressString);
        console.log("Form values after load:", {
          province: form.value.province,
          district: form.value.district,
          ward: form.value.ward,
          address: form.value.address,
        });

        // Lưu lại địa chỉ gốc để có thể restore khi hủy thay đổi
        savedAddressData.value = {
          province: form.value.province,
          district: form.value.district,
          ward: form.value.ward,
          address: form.value.address,
          originalString: savedAddressString, // Lưu string gốc
        };

        // Đánh dấu là có địa chỉ đã lưu
        hasSavedAddress.value = true;

        // Đặt không ở chế độ edit vì đã có địa chỉ
        isEditingAddress.value = false;

        console.log("Saved address data:", savedAddressData.value);
        console.log("hasSavedAddress:", hasSavedAddress.value);
        console.log("isEditingAddress:", isEditingAddress.value);
      }
    } else {
      // Nếu chưa có địa chỉ, hiển thị form để nhập
      hasSavedAddress.value = false;
      isEditingAddress.value = true;
    }
  } catch (error) {
    console.error("Error loading user profile:", error);
    // Mặc định show form nếu có lỗi
    isEditingAddress.value = true;
  }
};

const initializePayment = () => {
  // Check if coming from "Buy Now" with tempOrder in localStorage
  const tempOrder = localStorage.getItem("tempOrder");
  if (tempOrder) {
    try {
      const orderData = JSON.parse(tempOrder);
      orderType.value = "direct";
      orderItems.value = orderData.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
      }));
      console.log("Buy Now - Order data:", orderData);
      // Clear tempOrder after using it
      localStorage.removeItem("tempOrder");
      return;
    } catch (error) {
      console.error("Error parsing temp order data:", error);
      localStorage.removeItem("tempOrder"); // Clear invalid data
    }
  }

  // Check if coming from ProductDetail with product data (legacy)
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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Handle online payment methods
const handleOnlinePayment = async (orderId, paymentMethod) => {
  try {
    const loader = showPageLoading("Đang chuyển đến cổng thanh toán...");

    switch (paymentMethod) {
      case "sepay":
        try {
          showSuccess("Đang chuyển đến cổng thanh toán SePay...");

          // Clear cart if order from cart before redirecting
          if (orderType.value === "cart") {
            try {
              await cartStore.clearCart();
            } catch (cartError) {
              console.error("Error clearing cart:", cartError);
            }
          }

          hideLoading(loader);

          // Redirect to SePay checkout page (will auto-submit to SePay)
          router.push({
            path: "/sepay/transfer",
            query: { orderId: orderId, total: total.value },
          });
        } catch (error) {
          hideLoading(loader);
          console.error("SePay redirect error:", error);
          showError("Có lỗi xảy ra khi chuyển đến trang thanh toán");
        }
        break;

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
            throw new Error(
              response.message || "Không thể tạo URL thanh toán VNPay"
            );
          }
        } catch (vnpayError) {
          console.error("VNPay error:", vnpayError);
          const errorMessage =
            vnpayError.response?.data?.message ||
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

// Load available coupons
const loadAvailableCoupons = async () => {
  try {
    const response = await getPublicCoupons();
    console.log("Load coupons response:", response);
    if (response.success) {
      availableCoupons.value = response.data || [];
      console.log("Available coupons loaded:", availableCoupons.value.length);
    }
  } catch (error) {
    console.error("Error loading coupons:", error);
    availableCoupons.value = []; // Ensure it's always an array
  }
};

// Handle coupon selection from dropdown
const onCouponSelect = () => {
  if (selectedCouponId.value) {
    const selectedCoupon = availableCoupons.value.find(
      (c) => c._id === selectedCouponId.value
    );
    if (selectedCoupon) {
      couponCode.value = selectedCoupon.code;
      applyCoupon();
    }
  }
};

// Apply coupon
const applyCoupon = async () => {
  if (!couponCode.value.trim()) {
    showWarning("Vui lòng nhập mã giảm giá");
    return;
  }

  if (!authStore.isAuthenticated) {
    showWarning("Vui lòng đăng nhập để sử dụng mã giảm giá");
    return;
  }

  isValidatingCoupon.value = true;

  try {
    const response = await validateCoupon(
      couponCode.value.toUpperCase(),
      subtotal.value
    );

    if (response.success) {
      // response.data chính là object coupon, không có nested .coupon
      appliedCoupon.value = response.data;
      discountAmount.value = response.data.discount_amount;
      showSuccess(`Đã áp dụng mã giảm giá ${appliedCoupon.value.code}`);
    } else {
      showError(response.message || "Mã giảm giá không hợp lệ");
    }
  } catch (error) {
    console.error("Error validating coupon:", error);
    showError(error.message || "Không thể áp dụng mã giảm giá");
  } finally {
    isValidatingCoupon.value = false;
  }
};

// Remove coupon
const removeCoupon = () => {
  appliedCoupon.value = null;
  discountAmount.value = 0;
  couponCode.value = "";
  selectedCouponId.value = "";
  showSuccess("Đã hủy mã giảm giá");
};

// Check if coupon is disabled based on conditions
const isCouponDisabled = (coupon) => {
  // Check minimum order value
  if (subtotal.value < coupon.min_order_value) {
    return true;
  }

  // Check if coupon has expired
  if (new Date(coupon.expiry_date) < new Date()) {
    return true;
  }

  // Check if coupon has reached max usage
  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return true;
  }

  return false;
};

// Get reason why coupon is disabled
const getCouponDisabledReason = (coupon) => {
  if (subtotal.value < coupon.min_order_value) {
    return `Đơn hàng tối thiểu ${formatPrice(coupon.min_order_value)}`;
  }

  if (new Date(coupon.expiry_date) < new Date()) {
    return "Mã giảm giá đã hết hạn";
  }

  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return "Mã giảm giá đã hết lượt sử dụng";
  }

  return "";
};

// Select coupon from modal (just update selectedCouponId)
const selectCouponFromModal = (coupon) => {
  if (!isCouponDisabled(coupon)) {
    selectedCouponId.value = coupon._id;
  }
};

// Apply selected coupon from modal
const applySelectedCoupon = async () => {
  console.log(
    "Apply selected coupon - selectedCouponId:",
    selectedCouponId.value
  );
  console.log("Available coupons:", availableCoupons.value);

  if (!selectedCouponId.value) {
    showWarning("Vui lòng chọn mã giảm giá");
    return;
  }

  // Ensure availableCoupons is an array
  if (
    !Array.isArray(availableCoupons.value) ||
    availableCoupons.value.length === 0
  ) {
    showError("Danh sách mã giảm giá không khả dụng");
    console.error("availableCoupons is not valid:", availableCoupons.value);
    return;
  }

  const selectedCoupon = availableCoupons.value.find(
    (c) => c._id === selectedCouponId.value
  );

  console.log("Found selected coupon:", selectedCoupon);

  if (!selectedCoupon || !selectedCoupon.code) {
    showError("Không tìm thấy mã giảm giá");
    console.error("Selected coupon not found or missing code:", selectedCoupon);
    selectedCouponId.value = ""; // Reset selection
    return;
  }

  if (!authStore.isAuthenticated) {
    showWarning("Vui lòng đăng nhập để sử dụng mã giảm giá");
    return;
  }

  isValidatingCoupon.value = true;

  try {
    console.log("Calling validateCoupon with code:", selectedCoupon.code);
    const response = await validateCoupon(selectedCoupon.code, subtotal.value);
    console.log("Validation response:", response);

    if (response.success) {
      console.log("Response data:", response.data);
      // response.data chính là object coupon, không có nested .coupon
      appliedCoupon.value = response.data;
      discountAmount.value = response.data.discount_amount;
      couponCode.value = response.data.code;
      showCouponModal.value = false;
      showSuccess(
        `Đã áp dụng mã giảm giá ${
          appliedCoupon.value?.code || response.data.code
        }`
      );
    } else {
      showError(response.message || "Mã giảm giá không hợp lệ");
    }
  } catch (error) {
    console.error("Error validating coupon:", error);
    console.error("Error stack:", error.stack);
    showError(error.message || "Không thể áp dụng mã giảm giá");
  } finally {
    isValidatingCoupon.value = false;
  }
};

// Load SePay payment form when selecting SePay method
const loadSepayPaymentForm = async () => {
  if (!isFormValid.value) {
    showWarning("Vui lòng điền đầy đủ thông tin trước khi chọn SePay");
    form.value.paymentMethod = "cod";
    return;
  }

  isLoadingSepayForm.value = true;
  sepayPaymentData.value = null;

  try {
    // Prepare address
    let finalAddress = "";
    if (
      form.value.address &&
      form.value.address.includes(",") &&
      form.value.address.split(",").length >= 3
    ) {
      finalAddress = form.value.address;
    } else {
      const provinceName =
        provinces.value.find((p) => p.code == form.value.province)?.name || "";
      const districtName =
        districts.value.find((d) => d.code == form.value.district)?.name || "";
      const wardName =
        wards.value.find((w) => w.code == form.value.ward)?.name || "";
      finalAddress = `${form.value.address}, ${wardName}, ${districtName}, ${provinceName}`;
    }

    const shippingInfo = {
      name: form.value.fullName?.trim(),
      phone: form.value.phone?.trim(),
      address: finalAddress.trim(),
    };

    // Create order first
    let orderResponse = null;

    if (orderType.value === "direct") {
      const productInfo = orderItems.value[0];
      const productId =
        productInfo.productId || productInfo.id || productInfo.product?._id;

      orderResponse = await orderService.createDirectOrder({
        items: [
          {
            productId: productId,
            quantity: productInfo.quantity,
            price: productInfo.price,
          },
        ],
        shippingAddress: shippingInfo,
        paymentMethod: "sepay",
        note: form.value.notes,
        coupon_code: appliedCoupon.value?.code || null,
      });
    } else if (orderType.value === "cart") {
      orderResponse = await orderService.createOrderFromCart({
        shippingAddress: shippingInfo,
        paymentMethod: "sepay",
        note: form.value.notes,
        coupon_code: appliedCoupon.value?.code || null,
      });
    }

    if (!orderResponse || !orderResponse.success) {
      throw new Error(orderResponse?.message || "Không thể tạo đơn hàng");
    }

    const orderId = orderResponse.data._id;
    console.log("✅ Order created for SePay:", orderId);

    // Call SePay API to get payment form
    const sepayResponse = await createSepayPayment(orderId);
    console.log("📋 SePay API response:", sepayResponse);

    if (sepayResponse.success && sepayResponse.data) {
      sepayPaymentData.value = sepayResponse.data;
      console.log("✅ SePay payment data:", sepayPaymentData.value);
      console.log("📋 Form HTML:", sepayPaymentData.value.formHtml);
      showSuccess("Đã tải form thanh toán SePay");
    } else {
      throw new Error(
        sepayResponse.message || "Không thể tải form thanh toán SePay"
      );
    }
  } catch (error) {
    console.error("❌ Error loading SePay form:", error);
    showError(error.message || "Không thể tải form thanh toán SePay");
    form.value.paymentMethod = "cod";
  } finally {
    isLoadingSepayForm.value = false;
  }
};

const processCheckout = async () => {
  // CRITICAL DEBUG: Check coupon state at submission
  console.log("=== PROCESS CHECKOUT START ===");
  console.log("appliedCoupon at submission:", appliedCoupon.value);
  console.log("discountAmount at submission:", discountAmount.value);
  console.log("couponCode at submission:", couponCode.value);

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

      // Handle both old format (productId) and new format (product object)
      const productId =
        productInfo.productId || productInfo.id || productInfo.product?._id;
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
            price: productInfo.price, // Use price from tempOrder which already calculated discount
          },
        ],
        shippingAddress: shippingInfo,
        paymentMethod: form.value.paymentMethod,
        note: form.value.notes,
        coupon_code: appliedCoupon.value?.code || null,
      };

      console.log("Direct order - sending data:", orderData);
      console.log("Applied coupon:", appliedCoupon.value);
      console.log("Coupon code:", appliedCoupon.value?.code);
      console.log("Discount amount:", discountAmount.value);

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

      console.log("Cart order - Applied coupon:", appliedCoupon.value);
      console.log("Cart order - Coupon code:", appliedCoupon.value?.code);
      console.log("Cart order - Discount amount:", discountAmount.value);

      orderResponse = await orderService.createOrderFromCart({
        shippingAddress: shippingInfo,
        paymentMethod: form.value.paymentMethod,
        note: form.value.notes,
        coupon_code: appliedCoupon.value?.code || null,
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

    // Save address to user if authenticated (for future use)
    if (authStore.isAuthenticated) {
      try {
        const provinceName =
          provinces.value.find((p) => p.code == form.value.province)?.name ||
          form.value.province;
        const districtName =
          districts.value.find((d) => d.code == form.value.district)?.name ||
          form.value.district;
        const wardName =
          wards.value.find((w) => w.code == form.value.ward)?.name ||
          form.value.ward;

        // Tạo address string đầy đủ: "Khu 1, Xã Bắc Sơn, Huyện Tam Nông, Tỉnh Phú Thọ"
        const fullAddressString = `${form.value.address}, Xã ${wardName}, Huyện ${districtName}, Tỉnh ${provinceName}`;

        // Lưu địa chỉ vào user profile
        await userService.addAddress({
          address: fullAddressString, // Backend chỉ nhận address string
        });
        console.log("Address saved to user profile:", fullAddressString);
      } catch (error) {
        console.error("Error saving address:", error);
        // Don't show error to user, address saving is optional
      }
    }

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

    // Fetch notifications để cập nhật badge thông báo mới
    if (authStore.isAuthenticated) {
      try {
        await notificationStore.fetchUnreadCount();
        console.log("✅ Notification count updated after order creation");
      } catch (notifError) {
        console.error("❌ Error fetching notification count:", notifError);
        // Don't block the order success flow
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

            // Fetch notifications để cập nhật badge
            if (authStore.isAuthenticated) {
              try {
                await notificationStore.fetchUnreadCount();
                console.log("✅ Notification count updated (recovery flow)");
              } catch (notifError) {
                console.error(
                  "❌ Error fetching notification count:",
                  notifError
                );
              }
            }

            router.push({
              name: "orderSuccess",
              query: { orderId: recentOrder._id },
            });
            if (loader) hideLoading(loader);
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

// Watch subtotal changes and validate coupon again if needed
watch(subtotal, (newSubtotal) => {
  if (appliedCoupon.value && newSubtotal > 0) {
    // Re-validate coupon when subtotal changes
    validateCoupon(appliedCoupon.value.code, newSubtotal)
      .then((response) => {
        if (response.success) {
          discountAmount.value = response.data.discount_amount;
        } else {
          // Coupon no longer valid
          removeCoupon();
          showWarning("Mã giảm giá không còn hợp lệ với đơn hàng hiện tại");
        }
      })
      .catch(() => {
        removeCoupon();
      });
  }
});

// Watch showCouponModal to reload coupons when opening
watch(showCouponModal, async (newValue) => {
  if (newValue) {
    // Reload coupons when modal opens
    await loadAvailableCoupons();
  }
});

// Watch payment method change to load SePay form automatically
watch(
  () => form.value.paymentMethod,
  async (newMethod, oldMethod) => {
    if (newMethod === "sepay" && oldMethod !== "sepay") {
      console.log("🔵 Payment method changed to SePay, loading form...");
      await loadSepayPaymentForm();
    } else if (oldMethod === "sepay" && newMethod !== "sepay") {
      // Clear SePay data when switching away
      sepayPaymentData.value = null;
      console.log("🔴 Cleared SePay payment data");
    }
  }
);

// Lifecycle
onMounted(async () => {
  // Load provinces first
  await loadProvinces();

  // Initialize payment based on route params/query
  initializePayment();

  // Load user profile to auto-fill form if user is logged in
  await loadUserProfile();

  // Load available coupons
  await loadAvailableCoupons();
});
</script>

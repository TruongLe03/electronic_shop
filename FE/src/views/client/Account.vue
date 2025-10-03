<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 mb-2">
              Tài khoản của tôi
            </h1>
            <p class="text-lg text-gray-600">
              Quản lý thông tin cá nhân và cài đặt tài khoản
            </p>
          </div>
          <div class="hidden md:flex items-center space-x-4">
            <div class="bg-white rounded-full p-3 shadow-lg">
              <svg
                class="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-5 gap-8">
        <!-- Enhanced Sidebar Menu -->
        <div class="xl:col-span-1">
          <div
            class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
          >
            <!-- User Profile Header -->
            <div
              class="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white"
            >
              <div class="flex flex-col items-center text-center">
                <div class="relative">
                  <img
                    :src="user?.avatar || '/assets/icons/user.png'"
                    alt="Avatar"
                    class="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div
                    class="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white"
                  ></div>
                </div>
                <div class="mt-4">
                  <h3 class="text-xl font-bold">
                    {{ user?.name || "Chưa cập nhật" }}
                  </h3>
                  <p class="text-blue-100 text-sm">{{ user?.email }}</p>
                  <div
                    class="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs bg-white/20 text-white"
                  >
                    <svg
                      class="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    Thành viên VIP
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation Menu -->
            <nav class="p-6">
              <ul class="space-y-3">
                <li>
                  <button
                    @click="activeTab = 'profile'"
                    :class="[
                      'w-full text-left px-4 py-4 rounded-xl flex items-center transition-all duration-200 group',
                      activeTab === 'profile'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gray-50 hover:shadow-md',
                    ]"
                  >
                    <div
                      :class="[
                        'w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-colors',
                        activeTab === 'profile'
                          ? 'bg-white/20'
                          : 'bg-blue-100 group-hover:bg-blue-200',
                      ]"
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <span class="font-medium">Thông tin cá nhân</span>
                  </button>
                </li>
                <li>
                  <button
                    @click="activeTab = 'orders'"
                    :class="[
                      'w-full text-left px-4 py-4 rounded-xl flex items-center transition-all duration-200 group',
                      activeTab === 'orders'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gray-50 hover:shadow-md',
                    ]"
                  >
                    <div
                      :class="[
                        'w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-colors',
                        activeTab === 'orders'
                          ? 'bg-white/20'
                          : 'bg-green-100 group-hover:bg-green-200',
                      ]"
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
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                    </div>
                    <span class="font-medium">Đơn hàng của tôi</span>
                  </button>
                </li>
                <li>
                  <button
                    @click="activeTab = 'addresses'"
                    :class="[
                      'w-full text-left px-4 py-4 rounded-xl flex items-center transition-all duration-200 group',
                      activeTab === 'addresses'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gray-50 hover:shadow-md',
                    ]"
                  >
                    <div
                      :class="[
                        'w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-colors',
                        activeTab === 'addresses'
                          ? 'bg-white/20'
                          : 'bg-orange-100 group-hover:bg-orange-200',
                      ]"
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <span class="font-medium">Địa chỉ giao hàng</span>
                  </button>
                </li>
                <li>
                  <button
                    @click="activeTab = 'security'"
                    :class="[
                      'w-full text-left px-4 py-4 rounded-xl flex items-center transition-all duration-200 group',
                      activeTab === 'security'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gray-50 hover:shadow-md',
                    ]"
                  >
                    <div
                      :class="[
                        'w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-colors',
                        activeTab === 'security'
                          ? 'bg-white/20'
                          : 'bg-red-100 group-hover:bg-red-200',
                      ]"
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
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <span class="font-medium">Bảo mật</span>
                  </button>
                </li>
                <li>
                  <button
                    @click="activeTab = 'notifications'"
                    :class="[
                      'w-full text-left px-4 py-4 rounded-xl flex items-center transition-all duration-200 group',
                      activeTab === 'notifications'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gray-50 hover:shadow-md',
                    ]"
                  >
                    <div
                      :class="[
                        'w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-colors',
                        activeTab === 'notifications'
                          ? 'bg-white/20'
                          : 'bg-purple-100 group-hover:bg-purple-200',
                      ]"
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
                          d="M15 17h5l-5 5v-5zM7 7h.01M7 3h5l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
                        />
                      </svg>
                    </div>
                    <span class="font-medium">Cài đặt thông báo</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <!-- Enhanced Main Content -->
        <div class="xl:col-span-4">
          <!-- Profile Tab -->
          <div
            v-if="activeTab === 'profile'"
            class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <div class="flex items-center justify-between mb-8">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">
                  Thông tin cá nhân
                </h2>
                <p class="text-gray-600 mt-1">
                  Cập nhật thông tin và quản lý hồ sơ của bạn
                </p>
              </div>
              <div class="hidden md:block">
                <div
                  class="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium"
                >
                  <svg
                    class="w-4 h-4 inline-block mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Đã xác thực
                </div>
              </div>
            </div>

            <form @submit.prevent="updateProfile" class="space-y-8">
              <!-- Enhanced Avatar Upload -->
              <div
                class="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-6 md:space-y-0"
              >
                <div class="relative group">
                  <img
                    :src="user?.avatar || '/assets/icons/user.png'"
                    alt="Avatar"
                    class="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg transition-transform group-hover:scale-105"
                  />
                  <div
                    class="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <svg
                      class="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div class="flex-1">
                  <button
                    type="button"
                    @click="$refs.avatarInput.click()"
                    class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium"
                  >
                    <svg
                      class="w-5 h-5 inline-block mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Thay đổi ảnh đại diện
                  </button>
                  <input
                    ref="avatarInput"
                    type="file"
                    accept="image/*"
                    @change="handleAvatarUpload"
                    class="hidden"
                  />
                  <p class="text-sm text-gray-500 mt-3">
                    <svg
                      class="w-4 h-4 inline-block mr-1"
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
                    JPG, PNG hoặc GIF tối đa 5MB. Kích thước khuyến nghị:
                    400x400px
                  </p>
                </div>
              </div>

              <!-- Enhanced Form Fields -->
              <div class="bg-gray-50 rounded-2xl p-6">
                <h3
                  class="text-lg font-semibold text-gray-900 mb-4 flex items-center"
                >
                  <svg
                    class="w-5 h-5 mr-2 text-blue-600"
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
                  Thông tin cơ bản
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-700">
                      Họ và tên *
                    </label>
                    <div class="relative">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <svg
                          class="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <input
                        v-model="profileForm.name"
                        type="text"
                        class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-700">
                      Email
                    </label>
                    <div class="relative">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <svg
                          class="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                          />
                        </svg>
                      </div>
                      <input
                        v-model="profileForm.email"
                        type="email"
                        disabled
                        class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <p class="text-xs text-gray-500">
                      Email không thể thay đổi
                    </p>
                  </div>

                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-700">
                      Số điện thoại
                    </label>
                    <div class="relative">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <svg
                          class="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <input
                        v-model="profileForm.phone_number"
                        type="tel"
                        class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-700">
                      Ngày sinh
                    </label>
                    <div class="relative">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <svg
                          class="w-5 h-5 text-gray-400"
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
                      </div>
                      <input
                        v-model="profileForm.birthDate"
                        type="date"
                        class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                <div class="mt-6 space-y-2">
                  <label class="block text-sm font-semibold text-gray-700">
                    Địa chỉ
                  </label>
                  <div class="relative">
                    <div class="absolute top-3 left-3 pointer-events-none">
                      <svg
                        class="w-5 h-5 text-gray-400"
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
                    </div>
                    <textarea
                      v-model="profileForm.address"
                      rows="4"
                      class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      placeholder="Nhập địa chỉ chi tiết của bạn"
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Enhanced Save Button -->
              <div class="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  :disabled="loading"
                  class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
                >
                  <svg
                    v-if="loading"
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block"
                    xmlns="http://www.w3.org/2000/svg"
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
                  {{ loading ? "Đang lưu..." : "Lưu thay đổi" }}
                </button>
              </div>
            </form>
          </div>

          <!-- Enhanced Orders Tab -->
          <div
            v-if="activeTab === 'orders'"
            class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <div class="flex items-center justify-between mb-8">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">
                  Đơn hàng của tôi
                </h2>
                <p class="text-gray-600 mt-1">
                  Theo dõi và quản lý các đơn hàng của bạn
                </p>
              </div>
              <div class="hidden md:flex items-center space-x-4">
                <div
                  class="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
                >
                  Tổng: {{ orders.length }} đơn hàng
                </div>
              </div>
            </div>

            <!-- Enhanced Order Filters -->
            <div class="flex flex-wrap gap-3 mb-8 p-4 bg-gray-50 rounded-2xl">
              <button
                v-for="status in orderStatuses"
                :key="status.value"
                @click="selectedOrderStatus = status.value"
                :class="[
                  'px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 transform',
                  selectedOrderStatus === status.value
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md border border-gray-200',
                ]"
              >
                {{ status.label }}
              </button>
            </div>

            <!-- Enhanced Orders List -->
            <div class="space-y-6">
              <div
                v-for="order in filteredOrders"
                :key="order.id"
                class="border-2 border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div
                  class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4"
                >
                  <div class="flex items-center space-x-4 mb-4 lg:mb-0">
                    <div
                      class="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-xl"
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
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-lg font-bold text-gray-900">
                        Đơn hàng #{{ order.orderId || order.id }}
                      </h3>
                      <p class="text-sm text-gray-600 flex items-center">
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {{ order.date }}
                      </p>
                    </div>
                  </div>
                  <span
                    :class="[
                      'px-4 py-2 rounded-xl text-sm font-bold',
                      getOrderStatusClass(order.status),
                    ]"
                  >
                    {{ getOrderStatusText(order.status) }}
                  </span>
                </div>

                <div class="bg-gray-50 rounded-2xl p-4">
                  <div class="flex items-center space-x-4">
                    <img
                      :src="getFullImage(order.image)"
                      :alt="order.productName"
                      class="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-md"
                      @error="(e) => (e.target.src = getFullImage(null))"
                    />
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-900 text-lg">
                        {{ order.productName }}
                      </h4>
                      <p class="text-sm text-gray-600 flex items-center mt-1">
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
                            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                          />
                        </svg>
                        Số lượng: {{ order.quantity }}
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="text-2xl font-bold text-gray-900">
                        {{ formatPrice(order.total) }}
                      </p>
                      <div class="flex space-x-2 mt-2">
                        <router-link
                          :to="`/order-detail/${order.id}`"
                          class="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors inline-block"
                        >
                          Xem chi tiết
                        </router-link>
                        <button
                          v-if="order.status === 'pending'"
                          @click="cancelOrder(order.id)"
                          class="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                        >
                          Hủy đơn
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Enhanced Security Tab -->
          <div
            v-if="activeTab === 'security'"
            class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <div class="flex items-center justify-between mb-8">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">
                  Bảo mật tài khoản
                </h2>
                <p class="text-gray-600 mt-1">
                  Quản lý mật khẩu và cài đặt bảo mật
                </p>
              </div>
              <div class="hidden md:block">
                <div
                  class="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium flex items-center"
                >
                  <svg
                    class="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Bảo mật tốt
                </div>
              </div>
            </div>

            <div
              class="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 mb-8"
            >
              <div class="flex items-start">
                <svg
                  class="w-6 h-6 text-yellow-600 mt-1 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div>
                  <h3 class="font-semibold text-yellow-800">Lưu ý bảo mật</h3>
                  <p class="text-yellow-700 text-sm mt-1">
                    Mật khẩu mạnh nên có ít nhất 8 ký tự, bao gồm chữ hoa, chữ
                    thường, số và ký tự đặc biệt.
                  </p>
                </div>
              </div>
            </div>

            <form @submit.prevent="changePassword" class="space-y-6">
              <div class="bg-gray-50 rounded-2xl p-6 space-y-6">
                <h3
                  class="text-lg font-semibold text-gray-900 flex items-center"
                >
                  <svg
                    class="w-5 h-5 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                  Đổi mật khẩu
                </h3>

                <div class="space-y-4">
                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-700">
                      Mật khẩu hiện tại *
                    </label>
                    <div class="relative">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <svg
                          class="w-5 h-5 text-gray-400"
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
                      </div>
                      <input
                        v-model="passwordForm.currentPassword"
                        type="password"
                        class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-700">
                      Mật khẩu mới *
                    </label>
                    <div class="relative">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <svg
                          class="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                          />
                        </svg>
                      </div>
                      <input
                        v-model="passwordForm.newPassword"
                        type="password"
                        class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Nhập mật khẩu mới"
                        @input="checkPasswordStrength"
                      />
                    </div>
                    <!-- Password Strength Indicator -->
                    <div v-if="passwordForm.newPassword" class="mt-2">
                      <div class="flex items-center space-x-2">
                        <div class="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            :class="[
                              'h-2 rounded-full transition-all duration-300',
                              passwordStrength.color,
                            ]"
                            :style="{ width: passwordStrength.width }"
                          ></div>
                        </div>
                        <span
                          :class="[
                            'text-xs font-medium',
                            passwordStrength.textColor,
                          ]"
                        >
                          {{ passwordStrength.text }}
                        </span>
                      </div>
                      <div class="mt-2 text-xs text-gray-600">
                        <p class="flex items-center">
                          <svg
                            :class="[
                              'w-3 h-3 mr-1',
                              passwordForm.newPassword.length >= 8
                                ? 'text-green-500'
                                : 'text-gray-400',
                            ]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clip-rule="evenodd"
                            ></path>
                          </svg>
                          Ít nhất 8 ký tự
                        </p>
                        <p class="flex items-center">
                          <svg
                            :class="[
                              'w-3 h-3 mr-1',
                              /[A-Z]/.test(passwordForm.newPassword)
                                ? 'text-green-500'
                                : 'text-gray-400',
                            ]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clip-rule="evenodd"
                            ></path>
                          </svg>
                          Có chữ hoa
                        </p>
                        <p class="flex items-center">
                          <svg
                            :class="[
                              'w-3 h-3 mr-1',
                              /[0-9]/.test(passwordForm.newPassword)
                                ? 'text-green-500'
                                : 'text-gray-400',
                            ]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clip-rule="evenodd"
                            ></path>
                          </svg>
                          Có số
                        </p>
                        <p class="flex items-center">
                          <svg
                            :class="[
                              'w-3 h-3 mr-1',
                              /[!@#$%^&*(),.?:{}|<>]/.test(
                                passwordForm.newPassword
                              )
                                ? 'text-green-500'
                                : 'text-gray-400',
                            ]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clip-rule="evenodd"
                            ></path>
                          </svg>
                          Có ký tự đặc biệt
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-700">
                      Xác nhận mật khẩu mới *
                    </label>
                    <div class="relative">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <svg
                          class="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <input
                        v-model="passwordForm.confirmPassword"
                        type="password"
                        class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Xác nhận mật khẩu mới"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  :disabled="loading"
                  class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
                >
                  <svg
                    v-if="loading"
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block"
                    xmlns="http://www.w3.org/2000/svg"
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
                  {{ loading ? "Đang cập nhật..." : "Đổi mật khẩu" }}
                </button>
              </div>
            </form>
          </div>

          <!-- Other tabs content here... -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useAuthStore } from "@stores/auth";
import { useNotification } from "@/composables/client/useNotification";
import { userService } from "@api/userService";
import { orderService } from "@api/orderService";
import { getFullImage } from "@utils/imageUtils";

const authStore = useAuthStore();
const { user } = authStore;
const {
  showSuccess,
  showError,
  showWarning,
  notifyProfileUpdate,
  notifyPasswordChange,
} = useNotification();

const activeTab = ref("profile");
const loading = ref(false);

// Password strength tracking
const passwordStrength = ref({
  score: 0,
  text: "",
  color: "",
  textColor: "",
  width: "0%",
});

// Profile Form
const profileForm = reactive({
  name: user?.name || "",
  email: user?.email || "",
  phone_number: user?.phone_number || "",
  address: user?.address || "",
  birthDate: user?.birthDate || "",
});

// Password Form
const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// Orders
const selectedOrderStatus = ref("all");

const orderStatuses = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" },
];

const orders = ref([]);

const loadUserOrders = async () => {
  try {
    console.log("=== LOADING USER ORDERS ===");
    console.log("Auth store user:", authStore.user);
    console.log("Is authenticated:", authStore.isAuthenticated);

    // Test API connection first
    try {
      const testResponse = await orderService.testAPI();
      console.log("Test API successful:", testResponse);
    } catch (testError) {
      console.error("Test API failed:", testError);
    }

    loading.value = true;
    const response = await orderService.getUserOrders();
    console.log("API response:", response);

    if (response.success) {
      console.log("Orders from API:", response.data);
      // Map order data to match the expected format
      orders.value = response.data.map((order) => ({
        id: order._id,
        orderId: order.orderId || order._id,
        date: new Date(order.createdAt).toLocaleDateString("vi-VN"),
        status: order.status,
        productName:
          order.products.length > 1
            ? `${order.products[0].name} (+${
                order.products.length - 1
              } sản phẩm khác)`
            : order.products[0]?.name || "Sản phẩm",
        quantity: order.products.reduce((sum, p) => sum + p.quantity, 0),
        total: order.total,
        image: getFullImage(order.products[0]?.image),
        products: order.products,
      }));
      console.log("Mapped orders:", orders.value);
    } else {
      console.error("API returned error:", response);
      showError("Không thể tải danh sách đơn hàng");
    }
  } catch (error) {
    console.error("Error loading user orders:", error);
    console.error("Error details:", error.response?.data);
    showError("Có lỗi xảy ra khi tải đơn hàng");
  } finally {
    loading.value = false;
  }
};

const cancelOrder = async (orderId) => {
  if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

  try {
    loading.value = true;
    const response = await orderService.cancelOrder(orderId);

    if (response.success) {
      showSuccess("Đơn hàng đã được hủy thành công");
      // Update order status in local array
      const orderIndex = orders.value.findIndex(
        (order) => order.id === orderId
      );
      if (orderIndex !== -1) {
        orders.value[orderIndex].status = "cancelled";
      }
    } else {
      showError(response.message || "Không thể hủy đơn hàng");
    }
  } catch (error) {
    console.error("Error cancelling order:", error);
    showError("Có lỗi xảy ra khi hủy đơn hàng");
  } finally {
    loading.value = false;
  }
};

const filteredOrders = computed(() => {
  if (selectedOrderStatus.value === "all") {
    return orders.value;
  }
  return orders.value.filter(
    (order) => order.status === selectedOrderStatus.value
  );
});

// Methods
const updateProfile = async () => {
  if (!profileForm.name?.trim()) {
    showError("Vui lòng nhập họ và tên");
    return;
  }

  if (!profileForm.phone_number?.trim()) {
    showError("Vui lòng nhập số điện thoại");
    return;
  }

  // Validate phone number
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(profileForm.phone_number)) {
    showError("Số điện thoại không hợp lệ (phải có 10 chữ số)");
    return;
  }

  loading.value = true;
  try {
    const profileData = {
      name: profileForm.name.trim(),
      email: profileForm.email, // Email không thể đổi
      phone: profileForm.phone_number,
      address: profileForm.address?.trim() || "",
    };

    const response = await userService.updateProfile(profileData);

    // Cập nhật thông tin user trong store
    authStore.updateUser(response.data);

    notifyProfileUpdate();
  } catch (error) {
    console.error("Update profile error:", error);
    const errorMessage =
      error.message || "Có lỗi xảy ra khi cập nhật thông tin";
    showError(errorMessage);
  } finally {
    loading.value = false;
  }
};

const changePassword = async () => {
  // Validation
  if (
    !passwordForm.currentPassword ||
    !passwordForm.newPassword ||
    !passwordForm.confirmPassword
  ) {
    showError("Vui lòng điền đầy đủ thông tin");
    return;
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showError("Mật khẩu xác nhận không khớp");
    return;
  }

  if (passwordForm.newPassword.length < 6) {
    showError("Mật khẩu mới phải có ít nhất 6 ký tự");
    return;
  }

  if (passwordForm.currentPassword === passwordForm.newPassword) {
    showError("Mật khẩu mới phải khác mật khẩu hiện tại");
    return;
  }

  // Debug: Check token
  const token = localStorage.getItem("token");
  console.log("Token exists:", !!token);
  console.log("Token value:", token ? token.substring(0, 20) + "..." : "null");

  loading.value = true;
  try {
    const passwordData = {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    };

    await userService.changePassword(passwordData);
    notifyPasswordChange();

    // Reset form
    Object.assign(passwordForm, {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  } catch (error) {
    console.error("Change password error:", error);
    const errorMessage = error.message || "Có lỗi xảy ra khi đổi mật khẩu";
    showError(errorMessage);
  } finally {
    loading.value = false;
  }
};

const handleAvatarUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      showError("Kích thước file không được vượt quá 5MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      showError("Chỉ chấp nhận file JPG, PNG hoặc GIF");
      return;
    }

    // Handle avatar upload
    console.log("Uploading avatar:", file);
    showSuccess("Đang tải lên ảnh đại diện...");
  }
};

// Password strength checker
const checkPasswordStrength = () => {
  const password = passwordForm.newPassword;
  let score = 0;

  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?:{}|<>]/.test(password)) score += 1;

  // Update strength indicator
  if (score <= 2) {
    passwordStrength.value = {
      score,
      text: "Yếu",
      color: "bg-red-500",
      textColor: "text-red-600",
      width: "33%",
    };
  } else if (score <= 4) {
    passwordStrength.value = {
      score,
      text: "Trung bình",
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      width: "66%",
    };
  } else {
    passwordStrength.value = {
      score,
      text: "Mạnh",
      color: "bg-green-500",
      textColor: "text-green-600",
      width: "100%",
    };
  }
};

const getOrderStatusClass = (status) => {
  const classes = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipping: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
};

const getOrderStatusText = (status) => {
  const texts = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    shipping: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  };
  return texts[status] || status;
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

onMounted(async () => {
  // Only load orders if user is authenticated
  if (authStore.isAuthenticated) {
    await loadUserOrders();
  } else {
    console.warn("User not authenticated, skipping order load");
    showError("Bạn cần đăng nhập để xem đơn hàng");
  }
});
</script>

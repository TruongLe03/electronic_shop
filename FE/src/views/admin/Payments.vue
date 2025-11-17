<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header với gradient background -->
      <div
        class="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg p-6"
      >
        <div class="flex items-center justify-between">
          <div class="text-white">
            <div class="flex items-center gap-3">
              <div class="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <i class="fas fa-credit-card text-2xl"></i>
              </div>
              <div>
                <h1 class="text-3xl font-bold">Quản lý thanh toán</h1>
                <p class="mt-1 text-emerald-100">
                  Theo dõi và quản lý các giao dịch thanh toán
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards với design hiện đại -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          class="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-500 mb-1">
                Tổng doanh thu
              </p>
              <p class="text-2xl font-bold text-gray-900">
                {{ formatCurrency(stats.total?.totalAmount || 0) }}
              </p>
            </div>
            <div
              class="p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg"
            >
              <i class="fas fa-money-bill-wave text-2xl text-white"></i>
            </div>
          </div>
        </div>

        <div
          class="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-500 mb-1">
                Tổng giao dịch
              </p>
              <p class="text-2xl font-bold text-gray-900">
                {{ stats.total?.totalPayments || 0 }}
              </p>
            </div>
            <div
              class="p-4 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl shadow-lg"
            >
              <i class="fas fa-receipt text-2xl text-white"></i>
            </div>
          </div>
        </div>

        <div
          class="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-500 mb-1">
                Giá trị trung bình
              </p>
              <p class="text-2xl font-bold text-gray-900">
                {{ formatCurrency(stats.total?.avgAmount || 0) }}
              </p>
            </div>
            <div
              class="p-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg"
            >
              <i class="fas fa-chart-line text-2xl text-white"></i>
            </div>
          </div>
        </div>

        <div
          class="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-500 mb-1">Chờ xử lý</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ getPendingCount() }}
              </p>
            </div>
            <div
              class="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg"
            >
              <i class="fas fa-clock text-2xl text-white"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Card với design mới -->
      <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div class="flex items-center gap-2 mb-4">
          <i class="fas fa-filter text-emerald-600"></i>
          <h3 class="font-semibold text-gray-800">Bộ lọc giao dịch</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <i class="fas fa-info-circle text-gray-400"></i>
            </div>
            <select
              v-model="filters.status"
              class="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Thành công</option>
              <option value="failed">Thất bại</option>
              <option value="cancelled">Đã hủy</option>
              <option value="refunded">Đã hoàn tiền</option>
              <option value="partially_refunded">Hoàn tiền 1 phần</option>
            </select>
          </div>

          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <i class="fas fa-wallet text-gray-400"></i>
            </div>
            <select
              v-model="filters.method"
              class="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="">Tất cả phương thức</option>
              <option value="cod">COD</option>
              <option value="vnpay">VNPay</option>
              <option value="momo">MoMo</option>
              <option value="zalopay">ZaloPay</option>
              <option value="bank_transfer">Chuyển khoản</option>
            </select>
          </div>

          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <i class="fas fa-calendar-alt text-gray-400"></i>
            </div>
            <input
              v-model="filters.startDate"
              type="date"
              class="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="Từ ngày"
            />
          </div>

          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <i class="fas fa-calendar-check text-gray-400"></i>
            </div>
            <input
              v-model="filters.endDate"
              type="date"
              class="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="Đến ngày"
            />
          </div>

          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <i class="fas fa-sort text-gray-400"></i>
            </div>
            <select
              v-model="filters.sortBy"
              class="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="createdAt">Ngày tạo</option>
              <option value="amount">Số tiền</option>
              <option value="status">Trạng thái</option>
            </select>
          </div>

          <div class="flex gap-2">
            <button
              @click="fetchPayments"
              class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-lg flex-1 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg transition-all"
            >
              <i class="fas fa-search"></i>
              Lọc
            </button>
            <button
              @click="resetFilters"
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all"
            >
              <i class="fas fa-redo"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Payments Table với design hiện đại -->
      <div
        class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
      >
        <div v-if="loading" class="p-12 text-center">
          <div class="inline-flex items-center justify-center">
            <div
              class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"
            ></div>
          </div>
          <p class="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>

        <div v-else-if="error" class="p-12 text-center">
          <div
            class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4"
          >
            <i class="fas fa-exclamation-circle text-3xl text-red-600"></i>
          </div>
          <p class="text-red-600 font-medium">{{ error }}</p>
        </div>

        <div v-else>
          <table class="w-full">
            <thead class="bg-gradient-to-r from-emerald-50 to-teal-50">
              <tr>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider"
                >
                  <i class="fas fa-hashtag mr-2"></i>Giao dịch
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider"
                >
                  <i class="fas fa-user mr-2"></i>Khách hàng
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider"
                >
                  <i class="fas fa-money-bill mr-2"></i>Số tiền
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider"
                >
                  <i class="fas fa-credit-card mr-2"></i>Phương thức
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider"
                >
                  <i class="fas fa-info-circle mr-2"></i>Trạng thái
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider"
                >
                  <i class="fas fa-calendar mr-2"></i>Ngày tạo
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider"
                >
                  <i class="fas fa-cog mr-2"></i>Thao tác
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr
                v-for="payment in payments"
                :key="payment._id"
                class="hover:bg-emerald-50 transition-colors duration-150"
              >
                <td class="px-6 py-4">
                  <div>
                    <div
                      class="text-sm font-semibold text-gray-900 flex items-center gap-2"
                    >
                      <i class="fas fa-file-invoice text-emerald-500"></i>
                      {{ payment.paymentId }}
                    </div>
                    <div class="text-sm text-gray-500 mt-1">
                      <i class="fas fa-shopping-bag text-gray-400 mr-1"></i>
                      Đơn: {{ payment.orderId?.orderNumber }}
                    </div>
                    <div
                      v-if="payment.gateway_transaction_id"
                      class="text-xs text-blue-600 mt-1 flex items-center gap-1"
                    >
                      <i class="fas fa-exchange-alt"></i>
                      GW: {{ payment.gateway_transaction_id }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div
                    v-if="payment.orderId?.userId"
                    class="flex items-center gap-2"
                  >
                    <div
                      class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold"
                    >
                      {{
                        payment.orderId.userId.username?.charAt(0).toUpperCase()
                      }}
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-gray-900">
                        {{ payment.orderId.userId.username }}
                      </div>
                      <div class="text-sm text-gray-500">
                        <i class="fas fa-envelope text-gray-400 mr-1"></i>
                        {{ payment.orderId.userId.email }}
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-sm text-gray-400 italic">
                    Không có thông tin
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-bold text-emerald-600">
                    {{ formatCurrency(payment.amount) }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ payment.currency }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="getMethodColor(payment.method)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg"
                  >
                    <i class="fas fa-credit-card"></i>
                    {{ getMethodLabel(payment.method) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="getStatusColor(payment.status)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg"
                  >
                    <i class="fas fa-circle text-xs"></i>
                    {{ getStatusLabel(payment.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                  <div class="flex items-center gap-1">
                    <i class="fas fa-clock text-gray-400"></i>
                    {{ formatDate(payment.createdAt) }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="viewPayment(payment)"
                      class="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                      title="Xem chi tiết"
                    >
                      <i class="fas fa-eye"></i>
                      Chi tiết
                    </button>
                    <button
                      v-if="canUpdateStatus(payment)"
                      @click="editPaymentStatus(payment)"
                      class="inline-flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                      title="Cập nhật trạng thái"
                    >
                      <i class="fas fa-edit"></i>
                      Cập nhật
                    </button>
                    <button
                      v-if="canRefund(payment)"
                      @click="initRefund(payment)"
                      class="inline-flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                      title="Hoàn tiền"
                    >
                      <i class="fas fa-undo"></i>
                      Hoàn tiền
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination với design mới -->
          <div
            v-if="pagination.totalPages > 1"
            class="px-6 py-4 bg-gray-50 border-t border-gray-100"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <i class="fas fa-info-circle text-emerald-500"></i>
                <span class="font-medium">
                  Hiển thị {{ (pagination.page - 1) * pagination.limit + 1 }} -
                  {{
                    Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )
                  }}
                </span>
                <span>trên tổng</span>
                <span class="font-semibold text-emerald-600">{{
                  pagination.total
                }}</span>
                <span>giao dịch</span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="changePage(pagination.page - 1)"
                  :disabled="!pagination.hasPrev"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <i class="fas fa-chevron-left"></i>
                  Trước
                </button>
                <div class="flex items-center gap-1">
                  <span
                    class="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-md"
                  >
                    {{ pagination.page }}
                  </span>
                  <span class="text-gray-500 mx-1">/</span>
                  <span class="text-gray-700 font-medium">{{
                    pagination.totalPages
                  }}</span>
                </div>
                <button
                  @click="changePage(pagination.page + 1)"
                  :disabled="!pagination.hasNext"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Sau
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Status Update Modal với design mới -->
    <div
      v-if="showStatusModal"
      class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div class="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 text-white">
              <div class="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <i class="fas fa-edit text-xl"></i>
              </div>
              <h3 class="text-xl font-bold">Cập nhật trạng thái</h3>
            </div>
            <button
              @click="closeStatusModal"
              class="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
            >
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <form @submit.prevent="updateStatus" class="p-6">
          <div class="space-y-5">
            <div>
              <label
                class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
              >
                <i class="fas fa-info-circle text-emerald-600"></i>
                Trạng thái <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <i class="fas fa-circle text-gray-400"></i>
                </div>
                <select
                  v-model="statusForm.status"
                  required
                  class="w-full border-2 border-gray-200 rounded-lg pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  <option
                    v-for="status in getAvailableStatuses(selectedPayment)"
                    :key="status.value"
                    :value="status.value"
                  >
                    {{ status.label }}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label
                class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
              >
                <i class="fas fa-comment-alt text-emerald-600"></i>
                Ghi chú
              </label>
              <textarea
                v-model="statusForm.note"
                rows="3"
                class="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                placeholder="Nhập ghi chú về việc cập nhật trạng thái..."
              ></textarea>
            </div>
          </div>

          <div
            class="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200"
          >
            <button
              type="button"
              @click="closeStatusModal"
              class="inline-flex items-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all"
            >
              <i class="fas fa-times"></i>
              Hủy bỏ
            </button>
            <button
              type="submit"
              :disabled="updating"
              class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <i
                :class="updating ? 'fas fa-spinner fa-spin' : 'fas fa-check'"
              ></i>
              {{ updating ? "Đang xử lý..." : "Cập nhật" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Payment Detail Modal với design mới -->
    <div
      v-if="showDetailModal && selectedPayment"
      class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div
          class="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex-shrink-0"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 text-white">
              <div class="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <i class="fas fa-file-invoice-dollar text-xl"></i>
              </div>
              <h3 class="text-xl font-bold">Chi tiết thanh toán</h3>
            </div>
            <button
              @click="closeDetailModal"
              class="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
            >
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <div class="p-6 overflow-y-auto flex-1 space-y-6">
          <!-- Thông tin cơ bản -->
          <div
            class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100"
          >
            <h4
              class="font-semibold text-gray-800 mb-4 flex items-center gap-2"
            >
              <i class="fas fa-info-circle text-blue-600"></i>
              Thông tin giao dịch
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white rounded-lg p-3 shadow-sm">
                <label
                  class="text-xs font-medium text-gray-500 uppercase flex items-center gap-1 mb-1"
                >
                  <i class="fas fa-hashtag text-blue-500"></i>
                  Mã giao dịch
                </label>
                <p class="text-sm font-semibold text-gray-900">
                  {{ selectedPayment.paymentId }}
                </p>
              </div>
              <div class="bg-white rounded-lg p-3 shadow-sm">
                <label
                  class="text-xs font-medium text-gray-500 uppercase flex items-center gap-1 mb-1"
                >
                  <i class="fas fa-money-bill-wave text-green-500"></i>
                  Số tiền
                </label>
                <p class="text-sm font-bold text-green-600">
                  {{ formatCurrency(selectedPayment.amount) }}
                </p>
              </div>
              <div class="bg-white rounded-lg p-3 shadow-sm">
                <label
                  class="text-xs font-medium text-gray-500 uppercase flex items-center gap-1 mb-1"
                >
                  <i class="fas fa-credit-card text-purple-500"></i>
                  Phương thức
                </label>
                <p class="text-sm font-semibold text-gray-900">
                  {{ getMethodLabel(selectedPayment.method) }}
                </p>
              </div>
              <div class="bg-white rounded-lg p-3 shadow-sm">
                <label
                  class="text-xs font-medium text-gray-500 uppercase flex items-center gap-1 mb-1"
                >
                  <i class="fas fa-circle-notch text-blue-500"></i>
                  Trạng thái
                </label>
                <span
                  :class="getStatusColor(selectedPayment.status)"
                  class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg"
                >
                  <i class="fas fa-circle text-xs"></i>
                  {{ getStatusLabel(selectedPayment.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Thông tin đơn hàng -->
          <div
            v-if="selectedPayment.orderId"
            class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100"
          >
            <h4
              class="font-semibold text-gray-800 mb-4 flex items-center gap-2"
            >
              <i class="fas fa-shopping-cart text-amber-600"></i>
              Thông tin đơn hàng
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white rounded-lg p-3 shadow-sm">
                <label
                  class="text-xs font-medium text-gray-500 uppercase flex items-center gap-1 mb-1"
                >
                  <i class="fas fa-barcode text-amber-500"></i>
                  Mã đơn hàng
                </label>
                <p class="text-sm font-semibold text-gray-900">
                  {{ selectedPayment.orderId.orderNumber }}
                </p>
              </div>
              <div class="bg-white rounded-lg p-3 shadow-sm">
                <label
                  class="text-xs font-medium text-gray-500 uppercase flex items-center gap-1 mb-1"
                >
                  <i class="fas fa-dollar-sign text-green-500"></i>
                  Tổng tiền
                </label>
                <p class="text-sm font-bold text-green-600">
                  {{ formatCurrency(selectedPayment.orderId.totalAmount) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Thông tin khách hàng -->
          <div
            v-if="selectedPayment.orderId?.userId"
            class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100"
          >
            <h4
              class="font-semibold text-gray-800 mb-4 flex items-center gap-2"
            >
              <i class="fas fa-user-circle text-purple-600"></i>
              Thông tin khách hàng
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white rounded-lg p-3 shadow-sm">
                <label
                  class="text-xs font-medium text-gray-500 uppercase flex items-center gap-1 mb-1"
                >
                  <i class="fas fa-user text-purple-500"></i>
                  Tên khách hàng
                </label>
                <p class="text-sm font-semibold text-gray-900">
                  {{ selectedPayment.orderId.userId.username }}
                </p>
              </div>
              <div class="bg-white rounded-lg p-3 shadow-sm">
                <label
                  class="text-xs font-medium text-gray-500 uppercase flex items-center gap-1 mb-1"
                >
                  <i class="fas fa-envelope text-blue-500"></i>
                  Email
                </label>
                <p class="text-sm font-semibold text-gray-900">
                  {{ selectedPayment.orderId.userId.email }}
                </p>
              </div>
              <div
                v-if="selectedPayment.orderId.userId.phone_number"
                class="bg-white rounded-lg p-3 shadow-sm col-span-2"
              >
                <label
                  class="text-xs font-medium text-gray-500 uppercase flex items-center gap-1 mb-1"
                >
                  <i class="fas fa-phone text-green-500"></i>
                  Số điện thoại
                </label>
                <p class="text-sm font-semibold text-gray-900">
                  {{ selectedPayment.orderId.userId.phone_number }}
                </p>
              </div>
            </div>
          </div>

          <!-- Thông tin thời gian -->
          <div
            class="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200"
          >
            <h4
              class="font-semibold text-gray-800 mb-4 flex items-center gap-2"
            >
              <i class="fas fa-clock text-gray-600"></i>
              Thời gian
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white rounded-lg p-3 shadow-sm">
                <label
                  class="text-xs font-medium text-gray-500 uppercase flex items-center gap-1 mb-1"
                >
                  <i class="fas fa-calendar-plus text-blue-500"></i>
                  Ngày tạo
                </label>
                <p class="text-sm font-semibold text-gray-900">
                  {{ formatDate(selectedPayment.createdAt) }}
                </p>
              </div>
              <div class="bg-white rounded-lg p-3 shadow-sm">
                <label
                  class="text-xs font-medium text-gray-500 uppercase flex items-center gap-1 mb-1"
                >
                  <i class="fas fa-calendar-check text-green-500"></i>
                  Cập nhật cuối
                </label>
                <p class="text-sm font-semibold text-gray-900">
                  {{ formatDate(selectedPayment.updatedAt) }}
                </p>
              </div>
            </div>
          </div>

          <!-- VNPay Transaction Details -->
          <div
            v-if="
              selectedPayment.method === 'vnpay' &&
              selectedPayment.gateway_response
            "
            class="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border border-red-100"
          >
            <h4
              class="font-semibold text-gray-800 mb-4 flex items-center gap-2"
            >
              <i class="fab fa-cc-visa text-red-600"></i>
              Thông tin giao dịch VNPay
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div v-if="selectedPayment.gateway_transaction_id">
                <label class="text-sm font-medium text-gray-700"
                  >Mã giao dịch VNPay</label
                >
                <p class="text-sm text-gray-900">
                  {{ selectedPayment.gateway_transaction_id }}
                </p>
              </div>
              <div v-if="selectedPayment.gateway_response?.vnp_BankCode">
                <label class="text-sm font-medium text-gray-700"
                  >Ngân hàng</label
                >
                <p class="text-sm text-gray-900">
                  {{
                    getBankName(selectedPayment.gateway_response.vnp_BankCode)
                  }}
                </p>
              </div>
              <div v-if="selectedPayment.gateway_response?.vnp_CardType">
                <label class="text-sm font-medium text-gray-700"
                  >Loại thẻ</label
                >
                <p class="text-sm text-gray-900">
                  {{
                    getCardType(selectedPayment.gateway_response.vnp_CardType)
                  }}
                </p>
              </div>
              <div v-if="selectedPayment.gateway_response?.vnp_PayDate">
                <label class="text-sm font-medium text-gray-700"
                  >Thời gian thanh toán</label
                >
                <p class="text-sm text-gray-900">
                  {{
                    formatVNPayDate(
                      selectedPayment.gateway_response.vnp_PayDate
                    )
                  }}
                </p>
              </div>
              <div v-if="selectedPayment.gateway_response?.vnp_ResponseCode">
                <label class="text-sm font-medium text-gray-700"
                  >Mã phản hồi</label
                >
                <p class="text-sm text-gray-900">
                  {{ selectedPayment.gateway_response.vnp_ResponseCode }} -
                  {{
                    getVNPayResponseMessage(
                      selectedPayment.gateway_response.vnp_ResponseCode
                    )
                  }}
                </p>
              </div>
              <div
                v-if="selectedPayment.gateway_response?.vnp_TransactionStatus"
              >
                <label class="text-sm font-medium text-gray-700"
                  >Trạng thái giao dịch</label
                >
                <p class="text-sm text-gray-900">
                  {{
                    getTransactionStatus(
                      selectedPayment.gateway_response.vnp_TransactionStatus
                    )
                  }}
                </p>
              </div>
            </div>
          </div>

          <!-- Payment Gateway Raw Response (for debugging) -->
          <div
            v-if="
              selectedPayment.gateway_response &&
              (selectedPayment.method === 'vnpay' ||
                selectedPayment.method === 'momo')
            "
            class="border-t pt-4"
          >
            <details class="cursor-pointer">
              <summary
                class="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Chi tiết phản hồi từ cổng thanh toán
              </summary>
              <pre
                class="text-xs bg-gray-100 p-3 rounded mt-2 overflow-auto max-h-32"
                >{{
                  JSON.stringify(selectedPayment.gateway_response, null, 2)
                }}</pre
              >
            </details>
          </div>

          <!-- Refund Information -->
          <div
            v-if="selectedPayment.refunds && selectedPayment.refunds.length > 0"
            class="border-t pt-4"
          >
            <h4 class="font-medium mb-2">Lịch sử hoàn tiền</h4>
            <div class="space-y-2">
              <div
                v-for="refund in selectedPayment.refunds"
                :key="refund._id"
                class="bg-gray-50 rounded p-3"
              >
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label class="font-medium text-gray-700"
                      >Số tiền hoàn</label
                    >
                    <p class="text-gray-900">
                      {{ formatCurrency(refund.amount) }}
                    </p>
                  </div>
                  <div>
                    <label class="font-medium text-gray-700">Trạng thái</label>
                    <p class="text-gray-900">
                      {{
                        refund.status === "completed"
                          ? "Đã hoàn"
                          : refund.status === "pending"
                          ? "Đang xử lý"
                          : "Thất bại"
                      }}
                    </p>
                  </div>
                  <div class="col-span-2">
                    <label class="font-medium text-gray-700">Lý do</label>
                    <p class="text-gray-900">{{ refund.reason }}</p>
                  </div>
                  <div>
                    <label class="font-medium text-gray-700">Ngày hoàn</label>
                    <p class="text-gray-900">
                      {{ formatDate(refund.refunded_at) }}
                    </p>
                  </div>
                  <div v-if="refund.refund_transaction_id">
                    <label class="font-medium text-gray-700"
                      >Mã giao dịch hoàn</label
                    >
                    <p class="text-gray-900">
                      {{ refund.refund_transaction_id }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="selectedPayment.refund_amount > 0" class="mt-2 text-sm">
              <strong>Tổng đã hoàn:</strong>
              {{ formatCurrency(selectedPayment.refund_amount) }}
            </div>
          </div>

          <div
            v-if="selectedPayment.admin_note || selectedPayment.adminNote"
            class="border-t pt-4"
          >
            <label class="text-sm font-medium text-gray-700"
              >Ghi chú admin</label
            >
            <p class="text-sm text-gray-900 mt-1">
              {{ selectedPayment.admin_note || selectedPayment.adminNote }}
            </p>
          </div>
        </div>

        <div
          class="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0"
        >
          <button
            @click="closeDetailModal"
            class="inline-flex items-center gap-2 px-6 py-3 text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg font-medium transition-all shadow-sm"
          >
            <i class="fas fa-times"></i>
            Đóng
          </button>
        </div>
      </div>
    </div>

    <!-- Refund Modal -->
    <div
      v-if="showRefundModal && selectedPayment"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4">Xử lý hoàn tiền</h3>

        <!-- Payment Info -->
        <div class="bg-gray-50 rounded-lg p-3 mb-4">
          <div class="text-sm">
            <div>
              <strong>Mã giao dịch:</strong> {{ selectedPayment.paymentId }}
            </div>
            <div>
              <strong>Số tiền gốc:</strong>
              {{ formatCurrency(selectedPayment.amount) }}
            </div>
            <div v-if="selectedPayment.refund_amount > 0">
              <strong>Đã hoàn:</strong>
              {{ formatCurrency(selectedPayment.refund_amount) }}
            </div>
            <div>
              <strong>Có thể hoàn:</strong>
              {{
                formatCurrency(
                  selectedPayment.amount - (selectedPayment.refund_amount || 0)
                )
              }}
            </div>
          </div>
        </div>

        <form @submit.prevent="processRefundAction">
          <div class="space-y-4">
            <!-- Refund Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Loại hoàn tiền *</label
              >
              <select
                v-model="refundForm.type"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                @change="
                  refundForm.type === 'full'
                    ? (refundForm.amount =
                        selectedPayment.amount -
                        (selectedPayment.refund_amount || 0))
                    : null
                "
              >
                <option value="full">Hoàn tiền toàn bộ</option>
                <option value="partial">Hoàn tiền 1 phần</option>
              </select>
            </div>

            <!-- Refund Amount -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Số tiền hoàn *</label
              >
              <input
                v-model.number="refundForm.amount"
                type="number"
                required
                :min="1"
                :max="
                  selectedPayment.amount - (selectedPayment.refund_amount || 0)
                "
                :readonly="refundForm.type === 'full'"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập số tiền cần hoàn..."
              />
            </div>

            <!-- Refund Reason -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Lý do hoàn tiền *</label
              >
              <textarea
                v-model="refundForm.reason"
                required
                rows="3"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập lý do hoàn tiền..."
              ></textarea>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="closeRefundModal"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              :disabled="processing"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {{ processing ? "Đang xử lý..." : "Xác nhận hoàn tiền" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AdminLayout from "@/layout/AdminLayout.vue";
import { useAdminPayments } from "@/composables/admin/useAdminPayments.js";

const {
  payments,
  pagination,
  stats,
  loading,
  error,
  fetchPayments,
  fetchPaymentStats,
  updatePaymentStatus,
  processRefund,
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel,
  getMethodColor,
  getMethodLabel,
} = useAdminPayments();

// UI State
const showStatusModal = ref(false);
const showDetailModal = ref(false);
const showRefundModal = ref(false);
const updating = ref(false);
const processing = ref(false);
const selectedPayment = ref(null);

// Filters
const filters = ref({
  status: "",
  method: "",
  startDate: "",
  endDate: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  limit: 10,
});

// Status form
const statusForm = ref({
  status: "",
  note: "",
});

// Refund form
const refundForm = ref({
  amount: 0,
  reason: "",
  type: "full", // 'full' or 'partial'
});

// Methods
const resetFilters = () => {
  filters.value = {
    status: "",
    method: "",
    startDate: "",
    endDate: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 10,
  };
  fetchPayments(filters.value);
  fetchPaymentStats();
};

const changePage = (page) => {
  filters.value.page = page;
  fetchPayments(filters.value);
};

const canUpdateStatus = (payment) => {
  // Chỉ cho phép cập nhật COD và bank_transfer
  // VNPay chỉ được cập nhật trong trường hợp đặc biệt (hoàn tiền)
  if (payment.method === "vnpay") {
    return ["completed"].includes(payment.status); // Chỉ cho phép hoàn tiền
  }
  return (
    ["cod", "bank_transfer"].includes(payment.method) &&
    !["completed", "refunded"].includes(payment.status)
  );
};

const getAvailableStatuses = (payment) => {
  if (!payment) return [];

  const allStatuses = [
    { value: "pending", label: "Chờ xử lý" },
    { value: "processing", label: "Đang xử lý" },
    { value: "completed", label: "Thành công" },
    { value: "failed", label: "Thất bại" },
    { value: "cancelled", label: "Đã hủy" },
    { value: "refunded", label: "Đã hoàn tiền" },
    { value: "partially_refunded", label: "Hoàn tiền 1 phần" },
  ];

  // Logic cho các phương thức thanh toán khác nhau
  if (payment.method === "vnpay") {
    // VNPay chỉ cho phép hoàn tiền từ trạng thái completed
    if (payment.status === "completed") {
      return [
        { value: "completed", label: "Thành công" },
        { value: "refunded", label: "Đã hoàn tiền" },
        { value: "partially_refunded", label: "Hoàn tiền 1 phần" },
      ];
    }
    return [{ value: payment.status, label: getStatusLabel(payment.status) }];
  }

  if (payment.method === "cod") {
    // COD có thể chuyển từ pending -> completed hoặc failed
    if (payment.status === "pending") {
      return [
        { value: "pending", label: "Chờ xử lý" },
        { value: "completed", label: "Thành công" },
        { value: "failed", label: "Thất bại" },
        { value: "cancelled", label: "Đã hủy" },
      ];
    }
    if (payment.status === "completed") {
      return [
        { value: "completed", label: "Thành công" },
        { value: "refunded", label: "Đã hoàn tiền" },
      ];
    }
  }

  if (payment.method === "bank_transfer") {
    // Chuyển khoản có thể cập nhật từ pending
    if (payment.status === "pending") {
      return [
        { value: "pending", label: "Chờ xử lý" },
        { value: "processing", label: "Đang xử lý" },
        { value: "completed", label: "Thành công" },
        { value: "failed", label: "Thất bại" },
      ];
    }
    if (payment.status === "completed") {
      return [
        { value: "completed", label: "Thành công" },
        { value: "refunded", label: "Đã hoàn tiền" },
      ];
    }
  }

  // Mặc định trả về trạng thái hiện tại
  return [{ value: payment.status, label: getStatusLabel(payment.status) }];
};

const editPaymentStatus = (payment) => {
  selectedPayment.value = payment;
  statusForm.value.status = payment.status;
  statusForm.value.note = "";
  showStatusModal.value = true;
};

const updateStatus = async () => {
  if (!selectedPayment.value) return;

  updating.value = true;
  try {
    await updatePaymentStatus(selectedPayment.value._id, statusForm.value);
    showStatusModal.value = false;
    await fetchPayments(filters.value);
    await fetchPaymentStats(filters.value.startDate, filters.value.endDate);
  } catch (err) {
    console.error("Error updating payment status:", err);
  } finally {
    updating.value = false;
  }
};

const closeStatusModal = () => {
  showStatusModal.value = false;
  statusForm.value = { status: "", note: "" };
  selectedPayment.value = null;
};

const viewPayment = (payment) => {
  selectedPayment.value = payment;
  showDetailModal.value = true;
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedPayment.value = null;
};

const canRefund = (payment) => {
  return (
    payment.status === "completed" &&
    ["vnpay", "cod", "bank_transfer"].includes(payment.method) &&
    payment.refund_amount < payment.amount
  );
};

const initRefund = (payment) => {
  selectedPayment.value = payment;
  const remainingAmount = payment.amount - (payment.refund_amount || 0);
  refundForm.value = {
    amount: remainingAmount,
    reason: "",
    type: remainingAmount === payment.amount ? "full" : "partial",
  };
  showRefundModal.value = true;
};

const processRefundAction = async () => {
  if (!selectedPayment.value) return;

  processing.value = true;
  try {
    await processRefund(selectedPayment.value._id, refundForm.value);
    showRefundModal.value = false;
    await fetchPayments(filters.value);
    await fetchPaymentStats(filters.value.startDate, filters.value.endDate);
  } catch (err) {
    console.error("Error processing refund:", err);
  } finally {
    processing.value = false;
  }
};

const closeRefundModal = () => {
  showRefundModal.value = false;
  refundForm.value = { amount: 0, reason: "", type: "full" };
  selectedPayment.value = null;
};

const getPendingCount = () => {
  return stats.value.byStatus?.find((s) => s._id === "pending")?.count || 0;
};

// VNPay utility functions
const getBankName = (bankCode) => {
  const banks = {
    NCB: "Ngân hàng NCB",
    AGRIBANK: "Ngân hàng Agribank",
    SCB: "Ngân hàng SCB",
    SACOMBANK: "Ngân hàng Sacombank",
    EXIMBANK: "Ngân hàng EximBank",
    MSBANK: "Ngân hàng MSBANK",
    NAMABANK: "Ngân hàng NamABank",
    VNMART: "Ví điện tử VnMart",
    VIETINBANK: "Ngân hàng Vietinbank",
    VIETCOMBANK: "Ngân hàng VCB",
    HDBANK: "Ngân hàng HDBank",
    DONGABANK: "Ngân hàng Dong A",
    TPBANK: "Ngân hàng TPBank",
    OJB: "Ngân hàng OceanBank",
    BIDV: "Ngân hàng BIDV",
    TECHCOMBANK: "Ngân hàng Techcombank",
    VPBANK: "Ngân hàng VPBank",
    MBBANK: "Ngân hàng MBBank",
    ACB: "Ngân hàng ACB",
    OCB: "Ngân hàng OCB",
    IVB: "Ngân hàng IVB",
    VISA: "Thẻ quốc tế",
  };
  return banks[bankCode] || bankCode;
};

const getCardType = (cardType) => {
  const types = {
    ATM: "Thẻ ATM nội địa",
    QRCODE: "Thanh toán QR Code",
  };
  return types[cardType] || cardType;
};

const formatVNPayDate = (vnpayDate) => {
  if (!vnpayDate) return "";
  // VNPay date format: yyyyMMddHHmmss
  const year = vnpayDate.substring(0, 4);
  const month = vnpayDate.substring(4, 6);
  const day = vnpayDate.substring(6, 8);
  const hour = vnpayDate.substring(8, 10);
  const minute = vnpayDate.substring(10, 12);
  const second = vnpayDate.substring(12, 14);

  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
};

const getVNPayResponseMessage = (responseCode) => {
  const messages = {
    "00": "Giao dịch thành công",
    "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
    "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
    10: "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
    11: "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
    12: "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
    13: "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).",
    24: "Giao dịch không thành công do: Khách hàng hủy giao dịch",
    51: "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
    65: "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
    75: "Ngân hàng thanh toán đang bảo trì.",
    79: "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.",
    99: "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)",
  };
  return messages[responseCode] || "Không xác định";
};

const getTransactionStatus = (status) => {
  const statuses = {
    "00": "Thành công",
    "01": "Chưa hoàn tất",
    "02": "Lỗi",
    "04": "Đảo ngược",
    "05": "Đang xử lý",
    "06": "Đã trả về",
    "07": "Nghi ngờ gian lận",
    "09": "Hủy bỏ",
  };
  return statuses[status] || status;
};

// Initial load
onMounted(() => {
  fetchPayments(filters.value);
  fetchPaymentStats();
});
</script>

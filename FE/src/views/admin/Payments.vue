<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">
            Quản lý thanh toán
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            Theo dõi và quản lý các giao dịch thanh toán
          </p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg
                class="w-6 h-6 text-green-600"
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
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Tổng doanh thu</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ formatCurrency(stats.total?.totalAmount || 0) }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg
                class="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Tổng giao dịch</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ stats.total?.totalPayments || 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <svg
                class="w-6 h-6 text-purple-600"
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
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Giá trị TB</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ formatCurrency(stats.total?.avgAmount || 0) }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg
                class="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Chờ xử lý</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ getPendingCount() }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white p-4 rounded-lg shadow-sm border">
        <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <select
              v-model="filters.status"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div>
            <select
              v-model="filters.method"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả phương thức</option>
              <option value="cod">COD</option>
              <option value="vnpay">VNPay</option>
              <option value="momo">MoMo</option>
              <option value="zalopay">ZaloPay</option>
              <option value="bank_transfer">Chuyển khoản</option>
            </select>
          </div>

          <div>
            <input
              v-model="filters.startDate"
              type="date"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <input
              v-model="filters.endDate"
              type="date"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              v-model="filters.sortBy"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Ngày tạo</option>
              <option value="amount">Số tiền</option>
              <option value="status">Trạng thái</option>
            </select>
          </div>

          <div class="flex gap-2">
            <button
              @click="fetchPayments"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex-1"
            >
              Lọc
            </button>
            <button
              @click="resetFilters"
              class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Payments Table -->
      <div class="bg-white rounded-lg shadow-sm border">
        <div v-if="loading" class="p-8 text-center">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
          ></div>
          <p class="mt-2 text-gray-500">Đang tải...</p>
        </div>

        <div v-else-if="error" class="p-8 text-center text-red-600">
          {{ error }}
        </div>

        <div v-else>
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Giao dịch
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Khách hàng
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Số tiền
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Phương thức
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Trạng thái
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ngày tạo
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="payment in payments"
                :key="payment._id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ payment.paymentId }}
                    </div>
                    <div class="text-sm text-gray-500">
                      Đơn hàng: {{ payment.orderId?.orderNumber }}
                    </div>
                    <div
                      v-if="payment.gateway_transaction_id"
                      class="text-xs text-blue-600"
                    >
                      Gateway: {{ payment.gateway_transaction_id }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="payment.orderId?.userId">
                    <div class="text-sm font-medium text-gray-900">
                      {{ payment.orderId.userId.name }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ payment.orderId.userId.email }}
                    </div>
                  </div>
                  <div v-else class="text-sm text-gray-400">N/A</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ formatCurrency(payment.amount) }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ payment.currency }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="getMethodColor(payment.method)"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ getMethodLabel(payment.method) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="getStatusColor(payment.status)"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ getStatusLabel(payment.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(payment.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center space-x-3">
                    <button
                      @click="viewPayment(payment)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      Chi tiết
                    </button>
                    <button
                      v-if="canUpdateStatus(payment)"
                      @click="editPaymentStatus(payment)"
                      class="text-green-600 hover:text-green-900"
                    >
                      Cập nhật
                    </button>
                    <button
                      v-if="canRefund(payment)"
                      @click="initRefund(payment)"
                      class="text-purple-600 hover:text-purple-900"
                    >
                      Hoàn tiền
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div
            v-if="pagination.totalPages > 1"
            class="px-6 py-4 border-t border-gray-200"
          >
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-500">
                Hiển thị {{ (pagination.page - 1) * pagination.limit + 1 }} đến
                {{
                  Math.min(pagination.page * pagination.limit, pagination.total)
                }}
                trong tổng số {{ pagination.total }} giao dịch
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="changePage(pagination.page - 1)"
                  :disabled="!pagination.hasPrev"
                  class="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <span class="px-3 py-1 bg-blue-600 text-white rounded">{{
                  pagination.page
                }}</span>
                <button
                  @click="changePage(pagination.page + 1)"
                  :disabled="!pagination.hasNext"
                  class="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Status Update Modal -->
    <div
      v-if="showStatusModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4">Cập nhật trạng thái thanh toán</h3>

        <form @submit.prevent="updateStatus">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Trạng thái *</label
              >
              <select
                v-model="statusForm.status"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Ghi chú</label
              >
              <textarea
                v-model="statusForm.note"
                rows="3"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ghi chú về việc cập nhật trạng thái..."
              ></textarea>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="closeStatusModal"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              :disabled="updating"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{ updating ? "Đang xử lý..." : "Cập nhật" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Payment Detail Modal -->
    <div
      v-if="showDetailModal && selectedPayment"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto"
      >
        <h3 class="text-lg font-medium mb-4">Chi tiết thanh toán</h3>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700"
                >Mã giao dịch</label
              >
              <p class="text-sm text-gray-900">
                {{ selectedPayment.paymentId }}
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700">Số tiền</label>
              <p class="text-sm text-gray-900">
                {{ formatCurrency(selectedPayment.amount) }}
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700"
                >Phương thức</label
              >
              <p class="text-sm text-gray-900">
                {{ getMethodLabel(selectedPayment.method) }}
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700"
                >Trạng thái</label
              >
              <p class="text-sm">
                <span
                  :class="getStatusColor(selectedPayment.status)"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ getStatusLabel(selectedPayment.status) }}
                </span>
              </p>
            </div>
          </div>

          <div v-if="selectedPayment.orderId" class="border-t pt-4">
            <h4 class="font-medium mb-2">Thông tin đơn hàng</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-700"
                  >Mã đơn hàng</label
                >
                <p class="text-sm text-gray-900">
                  {{ selectedPayment.orderId.orderNumber }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700"
                  >Tổng tiền đơn hàng</label
                >
                <p class="text-sm text-gray-900">
                  {{ formatCurrency(selectedPayment.orderId.totalAmount) }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="selectedPayment.orderId?.userId" class="border-t pt-4">
            <h4 class="font-medium mb-2">Thông tin khách hàng</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-700">Tên</label>
                <p class="text-sm text-gray-900">
                  {{ selectedPayment.orderId.userId.name }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700">Email</label>
                <p class="text-sm text-gray-900">
                  {{ selectedPayment.orderId.userId.email }}
                </p>
              </div>
              <div v-if="selectedPayment.orderId.userId.phone_number">
                <label class="text-sm font-medium text-gray-700"
                  >Số điện thoại</label
                >
                <p class="text-sm text-gray-900">
                  {{ selectedPayment.orderId.userId.phone_number }}
                </p>
              </div>
            </div>
          </div>

          <div class="border-t pt-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-700"
                  >Ngày tạo</label
                >
                <p class="text-sm text-gray-900">
                  {{ formatDate(selectedPayment.createdAt) }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700"
                  >Cập nhật lần cuối</label
                >
                <p class="text-sm text-gray-900">
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
            class="border-t pt-4"
          >
            <h4 class="font-medium mb-2">Thông tin giao dịch VNPay</h4>
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

        <div class="flex justify-end mt-6">
          <button
            @click="closeDetailModal"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
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

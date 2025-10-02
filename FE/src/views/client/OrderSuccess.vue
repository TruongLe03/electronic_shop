<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
      <div class="bg-white rounded-lg shadow-lg p-8 text-center">
        <!-- Success Icon -->
        <div class="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
          <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <!-- Success Message -->
        <h1 class="text-2xl font-bold text-gray-800 mb-4">
          Đặt hàng thành công!
        </h1>
        
        <p class="text-gray-600 mb-6">
          Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng và gửi thông tin chi tiết qua email.
        </p>

        <!-- Order Info -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="text-sm text-gray-600 mb-1">Mã đơn hàng</div>
          <div class="text-lg font-semibold text-gray-800">#{{ orderId }}</div>
        </div>

        <!-- Next Steps -->
        <div class="space-y-3">
          <div class="text-sm text-gray-600 text-left">
            <p class="font-semibold mb-2">Bước tiếp theo:</p>
            <ul class="space-y-1">
              <li>• Kiểm tra email xác nhận đơn hàng</li>
              <li>• Theo dõi tình trạng đơn hàng</li>
              <li>• Chuẩn bị thanh toán khi nhận hàng (nếu chọn COD)</li>
            </ul>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3 mt-8">
          <router-link 
            :to="`/order-detail/${orderId}`"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors block"
          >
            Xem chi tiết đơn hàng
          </router-link>
          
          <router-link 
            to="/"
            class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg transition-colors block"
          >
            Về trang chủ
          </router-link>
        </div>

        <!-- Contact Support -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <p class="text-sm text-gray-500">
            Cần hỗ trợ? 
            <a href="tel:1900-1234" class="text-blue-600 hover:underline">Gọi 1900-1234</a>
            hoặc 
            <a href="mailto:support@electroshop.com" class="text-blue-600 hover:underline">gửi email</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const orderId = ref('')

onMounted(() => {
  // Get orderId from query parameter
  orderId.value = route.query.orderId || 'ES' + Date.now().toString().slice(-8)
})
</script>

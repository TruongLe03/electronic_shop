<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Progress Steps -->
      <div class="mb-8">
        <div class="flex items-center justify-center">
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span class="ml-2 text-sm font-medium text-blue-600">Thông tin</span>
            </div>
            <div class="w-8 h-0.5 bg-gray-300"></div>
            <div class="flex items-center">
              <div class="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span class="ml-2 text-sm font-medium text-gray-500">Thanh toán</span>
            </div>
            <div class="w-8 h-0.5 bg-gray-300"></div>
            <div class="flex items-center">
              <div class="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span class="ml-2 text-sm font-medium text-gray-500">Xác nhận</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Checkout Form -->
        <div class="lg:w-2/3">
          <form @submit.prevent="processCheckout" class="space-y-6">
            <!-- Customer Information -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-xl font-bold text-gray-800 mb-4">Thông tin khách hàng</h3>
              
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
              <h3 class="text-xl font-bold text-gray-800 mb-4">Thông tin giao hàng</h3>
              
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Tỉnh/Thành phố *
                    </label>
                    <select 
                      v-model="form.province"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      <option value="hanoi">Hà Nội</option>
                      <option value="hcm">TP. Hồ Chí Minh</option>
                      <option value="danang">Đà Nẵng</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Quận/Huyện *
                    </label>
                    <select 
                      v-model="form.district"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn quận/huyện</option>
                      <option value="district1">Quận 1</option>
                      <option value="district2">Quận 2</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Phường/Xã *
                    </label>
                    <select 
                      v-model="form.ward"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn phường/xã</option>
                      <option value="ward1">Phường 1</option>
                      <option value="ward2">Phường 2</option>
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
                
                <div>
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
            </div>

            <!-- Payment Methods -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-xl font-bold text-gray-800 mb-4">Phương thức thanh toán</h3>
              
              <div class="space-y-3">
                <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    v-model="form.paymentMethod"
                    type="radio" 
                    value="cod" 
                    class="mr-3 text-blue-600"
                  />
                  <div class="flex items-center">
                    <svg class="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <div>
                      <div class="font-semibold">Thanh toán khi nhận hàng (COD)</div>
                      <div class="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</div>
                    </div>
                  </div>
                </label>
                
                <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    v-model="form.paymentMethod"
                    type="radio" 
                    value="bank" 
                    class="mr-3 text-blue-600"
                  />
                  <div class="flex items-center">
                    <svg class="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <div>
                      <div class="font-semibold">Chuyển khoản ngân hàng</div>
                      <div class="text-sm text-gray-600">Chuyển khoản qua ATM/Internet Banking</div>
                    </div>
                  </div>
                </label>
                
                <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    v-model="form.paymentMethod"
                    type="radio" 
                    value="momo" 
                    class="mr-3 text-blue-600"
                  />
                  <div class="flex items-center">
                    <div class="w-6 h-6 mr-3 bg-pink-500 rounded-full flex items-center justify-center">
                      <span class="text-white text-xs font-bold">M</span>
                    </div>
                    <div>
                      <div class="font-semibold">Ví MoMo</div>
                      <div class="text-sm text-gray-600">Thanh toán qua ví điện tử MoMo</div>
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
            <h3 class="text-xl font-bold text-gray-800 mb-4">Đơn hàng của bạn</h3>
            
            <!-- Order Items -->
            <div class="space-y-3 mb-6">
              <div 
                v-for="item in cartStore.items" 
                :key="item.id"
                class="flex items-center gap-3"
              >
                <img 
                  :src="item.image" 
                  :alt="item.name"
                  class="w-12 h-12 object-contain bg-gray-50 rounded-md"
                />
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-gray-800 text-sm truncate">{{ item.name }}</div>
                  <div class="text-xs text-gray-600">Số lượng: {{ item.quantity }}</div>
                </div>
                <div class="text-sm font-semibold text-gray-800">
                  {{ formatPrice(item.price * item.quantity) }}
                </div>
              </div>
            </div>
            
            <hr class="border-gray-200 mb-4">
            
            <!-- Order Total -->
            <div class="space-y-2 mb-6">
              <div class="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{{ formatPrice(subtotal) }}</span>
              </div>
              <div class="flex justify-between text-sm text-gray-600">
                <span>Phí vận chuyển</span>
                <span>{{ formatPrice(shippingFee) }}</span>
              </div>
              <div class="flex justify-between text-sm text-gray-600">
                <span>Thuế VAT (10%)</span>
                <span>{{ formatPrice(tax) }}</span>
              </div>
              <hr class="border-gray-200">
              <div class="flex justify-between text-lg font-bold text-gray-800">
                <span>Tổng cộng</span>
                <span class="text-blue-600">{{ formatPrice(total) }}</span>
              </div>
            </div>

            <!-- Place Order Button -->
            <button 
              @click="processCheckout"
              :disabled="!isFormValid"
              class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              Đặt hàng
            </button>
            
            <p class="text-xs text-gray-500 mt-3 text-center">
              Bằng việc đặt hàng, bạn đồng ý với 
              <a href="#" class="text-blue-600 hover:underline">Điều khoản sử dụng</a> 
              của chúng tôi
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@stores/cart'

const router = useRouter()
const cartStore = useCartStore()

// Form data
const form = ref({
  fullName: '',
  phone: '',
  email: '',
  province: '',
  district: '',
  ward: '',
  address: '',
  notes: '',
  paymentMethod: 'cod'
})

const shippingFee = 50000
const taxRate = 0.1

// Computed values
const subtotal = computed(() => {
  return cartStore.totalPrice
})

const tax = computed(() => {
  return subtotal.value * taxRate
})

const total = computed(() => {
  return subtotal.value + shippingFee + tax.value
})

const isFormValid = computed(() => {
  return form.value.fullName && 
         form.value.phone && 
         form.value.email && 
         form.value.province && 
         form.value.district && 
         form.value.ward && 
         form.value.address && 
         form.value.paymentMethod
})

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const processCheckout = async () => {
  if (!isFormValid.value) {
    alert('Vui lòng điền đầy đủ thông tin')
    return
  }

  try {
    // Simulate API call
    console.log('Processing checkout...', form.value)
    
    // Clear cart and redirect to success page
    cartStore.clearCart()
    router.push('/order-success')
  } catch (error) {
    console.error('Checkout error:', error)
    alert('Đã có lỗi xảy ra. Vui lòng thử lại.')
  }
}
</script>

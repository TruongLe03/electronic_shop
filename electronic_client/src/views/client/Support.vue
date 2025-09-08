<script setup>
import { ref } from "vue";
import Header from "@components/client/Header.vue";
import Footer from "@components/client/Footer.vue";

const selectedTab = ref('faq');
const showContactForm = ref(false);

const contactForm = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
});

const faqs = ref([
  {
    id: 1,
    question: "Làm thế nào để đặt hàng?",
    answer: "Bạn có thể đặt hàng bằng cách thêm sản phẩm vào giỏ hàng và tiến hành thanh toán. Chúng tôi hỗ trợ nhiều phương thức thanh toán an toàn.",
    isOpen: false
  },
  {
    id: 2,
    question: "Thời gian giao hàng là bao lâu?",
    answer: "Thời gian giao hàng từ 1-3 ngày làm việc tại nội thành và 3-7 ngày tại các tỉnh thành khác. Chúng tôi sẽ thông báo cụ thể khi xác nhận đơn hàng.",
    isOpen: false
  },
  {
    id: 3,
    question: "Có được đổi trả sản phẩm không?",
    answer: "Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày với điều kiện sản phẩm còn nguyên vẹn, chưa qua sử dụng và có đầy đủ phụ kiện.",
    isOpen: false
  },
  {
    id: 4,
    question: "Làm thế nào để kiểm tra bảo hành?",
    answer: "Bạn có thể kiểm tra thông tin bảo hành bằng cách nhập mã sản phẩm hoặc số điện thoại đã đăng ký tại mục 'Kiểm tra bảo hành'.",
    isOpen: false
  },
  {
    id: 5,
    question: "Các phương thức thanh toán được hỗ trợ?",
    answer: "Chúng tôi hỗ trợ thanh toán qua: Thẻ tín dụng/ghi nợ, Chuyển khoản ngân hàng, Ví điện tử (MoMo, ZaloPay), Thanh toán khi nhận hàng (COD).",
    isOpen: false
  }
]);

const toggleFaq = (id) => {
  const faq = faqs.value.find(f => f.id === id);
  if (faq) {
    faq.isOpen = !faq.isOpen;
  }
};

const submitContactForm = () => {
  // Xử lý gửi form liên hệ
  console.log('Contact form submitted:', contactForm.value);
  alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong 24h.');
  contactForm.value = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };
  showContactForm.value = false;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />
    
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">💬 Hỗ trợ khách hàng</h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Tìm câu trả lời nhanh chóng hoặc liên hệ trực tiếp với chúng tôi.
        </p>
      </div>

      <!-- Quick Contact -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12">
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-white text-xl">📞</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Hotline</h3>
          <p class="text-blue-600 font-medium mb-2">1900 1234</p>
          <p class="text-sm text-gray-600">Hỗ trợ 24/7</p>
        </div>

        <div class="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-white text-xl">💬</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
          <button class="text-green-600 font-medium mb-2 hover:underline">Bắt đầu chat</button>
          <p class="text-sm text-gray-600">Phản hồi ngay lập tức</p>
        </div>

        <div class="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
          <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-white text-xl">✉️</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Email</h3>
          <p class="text-purple-600 font-medium mb-2">support@electroshop.com</p>
          <p class="text-sm text-gray-600">Phản hồi trong 2h</p>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div class="border-b border-gray-200">
          <nav class="flex">
            <button
              @click="selectedTab = 'faq'"
              :class="[
                'flex-1 py-4 px-6 text-center font-medium transition-colors',
                selectedTab === 'faq' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-blue-600'
              ]"
            >
              ❓ Câu hỏi thường gặp
            </button>
            <button
              @click="selectedTab = 'warranty'"
              :class="[
                'flex-1 py-4 px-6 text-center font-medium transition-colors',
                selectedTab === 'warranty' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-blue-600'
              ]"
            >
              🛡️ Chính sách bảo hành
            </button>
            <button
              @click="selectedTab = 'return'"
              :class="[
                'flex-1 py-4 px-6 text-center font-medium transition-colors',
                selectedTab === 'return' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-blue-600'
              ]"
            >
              🔄 Đổi trả
            </button>
          </nav>
        </div>

        <!-- FAQ Content -->
        <div v-if="selectedTab === 'faq'" class="p-6">
          <div class="space-y-4">
            <div v-for="faq in faqs" :key="faq.id" class="border border-gray-200 rounded-lg">
              <button
                @click="toggleFaq(faq.id)"
                class="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <span class="font-medium text-gray-900">{{ faq.question }}</span>
                <span class="text-gray-500 transition-transform" :class="{ 'rotate-180': faq.isOpen }">
                  ▼
                </span>
              </button>
              <div v-if="faq.isOpen" class="p-4 pt-0 text-gray-600 border-t border-gray-100">
                {{ faq.answer }}
              </div>
            </div>
          </div>
        </div>

        <!-- Warranty Content -->
        <div v-if="selectedTab === 'warranty'" class="p-6">
          <h3 class="text-xl font-semibold mb-4">🛡️ Chính sách bảo hành</h3>
          <div class="space-y-4 text-gray-600">
            <div class="bg-blue-50 p-4 rounded-lg">
              <h4 class="font-semibold text-blue-900 mb-2">Thời gian bảo hành:</h4>
              <ul class="list-disc list-inside space-y-1">
                <li>Điện thoại: 12 tháng</li>
                <li>Laptop: 12-24 tháng</li>
                <li>Phụ kiện: 6-12 tháng</li>
                <li>Tai nghe: 6 tháng</li>
              </ul>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
              <h4 class="font-semibold text-green-900 mb-2">Điều kiện bảo hành:</h4>
              <ul class="list-disc list-inside space-y-1">
                <li>Sản phẩm còn trong thời hạn bảo hành</li>
                <li>Có hóa đơn mua hàng hoặc phiếu bảo hành</li>
                <li>Lỗi do nhà sản xuất</li>
                <li>Không bị rơi vỡ, ngấm nước</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Return Policy Content -->
        <div v-if="selectedTab === 'return'" class="p-6">
          <h3 class="text-xl font-semibold mb-4">🔄 Chính sách đổi trả</h3>
          <div class="space-y-4 text-gray-600">
            <div class="bg-yellow-50 p-4 rounded-lg">
              <h4 class="font-semibold text-yellow-900 mb-2">Thời gian đổi trả:</h4>
              <p>Trong vòng 7 ngày kể từ ngày nhận hàng</p>
            </div>
            <div class="bg-red-50 p-4 rounded-lg">
              <h4 class="font-semibold text-red-900 mb-2">Điều kiện đổi trả:</h4>
              <ul class="list-disc list-inside space-y-1">
                <li>Sản phẩm còn nguyên vẹn, chưa qua sử dụng</li>
                <li>Còn đầy đủ hộp, phụ kiện, tài liệu</li>
                <li>Có hóa đơn mua hàng</li>
                <li>Không áp dụng với sản phẩm khuyến mãi đặc biệt</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Form Button -->
      <div class="text-center mb-8">
        <button
          @click="showContactForm = !showContactForm"
          class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          {{ showContactForm ? '🔼 Ẩn form liên hệ' : '📝 Gửi yêu cầu hỗ trợ' }}
        </button>
      </div>

      <!-- Contact Form -->
      <div v-if="showContactForm" class="bg-white rounded-xl shadow-md p-6">
        <h3 class="text-xl font-semibold mb-6">📝 Gửi yêu cầu hỗ trợ</h3>
        <form @submit.prevent="submitContactForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Họ tên *</label>
              <input
                v-model="contactForm.name"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập họ tên của bạn"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                v-model="contactForm.email"
                type="email"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập email của bạn"
              >
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input
                v-model="contactForm.phone"
                type="tel"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập số điện thoại"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Chủ đề *</label>
              <select
                v-model="contactForm.subject"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn chủ đề</option>
                <option value="order">Vấn đề đặt hàng</option>
                <option value="payment">Thanh toán</option>
                <option value="shipping">Giao hàng</option>
                <option value="warranty">Bảo hành</option>
                <option value="return">Đổi trả</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nội dung *</label>
            <textarea
              v-model="contactForm.message"
              required
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mô tả chi tiết vấn đề của bạn..."
            ></textarea>
          </div>

          <div class="flex gap-4">
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              🚀 Gửi yêu cầu
            </button>
            <button
              type="button"
              @click="showContactForm = false"
              class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>

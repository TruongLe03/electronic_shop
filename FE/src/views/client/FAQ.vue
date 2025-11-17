<script setup>
import { ref } from 'vue';

const faqs = [
  {
    category: 'Đặt hàng & Thanh toán',
    questions: [
      {
        q: 'Làm thế nào để đặt hàng?',
        a: 'Bạn chỉ cần chọn sản phẩm, thêm vào giỏ hàng và tiến hành thanh toán. Chúng tôi hỗ trợ nhiều phương thức thanh toán: COD, chuyển khoản, VNPay.',
      },
      {
        q: 'Tôi có thể hủy đơn hàng không?',
        a: 'Có, bạn có thể hủy đơn hàng trong vòng 24h sau khi đặt nếu đơn hàng chưa được xử lý. Vui lòng liên hệ hotline: 0848 123 456.',
      },
      {
        q: 'Các phương thức thanh toán nào được chấp nhận?',
        a: 'Chúng tôi chấp nhận: Thanh toán khi nhận hàng (COD), Chuyển khoản ngân hàng, Ví điện tử (VNPay, Momo), Thẻ tín dụng/ghi nợ.',
      },
    ],
  },
  {
    category: 'Vận chuyển',
    questions: [
      {
        q: 'Thời gian giao hàng là bao lâu?',
        a: 'Nội thành Hà Nội: 1-2 ngày. Các tỉnh thành khác: 3-5 ngày làm việc. Khu vực xa: 5-7 ngày làm việc.',
      },
      {
        q: 'Phí vận chuyển là bao nhiêu?',
        a: 'Miễn phí vận chuyển cho đơn hàng từ 500,000đ. Dưới 500,000đ: Phí vận chuyển tùy theo khu vực (20,000đ - 50,000đ).',
      },
      {
        q: 'Làm thế nào để theo dõi đơn hàng?',
        a: 'Sau khi đặt hàng, bạn sẽ nhận được mã vận đơn qua email/SMS. Bạn có thể tra cứu tại mục "Đơn hàng của tôi" hoặc website đơn vị vận chuyển.',
      },
    ],
  },
  {
    category: 'Sản phẩm',
    questions: [
      {
        q: 'Sản phẩm có chính hãng không?',
        a: 'Tất cả sản phẩm tại LNT Electronics đều là hàng chính hãng, có nguồn gốc xuất xứ rõ ràng và được bảo hành theo quy định của nhà sản xuất.',
      },
      {
        q: 'Tôi có thể kiểm tra hàng trước khi thanh toán không?',
        a: 'Với hình thức COD, bạn hoàn toàn có thể kiểm tra hàng trước khi thanh toán. Nếu sản phẩm không đúng/lỗi, bạn có quyền từ chối nhận hàng.',
      },
      {
        q: 'Làm thế nào để biết sản phẩm còn hàng?',
        a: 'Trạng thái "Còn hàng" được hiển thị ngay trên trang sản phẩm. Nếu hết hàng, bạn có thể đăng ký nhận thông báo khi có hàng trở lại.',
      },
    ],
  },
  {
    category: 'Bảo hành & Đổi trả',
    questions: [
      {
        q: 'Chính sách bảo hành như thế nào?',
        a: 'Bảo hành theo quy định nhà sản xuất (thường 6-12 tháng). Sản phẩm lỗi do nhà sản xuất được đổi mới trong 7 ngày đầu.',
      },
      {
        q: 'Tôi có thể đổi/trả hàng không?',
        a: 'Có, trong vòng 30 ngày nếu: Sản phẩm lỗi, không đúng mô tả, còn nguyên vẹn bao bì. Chi phí vận chuyển đổi trả do shop chịu.',
      },
      {
        q: 'Quy trình bảo hành như thế nào?',
        a: 'Liên hệ hotline → Gửi sản phẩm về shop → Kiểm tra và xử lý (3-7 ngày) → Gửi lại sản phẩm đã sửa/thay thế.',
      },
    ],
  },
  {
    category: 'Tài khoản',
    questions: [
      {
        q: 'Làm thế nào để đăng ký tài khoản?',
        a: 'Click vào "Đăng ký" ở góc trên cùng, điền thông tin email/số điện thoại và mật khẩu. Bạn sẽ nhận mã OTP để xác thực.',
      },
      {
        q: 'Quên mật khẩu phải làm sao?',
        a: 'Click "Quên mật khẩu" tại trang đăng nhập, nhập email đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu.',
      },
      {
        q: 'Thông tin cá nhân có được bảo mật không?',
        a: 'Chúng tôi cam kết bảo mật 100% thông tin khách hàng theo chính sách bảo mật. Không chia sẻ cho bên thứ ba.',
      },
    ],
  },
];

const openIndex = ref(null);

const toggleFAQ = (categoryIndex, questionIndex) => {
  const index = `${categoryIndex}-${questionIndex}`;
  openIndex.value = openIndex.value === index ? null : index;
};

const isOpen = (categoryIndex, questionIndex) => {
  return openIndex.value === `${categoryIndex}-${questionIndex}`;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">Câu hỏi thường gặp</h1>
          <p class="text-xl text-blue-100">
            Tìm câu trả lời nhanh chóng cho các thắc mắc của bạn
          </p>
        </div>
      </div>
    </section>

    <div class="container mx-auto px-4 py-16">
      <!-- Search Box -->
      <div class="max-w-2xl mx-auto mb-12">
        <div class="relative">
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi..."
            class="w-full px-6 py-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      <!-- FAQs by Category -->
      <div class="max-w-4xl mx-auto space-y-8">
        <div
          v-for="(category, categoryIndex) in faqs"
          :key="categoryIndex"
          class="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div class="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
            <h2 class="text-2xl font-bold text-gray-900">
              <i class="fas fa-folder-open text-blue-600 mr-3"></i>
              {{ category.category }}
            </h2>
          </div>

          <div class="divide-y divide-gray-100">
            <div
              v-for="(faq, questionIndex) in category.questions"
              :key="questionIndex"
              class="transition-all"
            >
              <button
                @click="toggleFAQ(categoryIndex, questionIndex)"
                class="w-full px-6 py-5 flex items-start justify-between hover:bg-gray-50 transition-colors text-left"
              >
                <div class="flex-1 pr-4">
                  <h3 class="font-semibold text-gray-900 text-lg">
                    {{ faq.q }}
                  </h3>
                </div>
                <i
                  :class="[
                    'fas fa-chevron-down text-blue-600 transition-transform mt-1',
                    { 'rotate-180': isOpen(categoryIndex, questionIndex) }
                  ]"
                ></i>
              </button>

              <transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="max-h-0 opacity-0"
                enter-to-class="max-h-96 opacity-100"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="max-h-96 opacity-100"
                leave-to-class="max-h-0 opacity-0"
              >
                <div
                  v-if="isOpen(categoryIndex, questionIndex)"
                  class="px-6 pb-5 overflow-hidden"
                >
                  <div class="bg-blue-50 p-4 rounded-lg">
                    <p class="text-gray-700 leading-relaxed whitespace-pre-line">
                      {{ faq.a }}
                    </p>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>

      <!-- Still have questions -->
      <div class="max-w-4xl mx-auto mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white text-center">
        <h2 class="text-2xl font-bold mb-4">Vẫn còn thắc mắc?</h2>
        <p class="text-blue-100 mb-6">
          Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn
        </p>
        <div class="flex flex-wrap gap-4 justify-center">
          <router-link
            to="/contact"
            class="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            <i class="fas fa-envelope mr-2"></i>
            Liên hệ chúng tôi
          </router-link>
          <a
            href="tel:0848123456"
            class="px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
          >
            <i class="fas fa-phone mr-2"></i>
            Gọi: 0848 123 456
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>

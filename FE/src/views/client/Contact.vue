<script setup>
import { ref } from 'vue';

const form = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
});

const submitting = ref(false);
const submitted = ref(false);

const contactInfo = [
  {
    icon: 'fas fa-map-marker-alt',
    title: 'Địa chỉ',
    content: 'Ngõ 89, Từ Liêm, Hà Nội',
    link: 'https://maps.google.com',
  },
  {
    icon: 'fas fa-phone',
    title: 'Điện thoại',
    content: '0848 123 456',
    link: 'tel:0848123456',
  },
  {
    icon: 'fas fa-envelope',
    title: 'Email',
    content: 'info@lntelectronics.com',
    link: 'mailto:info@lntelectronics.com',
  },
  {
    icon: 'fas fa-clock',
    title: 'Giờ làm việc',
    content: 'T2 - T7: 8:00 - 20:00<br>CN: 9:00 - 18:00',
    link: null,
  },
];

const handleSubmit = async () => {
  if (submitting.value) return;
  
  // Validation
  if (!form.value.name || !form.value.email || !form.value.message) {
    alert('Vui lòng điền đầy đủ thông tin');
    return;
  }
  
  submitting.value = true;
  
  // Simulate API call
  setTimeout(() => {
    console.log('Contact form submitted:', form.value);
    submitted.value = true;
    submitting.value = false;
    
    // Reset form after 3 seconds
    setTimeout(() => {
      form.value = {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      };
      submitted.value = false;
    }, 3000);
  }, 1500);
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">Liên hệ với chúng tôi</h1>
          <p class="text-xl text-blue-100">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
          </p>
        </div>
      </div>
    </section>

    <div class="container mx-auto px-4 py-16">
      <div class="grid lg:grid-cols-3 gap-12">
        <!-- Contact Information -->
        <div class="lg:col-span-1">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">Thông tin liên hệ</h2>
          <div class="space-y-6">
            <div
              v-for="info in contactInfo"
              :key="info.title"
              class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i :class="info.icon" class="text-blue-600 text-xl"></i>
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900 mb-1">{{ info.title }}</h3>
                  <a
                    v-if="info.link"
                    :href="info.link"
                    class="text-gray-600 hover:text-blue-600 transition-colors"
                    v-html="info.content"
                  ></a>
                  <p v-else class="text-gray-600" v-html="info.content"></p>
                </div>
              </div>
            </div>
          </div>

          <!-- Social Links -->
          <div class="mt-8 bg-white p-6 rounded-xl shadow-sm">
            <h3 class="font-semibold text-gray-900 mb-4">Theo dõi chúng tôi</h3>
            <div class="flex gap-3">
              <a
                href="#"
                class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
              >
                <i class="fab fa-facebook-f"></i>
              </a>
              <a
                href="#"
                class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
              >
                <i class="fab fa-instagram"></i>
              </a>
              <a
                href="#"
                class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
              >
                <i class="fab fa-youtube"></i>
              </a>
              <a
                href="#"
                class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
              >
                <i class="fab fa-tiktok"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="lg:col-span-2">
          <div class="bg-white p-8 rounded-xl shadow-sm">
            <h2 class="text-2xl font-bold mb-6 text-gray-900">Gửi tin nhắn</h2>
            
            <!-- Success Message -->
            <div
              v-if="submitted"
              class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
            >
              <i class="fas fa-check-circle mr-2"></i>
              Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-6">
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập họ tên của bạn"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Email <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.email"
                    type="email"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0123 456 789"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Chủ đề
                  </label>
                  <select
                    v-model="form.subject"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn chủ đề</option>
                    <option value="product">Hỏi về sản phẩm</option>
                    <option value="order">Đơn hàng</option>
                    <option value="technical">Hỗ trợ kỹ thuật</option>
                    <option value="warranty">Bảo hành</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="form.message"
                  required
                  rows="6"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Nhập nội dung tin nhắn của bạn..."
                ></textarea>
              </div>

              <button
                type="submit"
                :disabled="submitting"
                class="w-full px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <span v-if="submitting">
                  <i class="fas fa-spinner fa-spin mr-2"></i>
                  Đang gửi...
                </span>
                <span v-else>
                  <i class="fas fa-paper-plane mr-2"></i>
                  Gửi tin nhắn
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Map Section -->
      <div class="mt-16">
        <h2 class="text-2xl font-bold mb-6 text-gray-900 text-center">Vị trí của chúng tôi</h2>
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="aspect-video bg-gray-200 flex items-center justify-center">
            <div class="text-center">
              <i class="fas fa-map-marked-alt text-6xl text-gray-400 mb-4"></i>
              <p class="text-gray-600">Bản đồ Google Maps</p>
              <p class="text-sm text-gray-500">Ngõ 89, Từ Liêm, Hà Nội</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

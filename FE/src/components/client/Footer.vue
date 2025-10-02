<script setup>
import { ref } from "vue";

// Newsletter subscription
const email = ref("");
const isSubscribing = ref(false);

const handleNewsletterSubmit = async () => {
  if (!email.value || isSubscribing.value) return;

  isSubscribing.value = true;

  setTimeout(() => {
    console.log("Newsletter subscription:", email.value);
    email.value = "";
    isSubscribing.value = false;
  }, 1000);
};

// Footer links
const footerSections = [
  {
    title: "Công ty",
    links: [
      { name: "Về chúng tôi", href: "/about" },
      { name: "Tin tức", href: "/news" },
      { name: "Tuyển dụng", href: "/careers" },
      { name: "Liên hệ", href: "/contact" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { name: "Hỗ trợ khách hàng", href: "/support" },
      { name: "Hướng dẫn mua hàng", href: "/guide" },
      { name: "Chính sách bảo hành", href: "/warranty" },
      { name: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Danh mục",
    links: [
      { name: "Arduino & IoT", href: "/categories/arduino" },
      { name: "Cảm biến", href: "/categories/sensors" },
      { name: "Robot", href: "/categories/robotics" },
      { name: "Phụ kiện", href: "/categories/accessories" },
    ],
  },
];

const socialLinks = [
  { name: "Facebook", icon: "fab fa-facebook-f", href: "#" },
  { name: "Instagram", icon: "fab fa-instagram", href: "#" },
  { name: "YouTube", icon: "fab fa-youtube", href: "#" },
  { name: "Twitter", icon: "fab fa-twitter", href: "#" },
];
</script>

<template>
  <footer class="bg-gray-900 text-white">
    <!-- Main Footer Content -->
    <div class="py-12">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <!-- Company Info -->
          <div class="lg:col-span-2">
            <h2 class="text-xl font-bold text-blue-400 mb-4">
              <i class="fas fa-microchip mr-2"></i>
              LNT Electronics
            </h2>
            <p class="text-gray-300 mb-4">
              Chuyên cung cấp các sản phẩm điện tử chất lượng cao, Arduino, IoT
              và thiết bị tự động hóa.
            </p>

            <!-- Contact Info -->
            <div class="space-y-2 text-gray-300">
              <div class="flex items-center">
                <i class="fas fa-map-marker-alt w-4 text-blue-400 mr-3"></i>
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
              <div class="flex items-center">
                <i class="fas fa-phone w-4 text-blue-400 mr-3"></i>
                <span>0123.456.789</span>
              </div>
              <div class="flex items-center">
                <i class="fas fa-envelope w-4 text-blue-400 mr-3"></i>
                <span>info@lntelectronics.com</span>
              </div>
            </div>
          </div>

          <!-- Footer Links -->
          <div
            v-for="section in footerSections"
            :key="section.title"
            class="space-y-4"
          >
            <h4 class="text-lg font-semibold">{{ section.title }}</h4>
            <ul class="space-y-2">
              <li v-for="link in section.links" :key="link.name">
                <router-link
                  :to="link.href"
                  class="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  {{ link.name }}
                </router-link>
              </li>
            </ul>
          </div>
        </div>

        <!-- Features -->
        <div class="border-t border-gray-700 mt-8 pt-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
            <div class="flex items-center space-x-3">
              <i class="fas fa-shipping-fast text-blue-400 text-lg"></i>
              <div>
                <div class="font-medium">Giao hàng nhanh</div>
                <div class="text-gray-400">Miễn phí từ 500k</div>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <i class="fas fa-shield-alt text-green-400 text-lg"></i>
              <div>
                <div class="font-medium">Bảo hành chính hãng</div>
                <div class="text-gray-400">Hỗ trợ 24/7</div>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <i class="fas fa-award text-yellow-400 text-lg"></i>
              <div>
                <div class="font-medium">Chất lượng đảm bảo</div>
                <div class="text-gray-400">Đổi trả 30 ngày</div>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <i class="fas fa-headset text-purple-400 text-lg"></i>
              <div>
                <div class="font-medium">Tư vấn chuyên nghiệp</div>
                <div class="text-gray-400">Đội ngũ kỹ thuật</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Footer -->
    <div class="border-t border-gray-700 py-6">
      <div class="container mx-auto px-4">
        <div
          class="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <!-- Copyright -->
          <div class="text-center md:text-left">
            <p class="text-gray-400">
              © {{ new Date().getFullYear() }} LNT Electronics. All rights
              reserved.
            </p>
          </div>

          <!-- Social Links -->
          <div class="flex items-center space-x-4">
            <span class="text-gray-400 text-sm">Theo dõi:</span>
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.href"
              :title="social.name"
              class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
            >
              <i :class="social.icon" class="text-sm"></i>
            </a>
          </div>

          <!-- Payment Methods -->
          <div class="flex items-center space-x-2">
            <span class="text-gray-400 text-sm mr-2">Thanh toán:</span>
            <div class="flex space-x-1">
              <div
                class="w-8 h-5 bg-white rounded flex items-center justify-center"
              >
                <i class="fab fa-cc-visa text-blue-600 text-xs"></i>
              </div>
              <div
                class="w-8 h-5 bg-white rounded flex items-center justify-center"
              >
                <i class="fab fa-cc-mastercard text-red-600 text-xs"></i>
              </div>
              <div
                class="w-8 h-5 bg-white rounded flex items-center justify-center"
              >
                <i class="fab fa-cc-paypal text-blue-800 text-xs"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Smooth transitions */
* {
  transition: all 0.3s ease;
}

/* Hover effects */
a:hover {
  transform: translateX(2px);
}

.social-link:hover {
  transform: translateY(-2px);
}
</style>

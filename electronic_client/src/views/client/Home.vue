<script setup>
import { ref, onMounted } from "vue";
import Header from "@components/client/Header.vue";
import heroSection from "@components/client/heroSection.vue";
import CategorySidebar from "@components/client/CategorySidebar.vue";
import FeaturedProducts from "@components/client/FeaturedProducts.vue";
import Footer from "@components/client/Footer.vue";

// Page loading state
const pageLoading = ref(true);

// Lifecycle
onMounted(async () => {
  // Simulate page loading
  setTimeout(() => {
    pageLoading.value = false;
  }, 500);
});
</script>

<template>
  <!-- Page Loading Overlay -->
  <div
    v-if="pageLoading"
    class="fixed inset-0 bg-white z-50 flex items-center justify-center"
  >
    <div class="text-center">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600 font-medium">Đang tải trang...</p>
    </div>
  </div>

  <!-- Main Content -->
  <div v-else class="min-h-screen bg-gray-50">
    <!-- Header -->
    <Header />
    
    <!-- Main Content -->
    <main>
      <!-- Hero Section -->
      <heroSection />
      
      <!-- Main Content Area with Sidebar -->
      <div class="container mx-auto px-4 py-8">
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Sidebar - Categories -->
          <aside class="lg:w-1/4">
            <CategorySidebar />
          </aside>
          
          <!-- Main Content -->
          <div class="lg:w-3/4">
            <!-- Featured Products Section -->
            <FeaturedProducts />
            
            <!-- Popular Categories Quick Links -->
            <div class="mt-8 bg-white rounded-lg shadow-md p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">
                <i class="fas fa-fire text-red-500 mr-2"></i>
                Danh mục phổ biến
              </h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <router-link 
                  to="/products?categoryId=68abd2d522590b67b7eef500"
                  class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <i class="fas fa-microchip text-2xl text-blue-600 mb-2 group-hover:text-blue-700"></i>
                  <span class="text-sm font-medium text-gray-700 group-hover:text-blue-700 text-center">Arduino</span>
                </router-link>
                
                <router-link 
                  to="/products?categoryId=68abd2d522590b67b7eef4fc"
                  class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
                >
                  <i class="fas fa-satellite-dish text-2xl text-green-600 mb-2 group-hover:text-green-700"></i>
                  <span class="text-sm font-medium text-gray-700 group-hover:text-green-700 text-center">Cảm biến</span>
                </router-link>
                
                <router-link 
                  to="/products?categoryId=68abd2d522590b67b7eef502"
                  class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group"
                >
                  <i class="fas fa-puzzle-piece text-2xl text-purple-600 mb-2 group-hover:text-purple-700"></i>
                  <span class="text-sm font-medium text-gray-700 group-hover:text-purple-700 text-center">Module</span>
                </router-link>
                
                <router-link 
                  to="/products?categoryId=68abd2d522590b67b7eef4fe"
                  class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group"
                >
                  <i class="fas fa-tools text-2xl text-orange-600 mb-2 group-hover:text-orange-700"></i>
                  <span class="text-sm font-medium text-gray-700 group-hover:text-orange-700 text-center">Dụng cụ</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Statistics Section -->
      <section class="py-16 bg-blue-600">
        <div class="container mx-auto px-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div class="space-y-2">
              <div class="text-4xl font-bold">10K+</div>
              <div class="text-blue-100">Khách hàng tin tưởng</div>
            </div>
            <div class="space-y-2">
              <div class="text-4xl font-bold">5K+</div>
              <div class="text-blue-100">Sản phẩm chất lượng</div>
            </div>
            <div class="space-y-2">
              <div class="text-4xl font-bold">24/7</div>
              <div class="text-blue-100">Hỗ trợ khách hàng</div>
            </div>
            <div class="space-y-2">
              <div class="text-4xl font-bold">99%</div>
              <div class="text-blue-100">Khách hàng hài lòng</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Why Choose Us Section -->
      <section class="py-16 bg-white">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn chúng tôi?
            </h2>
            <p class="text-gray-600 max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến cho bạn trải nghiệm mua sắm tuyệt vời nhất với các sản phẩm electronics chất lượng cao
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Feature 1 -->
            <div class="text-center group">
              <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-all duration-300">
                <i class="fas fa-shipping-fast text-3xl text-blue-600 group-hover:text-white transition-colors duration-300"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">Giao hàng nhanh chóng</h3>
              <p class="text-gray-600">
                Giao hàng miễn phí trong 24h tại TP.HCM và 2-3 ngày toàn quốc với đơn hàng từ 500.000đ
              </p>
            </div>

            <!-- Feature 2 -->
            <div class="text-center group">
              <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-600 transition-all duration-300">
                <i class="fas fa-shield-alt text-3xl text-green-600 group-hover:text-white transition-colors duration-300"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">Bảo hành chính hãng</h3>
              <p class="text-gray-600">
                Tất cả sản phẩm đều có bảo hành chính hãng và hỗ trợ kỹ thuật 24/7 từ đội ngũ chuyên gia
              </p>
            </div>

            <!-- Feature 3 -->
            <div class="text-center group">
              <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow-600 transition-all duration-300">
                <i class="fas fa-award text-3xl text-yellow-600 group-hover:text-white transition-colors duration-300"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">Chất lượng đảm bảo</h3>
              <p class="text-gray-600">
                Sản phẩm được kiểm tra kỹ lưỡng trước khi giao và có chính sách đổi trả trong 30 ngày
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Newsletter Section -->
      <section class="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto text-center text-white">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">
              Đăng ký nhận tin tức mới nhất
            </h2>
            <p class="text-xl mb-8 text-blue-100">
              Nhận thông tin về sản phẩm mới, khuyến mãi và các tips hay về electronics
            </p>
            
            <div class="max-w-md mx-auto">
              <div class="flex rounded-lg overflow-hidden shadow-lg">
                <input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  class="flex-1 px-6 py-4 text-gray-900 focus:outline-none"
                />
                <button class="bg-yellow-500 hover:bg-yellow-600 px-8 py-4 font-semibold text-gray-900 transition-colors duration-300">
                  Đăng ký
                </button>
              </div>
              <p class="text-sm text-blue-100 mt-3">
                * Chúng tôi không spam và bảo vệ thông tin cá nhân của bạn
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<style scoped>
/* Custom animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.6s ease-out;
}

/* Smooth transitions */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Loading spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Gradient text effect */
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Custom shadows */
.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Button hover effects */
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Section spacing */
section {
  scroll-margin-top: 100px;
}
</style>
<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          <i class="fas fa-newspaper text-blue-600 mr-3"></i>
          Tin tức công nghệ chính thống
        </h1>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto">
          Truy cập các nguồn tin tức uy tín và chính thống về công nghệ, linh
          kiện điện tử từ khắp thế giới
        </p>
      </div>

      <!-- International Tech News -->
      <div class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 flex items-center">
          <i class="fas fa-globe text-blue-600 mr-2"></i>
          Tin tức công nghệ quốc tế
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- IEEE Spectrum -->
          <div
            class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div
              class="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 flex items-center justify-center"
            >
              <i class="fas fa-microchip text-4xl text-white"></i>
            </div>
            <div class="p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-2">
                IEEE Spectrum
              </h3>
              <p class="text-gray-600 text-sm mb-4">
                Tin tức kỹ thuật chuyên sâu từ Viện Kỹ sư Điện & Điện tử về vi
                điều khiển, IoT, AI
              </p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                  >Engineering</span
                >
                <span
                  class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
                  >IEEE Official</span
                >
              </div>
              <a
                href="https://spectrum.ieee.org/"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                Truy cập <i class="fas fa-external-link-alt ml-1"></i>
              </a>
            </div>
          </div>

          <!-- Electronics Weekly -->
          <div
            class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div
              class="bg-gradient-to-r from-green-600 to-teal-700 h-32 flex items-center justify-center"
            >
              <i class="fas fa-bolt text-4xl text-white"></i>
            </div>
            <div class="p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-2">
                Electronics Weekly
              </h3>
              <p class="text-gray-600 text-sm mb-4">
                Tin tức hàng tuần về ngành điện tử, sản phẩm mới, công nghệ và
                thị trường
              </p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
                  >Weekly</span
                >
                <span
                  class="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs"
                  >Industry</span
                >
              </div>
              <a
                href="https://www.electronicsweekly.com/"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-green-600 hover:text-green-800 font-medium"
              >
                Truy cập <i class="fas fa-external-link-alt ml-1"></i>
              </a>
            </div>
          </div>

          <!-- EE Times -->
          <div
            class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div
              class="bg-gradient-to-r from-purple-600 to-pink-700 h-32 flex items-center justify-center"
            >
              <i class="fas fa-cogs text-4xl text-white"></i>
            </div>
            <div class="p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-2">EE Times</h3>
              <p class="text-gray-600 text-sm mb-4">
                Tin tức thiết kế điện tử chuyên nghiệp về Semiconductor và
                embedded systems
              </p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  class="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs"
                  >Professional</span
                >
                <span
                  class="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs"
                  >Design</span
                >
              </div>
              <a
                href="https://www.eetimes.com/"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium"
              >
                Truy cập <i class="fas fa-external-link-alt ml-1"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Official Brand News -->
      <div class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 flex items-center">
          <i class="fas fa-building text-red-600 mr-2"></i>
          Tin chính thức từ nhà sản xuất
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Arduino -->
          <div
            class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div
              class="bg-gradient-to-r from-cyan-500 to-blue-600 h-32 flex items-center justify-center"
            >
              <i class="fab fa-arduino text-4xl text-white"></i>
            </div>
            <div class="p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-2">Arduino Blog</h3>
              <p class="text-gray-600 text-sm mb-4">
                Tin chính thức từ Arduino về sản phẩm mới, projects và tutorials
              </p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  class="bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full text-xs"
                  >Arduino Official</span
                >
                <span
                  class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                  >DIY</span
                >
              </div>
              <a
                href="https://blog.arduino.cc/"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-cyan-600 hover:text-cyan-800 font-medium"
              >
                Truy cập <i class="fas fa-external-link-alt ml-1"></i>
              </a>
            </div>
          </div>

          <!-- Raspberry Pi -->
          <div
            class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div
              class="bg-gradient-to-r from-red-500 to-pink-600 h-32 flex items-center justify-center"
            >
              <i class="fab fa-raspberry-pi text-4xl text-white"></i>
            </div>
            <div class="p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-2">
                Raspberry Pi News
              </h3>
              <p class="text-gray-600 text-sm mb-4">
                Tin chính thức từ Raspberry Pi Foundation về updates, releases
                và community projects
              </p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs"
                  >Raspberry Pi Official</span
                >
                <span
                  class="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs"
                  >Community</span
                >
              </div>
              <a
                href="https://www.raspberrypi.org/news/"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-red-600 hover:text-red-800 font-medium"
              >
                Truy cập <i class="fas fa-external-link-alt ml-1"></i>
              </a>
            </div>
          </div>

          <!-- Adafruit -->
          <div
            class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div
              class="bg-gradient-to-r from-yellow-500 to-orange-600 h-32 flex items-center justify-center"
            >
              <i class="fas fa-lightbulb text-4xl text-white"></i>
            </div>
            <div class="p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-2">
                Adafruit Blog
              </h3>
              <p class="text-gray-600 text-sm mb-4">
                Tin tức từ Adafruit Industries về DIY projects và sản phẩm mới
              </p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs"
                  >Adafruit</span
                >
                <span
                  class="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs"
                  >Maker</span
                >
              </div>
              <a
                href="https://blog.adafruit.com/"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-yellow-600 hover:text-yellow-800 font-medium"
              >
                Truy cập <i class="fas fa-external-link-alt ml-1"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Vietnamese Tech News -->
      <div class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 flex items-center">
          <i class="fas fa-flag text-red-600 mr-2"></i>
          Tin tức công nghệ Việt Nam
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- VnExpress -->
          <div
            class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div
              class="bg-gradient-to-r from-red-600 to-red-700 h-32 flex items-center justify-center"
            >
              <i class="fas fa-newspaper text-4xl text-white"></i>
            </div>
            <div class="p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-2">
                VnExpress Số hóa
              </h3>
              <p class="text-gray-600 text-sm mb-4">
                Tin công nghệ hàng đầu Việt Nam, cập nhật xu hướng công nghệ mới
                nhất
              </p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs"
                  >Việt Nam</span
                >
                <span
                  class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                  >Số hóa</span
                >
              </div>
              <a
                href="https://vnexpress.net/so-hoa"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-red-600 hover:text-red-800 font-medium"
              >
                Truy cập <i class="fas fa-external-link-alt ml-1"></i>
              </a>
            </div>
          </div>

          <!-- ICTnews -->
          <div
            class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div
              class="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 flex items-center justify-center"
            >
              <i class="fas fa-desktop text-4xl text-white"></i>
            </div>
            <div class="p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-2">ICTnews</h3>
              <p class="text-gray-600 text-sm mb-4">
                Tin tức ICT chuyên sâu về công nghệ thông tin và truyền thông
              </p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                  >ICT</span
                >
                <span
                  class="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs"
                  >Chuyên sâu</span
                >
              </div>
              <a
                href="https://ictnews.vietnamnet.vn/"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                Truy cập <i class="fas fa-external-link-alt ml-1"></i>
              </a>
            </div>
          </div>

          <!-- Genk -->
          <div
            class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div
              class="bg-gradient-to-r from-green-600 to-emerald-700 h-32 flex items-center justify-center"
            >
              <i class="fas fa-mobile-alt text-4xl text-white"></i>
            </div>
            <div class="p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-2">Genk</h3>
              <p class="text-gray-600 text-sm mb-4">
                Tin công nghệ phổ thông, đánh giá sản phẩm và xu hướng công nghệ
              </p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
                  >Phổ thông</span
                >
                <span
                  class="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs"
                  >Review</span
                >
              </div>
              <a
                href="https://genk.vn/"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-green-600 hover:text-green-800 font-medium"
              >
                Truy cập <i class="fas fa-external-link-alt ml-1"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Search Tools -->
      <div
        class="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl text-white p-8 mb-12"
      >
        <h2 class="text-2xl font-bold mb-6 text-center">
          <i class="fas fa-search mr-2"></i>
          Công cụ tìm kiếm chuyên biệt
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white/10 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-3">
              <i class="fab fa-google mr-2"></i>
              Google News - Linh kiện điện tử
            </h3>
            <p class="text-sm opacity-90 mb-4">
              Tìm kiếm tin tức mới nhất về Arduino, Raspberry Pi, ESP32, IoT
            </p>
            <a
              href="https://news.google.com/search?q=Arduino%20OR%20%22Raspberry%20Pi%22%20OR%20ESP32%20OR%20IoT"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Tìm kiếm <i class="fas fa-external-link-alt ml-2"></i>
            </a>
          </div>
          <div class="bg-white/10 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-3">
              <i class="fab fa-reddit mr-2"></i>
              Reddit - Electronics Communities
            </h3>
            <p class="text-sm opacity-90 mb-4">
              Cộng đồng thảo luận về electronics, arduino, raspberry_pi
            </p>
            <a
              href="https://www.reddit.com/r/electronics+arduino+raspberry_pi/"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Truy cập <i class="fas fa-external-link-alt ml-2"></i>
            </a>
          </div>
        </div>
      </div>

      <!-- Keywords Guide -->
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          <i class="fas fa-tags text-blue-600 mr-2"></i>
          Từ khóa tìm kiếm hữu ích
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <i class="fas fa-microchip text-blue-600 text-2xl mb-2"></i>
            <p class="text-sm font-medium text-gray-800">
              "microcontroller news 2025"
            </p>
          </div>
          <div class="bg-green-50 rounded-lg p-4 text-center">
            <i class="fas fa-wifi text-green-600 text-2xl mb-2"></i>
            <p class="text-sm font-medium text-gray-800">
              "ESP32 latest updates"
            </p>
          </div>
          <div class="bg-red-50 rounded-lg p-4 text-center">
            <i class="fab fa-raspberry-pi text-red-600 text-2xl mb-2"></i>
            <p class="text-sm font-medium text-gray-800">
              "Raspberry Pi 5 reviews"
            </p>
          </div>
          <div class="bg-purple-50 rounded-lg p-4 text-center">
            <i class="fas fa-robot text-purple-600 text-2xl mb-2"></i>
            <p class="text-sm font-medium text-gray-800">
              "Arduino new products"
            </p>
          </div>
          <div class="bg-yellow-50 rounded-lg p-4 text-center">
            <i class="fas fa-network-wired text-yellow-600 text-2xl mb-2"></i>
            <p class="text-sm font-medium text-gray-800">
              "IoT technology news"
            </p>
          </div>
          <div class="bg-indigo-50 rounded-lg p-4 text-center">
            <i class="fas fa-cogs text-indigo-600 text-2xl mb-2"></i>
            <p class="text-sm font-medium text-gray-800">
              "embedded systems 2025"
            </p>
          </div>
          <div class="bg-pink-50 rounded-lg p-4 text-center">
            <i class="fas fa-memory text-pink-600 text-2xl mb-2"></i>
            <p class="text-sm font-medium text-gray-800">
              "semiconductor industry"
            </p>
          </div>
          <div class="bg-teal-50 rounded-lg p-4 text-center">
            <i class="fas fa-satellite-dish text-teal-600 text-2xl mb-2"></i>
            <p class="text-sm font-medium text-gray-800">"sensor technology"</p>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import Header from "@/components/client/Header.vue";
import Footer from "@/components/client/Footer.vue";
</script>

<style scoped>
/* Custom styles if needed */
</style>

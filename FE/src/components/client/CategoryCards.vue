<script setup>
import { ref } from 'vue'

const categories = [
  {
    id: 1,
    name: 'Arduino & Vi điều khiển',
    description: 'Board mạch, vi điều khiển và phụ kiện',
    icon: 'fas fa-microchip',
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:bg-blue-100',
    route: '/categories/arduino',
    productCount: 150,
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    badge: 'Hot',
    badgeColor: 'bg-red-500'
  },
  {
    id: 2,
    name: 'Cảm biến IoT',
    description: 'Sensors, modules và thiết bị IoT',
    icon: 'fas fa-satellite-dish',
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverColor: 'hover:bg-green-100',
    route: '/categories/sensors',
    productCount: 200,
    image: 'https://images.unsplash.com/photo-1581092795442-57a7bd3bc517?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    badge: 'New',
    badgeColor: 'bg-green-500'
  },
  {
    id: 3,
    name: 'Robot & Automation',
    description: 'Kit robot, servo và động cơ',
    icon: 'fas fa-robot',
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:bg-purple-100',
    route: '/categories/robot',
    productCount: 80,
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    badge: '',
    badgeColor: ''
  },
  {
    id: 4,
    name: 'Phụ kiện điện tử',
    description: 'Linh kiện, dây cáp và công cụ',
    icon: 'fas fa-tools',
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    hoverColor: 'hover:bg-orange-100',
    route: '/categories/accessories',
    productCount: 300,
    image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    badge: '',
    badgeColor: ''
  },
  {
    id: 5,
    name: 'Module & Shield',
    description: 'Expansion boards và modules',
    icon: 'fas fa-memory',
    iconColor: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    hoverColor: 'hover:bg-teal-100',
    route: '/categories/modules',
    productCount: 120,
    image: 'https://images.unsplash.com/photo-1581092916274-b24875626894?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    badge: '',
    badgeColor: ''
  },
  {
    id: 6,
    name: 'Màn hình & Display',
    description: 'LCD, OLED và LED matrix',
    icon: 'fas fa-tv',
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    hoverColor: 'hover:bg-indigo-100',
    route: '/categories/displays',
    productCount: 90,
    image: 'https://images.unsplash.com/photo-1581092818484-8c8c1e0b3b2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    badge: 'Sale',
    badgeColor: 'bg-yellow-500'
  }
]

const hoveredCategory = ref(null)
</script>

<template>
  <section class="py-16 bg-white">
    <div class="container mx-auto px-4">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Danh Mục Sản Phẩm
        </h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Khám phá bộ sưu tập đa dạng các sản phẩm điện tử chất lượng cao cho mọi dự án của bạn
        </p>
        <div class="w-24 h-1 bg-blue-600 mx-auto mt-6"></div>
      </div>

      <!-- Categories Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <router-link
          v-for="category in categories"
          :key="category.id"
          :to="category.route"
          @mouseenter="hoveredCategory = category.id"
          @mouseleave="hoveredCategory = null"
          class="group block"
        >
          <!-- Category Card -->
          <div 
            :class="[
              'relative overflow-hidden rounded-2xl border-2 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-xl',
              category.borderColor,
              category.bgColor,
              category.hoverColor
            ]"
          >
            <!-- Badge -->
            <div 
              v-if="category.badge"
              :class="[
                'absolute top-4 right-4 z-10 px-3 py-1 text-white text-xs font-bold rounded-full',
                category.badgeColor
              ]"
            >
              {{ category.badge }}
            </div>

            <!-- Category Image -->
            <div class="relative h-48 overflow-hidden">
              <img
                :src="category.image"
                :alt="category.name"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <!-- Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <!-- Icon Overlay -->
              <div 
                :class="[
                  'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300',
                  hoveredCategory === category.id ? 'bg-white scale-110 shadow-lg' : 'bg-white/80'
                ]"
              >
                <i 
                  :class="[category.icon, category.iconColor, 'text-2xl']"
                ></i>
              </div>
            </div>

            <!-- Category Info -->
            <div class="p-6">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {{ category.name }}
                </h3>
                <div class="flex items-center text-sm text-gray-500">
                  <i class="fas fa-box mr-1"></i>
                  {{ category.productCount }}
                </div>
              </div>
              
              <p class="text-gray-600 mb-4 leading-relaxed">
                {{ category.description }}
              </p>

              <!-- View More Button -->
              <div class="flex items-center justify-between">
                <span class="text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                  Xem tất cả
                  <i class="fas fa-arrow-right ml-1 transform group-hover:translate-x-1 transition-transform"></i>
                </span>
                
                <!-- Popular Products Preview -->
                <div class="flex -space-x-2">
                  <div class="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                    <i class="fas fa-microchip text-xs text-gray-600"></i>
                  </div>
                  <div class="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                    <i class="fas fa-memory text-xs text-gray-600"></i>
                  </div>
                  <div class="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-xs text-gray-600 font-medium">
                    +{{ Math.floor(category.productCount / 10) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Decorative Elements -->
            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </router-link>
      </div>

      <!-- Browse All Categories Button -->
      <div class="text-center mt-12">
        <router-link
          to="/categories"
          class="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          <i class="fas fa-th-large mr-2"></i>
          Xem Tất Cả Danh Mục
          <i class="fas fa-arrow-right ml-2"></i>
        </router-link>
      </div>
    </div>
  </section>

  <!-- Quick Stats Section -->
  <section class="py-12 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <!-- Total Products -->
        <div class="text-center">
          <div class="text-3xl md:text-4xl font-bold text-blue-600 mb-2">1000+</div>
          <div class="text-gray-600 font-medium">Sản phẩm</div>
        </div>

        <!-- Categories -->
        <div class="text-center">
          <div class="text-3xl md:text-4xl font-bold text-green-600 mb-2">{{ categories.length }}+</div>
          <div class="text-gray-600 font-medium">Danh mục</div>
        </div>

        <!-- Happy Customers -->
        <div class="text-center">
          <div class="text-3xl md:text-4xl font-bold text-purple-600 mb-2">5000+</div>
          <div class="text-gray-600 font-medium">Khách hàng</div>
        </div>

        <!-- Years Experience -->
        <div class="text-center">
          <div class="text-3xl md:text-4xl font-bold text-orange-600 mb-2">10+</div>
          <div class="text-gray-600 font-medium">Năm kinh nghiệm</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Custom hover effects */
.group:hover .transform {
  transform: scale(1.05);
}

/* Smooth transitions for all interactive elements */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
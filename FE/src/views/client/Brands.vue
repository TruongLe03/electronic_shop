<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from 'vue-router'
import ClientLayout from "@/layout/ClientLayout.vue";

const router = useRouter()
const brands = ref([]);
const loading = ref(false);
const searchQuery = ref('')
const selectedCountry = ref('')
const selectedSpecialty = ref('')

const popularBrands = ref([
  {
    id: 1,
    name: "Arduino",
    logo: "fas fa-bolt",
    description: "Nền tảng phần cứng mã nguồn mở cho các dự án điện tử",
    productCount: 45,
    featured: true,
    color: "from-blue-600 to-cyan-500",
    country: "Italy",
    founded: "2005",
    website: "https://arduino.cc",
    specialties: ["Vi điều khiển", "Board phát triển", "Cảm biến", "IoT"]
  },
  {
    id: 2,
    name: "Raspberry Pi",
    logo: "🍓",
    description: "Máy tính nhỏ gọn cho giáo dục và phát triển IoT",
    productCount: 28,
    featured: true,
    color: "from-green-600 to-emerald-500",
    country: "United Kingdom", 
    founded: "2012",
    website: "https://raspberrypi.org",
    specialties: ["Single Board Computer", "Camera Module", "HAT Boards"]
  },
  {
    id: 3,
    name: "ESP32/ESP8266",
    logo: "�",
    description: "Vi điều khiển WiFi cho các ứng dụng IoT",
    productCount: 67,
    featured: true,
    color: "from-purple-600 to-pink-500",
    country: "China",
    founded: "2008", 
    website: "https://espressif.com",
    specialties: ["WiFi Module", "Bluetooth", "IoT Solutions"]
  },
  {
    id: 4,
    name: "Adafruit",
    logo: "fas fa-tools",
    description: "Nhà phân phối linh kiện điện tử và học tập DIY",
    productCount: 156,
    featured: true,
    color: "from-orange-600 to-red-500",
    country: "United States",
    founded: "2005",
    website: "https://adafruit.com", 
    specialties: ["Learning Kits", "Breakout Boards", "Development Tools"]
  },
  {
    id: 5,
    name: "SparkFun",
    logo: "fas fa-cog",
    description: "Giáo dục điện tử và open source hardware",
    productCount: 134,
    featured: true,
    color: "from-red-600 to-pink-500",
    country: "United States",
    founded: "2003",
    website: "https://sparkfun.com",
    specialties: ["Educational Kits", "Prototyping", "Open Source Hardware"]
  },
  {
    id: 6,
    name: "STMicroelectronics",
    logo: "fas fa-microscope",
    description: "Vi điều khiển ARM Cortex-M và analog ICs",
    productCount: 123,
    featured: false,
    color: "from-indigo-600 to-purple-500",
    country: "Switzerland",
    founded: "1987", 
    website: "https://st.com",
    specialties: ["ARM Cortex-M", "Analog ICs", "Power Management"]
  },
  {
    id: 7,
    name: "Texas Instruments",
    logo: "fas fa-calculator",
    description: "Bán dẫn và linh kiện điện tử chất lượng cao",
    productCount: 89,
    featured: false,
    color: "from-blue-600 to-teal-500",
    country: "United States",
    founded: "1930",
    website: "https://ti.com", 
    specialties: ["Analog Chips", "Embedded Processors", "Wireless"]
  },
  {
    id: 8,
    name: "Nordic Semiconductor",
    logo: "📶",
    description: "Chuyên gia về wireless connectivity và Bluetooth LE",
    productCount: 34,
    featured: false,
    color: "from-gray-600 to-slate-700",
    country: "Norway",
    founded: "1983",
    website: "https://nordicsemi.com",
    specialties: ["Bluetooth LE", "Zigbee", "Thread/Matter"]
  }
]);

// Computed properties
const countries = computed(() => {
  return [...new Set(popularBrands.value.map(brand => brand.country))].sort()
})

const specialties = computed(() => {
  const allSpecialties = popularBrands.value.flatMap(brand => brand.specialties)
  return [...new Set(allSpecialties)].sort()
})

const filteredBrands = computed(() => {
  let filtered = popularBrands.value

  // Filter by search
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    filtered = filtered.filter(brand => 
      brand.name.toLowerCase().includes(search) ||
      brand.description.toLowerCase().includes(search) ||
      brand.specialties?.some(s => s.toLowerCase().includes(search))
    )
  }

  // Filter by country
  if (selectedCountry.value) {
    filtered = filtered.filter(brand => brand.country === selectedCountry.value)
  }

  // Filter by specialty
  if (selectedSpecialty.value) {
    filtered = filtered.filter(brand => 
      brand.specialties?.includes(selectedSpecialty.value)
    )
  }

  return filtered
})

const featuredBrands = computed(() => {
  return filteredBrands.value.filter(brand => brand.featured);
});

onMounted(() => {
  brands.value = popularBrands.value;
});

const viewBrandProducts = (brand) => {
  router.push({ 
    path: '/products', 
    query: { brand: brand.name }
  })
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCountry.value = ''
  selectedSpecialty.value = ''
}

const otherBrands = computed(() => {
  return brands.value.filter(brand => !brand.featured);
});
</script>

<template>
  <ClientLayout>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          <i class="fas fa-microchip text-blue-600 mr-3"></i>
          Thương hiệu linh kiện hàng đầu
        </h1>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto">
          Khám phá các nhà sản xuất linh kiện điện tử hàng đầu thế giới - từ vi điều khiển, cảm biến đến module IoT
        </p>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="relative">
            <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Tìm kiếm thương hiệu..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
          
          <!-- Country Filter -->
          <select 
            v-model="selectedCountry"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất cả quốc gia</option>
            <option v-for="country in uniqueCountries" :key="country" :value="country">
              {{ country }}
            </option>
          </select>

          <!-- Specialty Filter -->
          <select 
            v-model="selectedSpecialty"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất cả chuyên môn</option>
            <option v-for="specialty in uniqueSpecialties" :key="specialty" :value="specialty">
              {{ specialty }}
            </option>
          </select>

          <!-- Clear Filters -->
          <button 
            @click="clearFilters"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <i class="fas fa-times mr-2"></i>
            Xóa bộ lọc
          </button>
        </div>
      </div>

      <!-- Featured Brands -->
      <div class="mb-16">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">
          <i class="fas fa-star text-yellow-500 mr-2"></i>
          Thương hiệu hàng đầu
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div 
            v-for="brand in featuredBrands" 
            :key="brand.id"
            class="group cursor-pointer transform hover:-translate-y-2 transition-all duration-300"
            @click="viewBrandProducts(brand)"
          >
            <div :class="`bg-gradient-to-br ${brand.color} rounded-2xl p-6 text-white shadow-xl group-hover:shadow-2xl`">
              <div class="text-center">
                <div class="text-4xl mb-4 text-blue-600">
                  <i :class="brand.logo"></i>
                </div>
                <h3 class="text-xl font-bold mb-2">{{ brand.name }}</h3>
                <p class="text-sm opacity-90 mb-3">{{ brand.description }}</p>
                
                <!-- Country & Founded -->
                <div class="flex justify-center items-center gap-2 mb-3 text-xs opacity-75">
                  <i class="fas fa-globe-americas"></i>
                  <span>{{ brand.country }}</span>
                  <span>•</span>
                  <span>{{ brand.founded }}</span>
                </div>

                <!-- Specialties -->
                <div class="mb-4">
                  <div class="flex flex-wrap gap-1 justify-center">
                    <span 
                      v-for="specialty in brand.specialties.slice(0, 2)" 
                      :key="specialty"
                      class="bg-white/20 rounded-full px-2 py-1 text-xs"
                    >
                      {{ specialty }}
                    </span>
                  </div>
                </div>

                <div class="bg-white/20 rounded-full px-4 py-2 inline-block">
                  <span class="text-sm font-medium">{{ brand.productCount }}+ sản phẩm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- All Filtered Brands -->
      <div class="mb-12" v-if="filteredBrands.length > 0">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">
          <i class="fas fa-search mr-2"></i>
          Kết quả tìm kiếm ({{ filteredBrands.length }} thương hiệu)
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div 
            v-for="brand in filteredBrands" 
            :key="brand.id"
            class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            @click="viewBrandProducts(brand)"
          >
            <div class="p-6">
              <div class="text-center mb-4">
                <div class="text-4xl mb-3 text-blue-600">
                  <i :class="brand.logo"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ brand.name }}</h3>
                <p class="text-sm text-gray-600 mb-3">{{ brand.description }}</p>
              </div>

              <!-- Info Grid -->
              <div class="space-y-2 mb-4">
                <div class="flex justify-between text-xs text-gray-500">
                  <span><i class="fas fa-globe-americas mr-1"></i>{{ brand.country }}</span>
                  <span><i class="fas fa-calendar-alt mr-1"></i>{{ brand.founded }}</span>
                </div>
                
                <!-- Specialties -->
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="specialty in brand.specialties" 
                    :key="specialty"
                    class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    {{ specialty }}
                  </span>
                </div>
              </div>

              <div class="text-center">
                <div class="bg-gray-100 rounded-full px-3 py-2 inline-block">
                  <span class="text-xs font-medium text-gray-700">
                    <i class="fas fa-box mr-1"></i>
                    {{ brand.productCount }}+ sản phẩm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-else class="text-center py-12">
        <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy thương hiệu nào</h3>
        <p class="text-gray-500 mb-4">Hãy thử điều chỉnh bộ lọc tìm kiếm</p>
        <button 
          @click="clearFilters"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Xóa bộ lọc
        </button>
      </div>

      <!-- Component Categories -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">
          <i class="fas fa-th-large text-blue-600 mr-2"></i>
          Danh mục linh kiện
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="text-center p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
            <div class="text-4xl mb-4">
              <i class="fas fa-microchip text-blue-600"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Vi điều khiển</h3>
            <p class="text-gray-600 mb-4">Arduino, Raspberry Pi, ESP32, STM32, PIC</p>
            <button class="text-blue-600 hover:text-blue-800 font-medium">
              Xem tất cả <i class="fas fa-arrow-right ml-1"></i>
            </button>
          </div>

          <div class="text-center p-6 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all cursor-pointer">
            <div class="text-4xl mb-4">
              <i class="fas fa-wifi text-green-600"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">IoT & Wireless</h3>
            <p class="text-gray-600 mb-4">ESP32, nRF52, LoRa, Zigbee, Bluetooth</p>
            <button class="text-green-600 hover:text-green-800 font-medium">
              Xem tất cả <i class="fas fa-arrow-right ml-1"></i>
            </button>
          </div>

          <div class="text-center p-6 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer">
            <div class="text-4xl mb-4">
              <i class="fas fa-satellite-dish text-purple-600"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Cảm biến</h3>
            <p class="text-gray-600 mb-4">Temperature, Humidity, Motion, Light, Gas</p>
            <button class="text-purple-600 hover:text-purple-800 font-medium">
              Xem tất cả <i class="fas fa-arrow-right ml-1"></i>
            </button>
          </div>

          <div class="text-center p-6 border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all cursor-pointer">
            <div class="text-4xl mb-4">
              <i class="fas fa-bolt text-red-600"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Nguồn & Pin</h3>
            <p class="text-gray-600 mb-4">LiPo, Power Supply, Voltage Regulator, Solar</p>
            <button class="text-red-600 hover:text-red-800 font-medium">
              Xem tất cả <i class="fas fa-arrow-right ml-1"></i>
            </button>
          </div>

          <div class="text-center p-6 border border-gray-200 rounded-xl hover:border-yellow-300 hover:bg-yellow-50 transition-all cursor-pointer">
            <div class="text-4xl mb-4">
              <i class="fas fa-display text-yellow-600"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Màn hình</h3>
            <p class="text-gray-600 mb-4">OLED, LCD, TFT, E-Paper, LED Matrix</p>
            <button class="text-yellow-600 hover:text-yellow-800 font-medium">
              Xem tất cả <i class="fas fa-arrow-right ml-1"></i>
            </button>
          </div>

          <div class="text-center p-6 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer">
            <div class="text-4xl mb-4">
              <i class="fas fa-cogs text-indigo-600"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Linh kiện khác</h3>
            <p class="text-gray-600 mb-4">Resistor, Capacitor, LED, Motor, Relay</p>
            <button class="text-indigo-600 hover:text-indigo-800 font-medium">
              Xem tất cả <i class="fas fa-arrow-right ml-1"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Tech News -->
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white p-8 text-center">
        <h2 class="text-2xl font-bold mb-4">
          <i class="fas fa-newspaper mr-2"></i>
          Tin tức công nghệ
        </h2>
        <p class="mb-6 opacity-90">Cập nhật những thông tin mới nhất về linh kiện và công nghệ IoT từ các hãng hàng đầu</p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="bg-white/10 rounded-lg p-4 text-left">
            <div class="flex items-center mb-2">
              <i class="fas fa-microchip text-orange-300 mr-2"></i>
              <h4 class="font-semibold">ESP32-S3 mới ra mắt</h4>
            </div>
            <p class="text-sm opacity-90">AI tích hợp, WiFi 6, hiệu năng gấp đôi</p>
            <span class="text-xs bg-white/20 px-2 py-1 rounded-full mt-2 inline-block">Espressif</span>
          </div>
          
          <div class="bg-white/10 rounded-lg p-4 text-left">
            <div class="flex items-center mb-2">
              <i class="fas fa-raspberry-pi text-red-300 mr-2"></i>
              <h4 class="font-semibold">Raspberry Pi 5 chính thức</h4>
            </div>
            <p class="text-sm opacity-90">CPU ARMv8 64-bit, RAM 8GB, giá $80</p>
            <span class="text-xs bg-white/20 px-2 py-1 rounded-full mt-2 inline-block">Raspberry Pi</span>
          </div>
          
          <div class="bg-white/10 rounded-lg p-4 text-left">
            <div class="flex items-center mb-2">
              <i class="fas fa-robot text-blue-300 mr-2"></i>
              <h4 class="font-semibold">Arduino Uno R4 WiFi</h4>
            </div>
            <p class="text-sm opacity-90">32-bit ARM Cortex-M4, WiFi tích hợp</p>
            <span class="text-xs bg-white/20 px-2 py-1 rounded-full mt-2 inline-block">Arduino</span>
          </div>
        </div>
        <button class="mt-6 bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
          <i class="fas fa-external-link-alt mr-2"></i>
          Đọc thêm tin tức
        </button>
      </div>
    </main>
  </ClientLayout>
</template>

<style scoped>
/* Custom styles nếu cần */
</style>

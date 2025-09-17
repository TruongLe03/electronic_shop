<template>
  <Header />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <div class="flex flex-col items-center space-y-4">
        <div class="relative">
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent absolute top-0"></div>
        </div>
        <p class="text-indigo-600 font-medium">Đang tải sản phẩm...</p>
      </div>
    </div>

    <!-- Product not found -->
    <div v-else-if="!product" class="flex flex-col items-center justify-center min-h-screen">
      <div class="text-center max-w-md mx-auto px-4">
        <div class="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
        <p class="text-gray-600 mb-6">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa</p>
        <button
          @click="$router.push('/')"
          class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          Quay về trang chủ
        </button>
      </div>
    </div>

    <!-- Product detail -->
    <div v-else class="container mx-auto px-4 py-8">
      <!-- Breadcrumb -->
      <nav class="flex items-center space-x-2 text-sm mb-8 bg-white/50 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm">
        <router-link to="/" class="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          Trang chủ
        </router-link>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
        <router-link
          v-if="product.category_id"
          :to="`/products?categoryId=${product.category_id._id}`"
          class="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          {{ product.category_id.name }}
        </router-link>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
        <span class="text-gray-600 font-medium">{{ product.name }}</span>
      </nav>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Product Images -->
        <div class="space-y-4">
          <!-- Main Image -->
          <div class="group relative aspect-square bg-white rounded-2xl shadow-lg overflow-hidden ring-1 ring-gray-200">
            <img
              :src="selectedImage || getFullImage(product.main_image)"
              :alt="product.name"
              class="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
              @error="handleImageError"
            />
            
            <!-- Image zoom overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <!-- Wishlist button -->
            <button
              @click="toggleWishlist"
              class="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              :class="isInWishlist ? 'text-red-500' : 'text-gray-600 hover:text-red-500'"
            >
              <svg class="w-6 h-6" :fill="isInWishlist ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
          </div>

          <!-- Thumbnail Images -->
          <div
            v-if="product.images && product.images.length > 0"
            class="flex space-x-3 overflow-x-auto scrollbar-hide"
          >
            <div
              class="w-20 h-20 rounded-lg overflow-hidden cursor-pointer ring-2 transition-all duration-300 hover:scale-105"
              :class="selectedImage === getFullImage(product.main_image) ? 'ring-indigo-500 shadow-lg' : 'ring-gray-200 hover:ring-indigo-300'"
              @click="selectedImage = getFullImage(product.main_image)"
            >
              <img
                :src="getFullImage(product.main_image)"
                :alt="product.name"
                class="w-full h-full object-contain bg-gray-50"
              />
            </div>
            <div
              v-for="(image, index) in product.images"
              :key="index"
              class="w-20 h-20 rounded-lg overflow-hidden cursor-pointer ring-2 transition-all duration-300 hover:scale-105"
              :class="selectedImage === getFullImage(image) ? 'ring-indigo-500 shadow-lg' : 'ring-gray-200 hover:ring-indigo-300'"
              @click="selectedImage = getFullImage(image)"
            >
              <img
                :src="getFullImage(image)"
                :alt="`${product.name} ${index + 1}`"
                class="w-full h-full object-contain bg-gray-50"
              />
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div class="space-y-6">
          <!-- Header Info -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg ring-1 ring-gray-200">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h1 class="text-3xl font-bold text-gray-900 mb-3 leading-tight">{{ product.name }}</h1>
                <div class="flex items-center space-x-4 text-sm">
                  <!-- SKU -->
                  <div class="flex items-center space-x-1 text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                    </svg>
                    <span class="font-medium">SKU:</span>
                    <span class="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{{ product.sku }}</span>
                  </div>
                  
                  <!-- Rating -->
                  <div class="flex items-center space-x-2">
                    <div class="flex space-x-1">
                      <svg
                        v-for="i in 5"
                        :key="i"
                        class="w-4 h-4"
                        :class="i <= Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </div>
                    <span class="text-gray-600 font-medium">({{ product.rating || 0 }})</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Stock & Sales Info -->
            <div class="flex items-center justify-between py-4 border-t border-gray-200">
              <div class="flex items-center space-x-4">
                <!-- Stock Status -->
                <div class="flex items-center space-x-2">
                  <div class="flex items-center">
                    <div
                      class="w-3 h-3 rounded-full mr-2"
                      :class="product.stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'"
                    ></div>
                    <span
                      class="font-medium"
                      :class="product.stock > 0 ? 'text-green-700' : 'text-red-700'"
                    >
                      {{ product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng" }}
                    </span>
                  </div>
                </div>
                
                <!-- Sales Count -->
                <div v-if="product.sold > 0" class="flex items-center space-x-1 text-gray-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                  <span>Đã bán {{ product.sold }}</span>
                </div>
              </div>
              
              <!-- Views -->
              <div class="flex items-center space-x-1 text-gray-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <span class="text-sm">{{ product.views || 0 }} lượt xem</span>
              </div>
            </div>
          </div>

          <!-- Price Section -->
          <div class="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 shadow-lg ring-1 ring-red-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <!-- Current Price -->
                <span
                  v-if="product.discount_price"
                  class="text-4xl font-bold text-red-600"
                >
                  {{ formatPrice(product.discount_price) }}
                </span>
                <span v-else class="text-4xl font-bold text-red-600">
                  {{ formatPrice(product.price) }}
                </span>

                <!-- Original Price -->
                <span
                  v-if="product.discount_price && product.discount_price < product.price"
                  class="text-xl text-gray-500 line-through"
                >
                  {{ formatPrice(product.price) }}
                </span>
              </div>

              <!-- Discount Badge -->
              <span
                v-if="product.discount_percent"
                class="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse"
              >
                -{{ product.discount_percent }}%
              </span>
            </div>

            <!-- Warranty -->
            <div v-if="product.warranty" class="mt-4 flex items-center text-sm text-gray-700">
              <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span class="font-medium">Bảo hành: {{ product.warranty }}</span>
            </div>
          </div>

          <!-- Purchase Options -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg ring-1 ring-gray-200 space-y-6">
            <!-- Quantity Selector -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">Số lượng:</label>
              <div class="flex items-center space-x-4">
                <div class="flex items-center bg-gray-100 rounded-lg">
                  <button
                    @click="decreaseQuantity"
                    :disabled="quantity <= 1"
                    class="w-12 h-12 rounded-l-lg flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                    </svg>
                  </button>
                  <div class="w-16 h-12 flex items-center justify-center bg-white border-x text-lg font-bold">
                    {{ quantity }}
                  </div>
                  <button
                    @click="increaseQuantity"
                    :disabled="quantity >= product.stock"
                    class="w-12 h-12 rounded-r-lg flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                  </button>
                </div>
                <div class="text-sm text-gray-600">
                  {{ product.stock }} sản phẩm có sẵn
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                @click="addToCart"
                :disabled="product.stock === 0 || addingToCart"
                class="group relative bg-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div class="flex items-center justify-center space-x-2">
                  <svg
                    v-if="addingToCart"
                    class="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13h.01m-.01 0l.01.01c1.36 0 2.5 1.14 2.5 2.5s-1.14 2.5-2.5 2.5-2.5-1.14-2.5-2.5 1.14-2.5 2.5-2.5z"/>
                  </svg>
                  <span>{{ addingToCart ? "Đang thêm..." : "Thêm vào giỏ" }}</span>
                </div>
              </button>

              <button
                @click="buyNow"
                :disabled="product.stock === 0"
                class="group bg-red-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div class="flex items-center justify-center space-x-2">
                  <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  <span>Mua ngay</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Product Tags -->
          <div v-if="product.tags && product.tags.length > 0" class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg ring-1 ring-gray-200">
            <h3 class="text-lg font-semibold mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
              Thẻ tag:
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in product.tags"
                :key="tag"
                class="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 text-sm px-4 py-2 rounded-full font-medium hover:from-indigo-200 hover:to-purple-200 transition-all duration-200 cursor-pointer"
              >
                #{{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Information Tabs -->
      <div class="mt-16">
        <div class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg ring-1 ring-gray-200 overflow-hidden">
          <!-- Tab Headers -->
          <div class="border-b border-gray-200 bg-gray-50/50">
            <nav class="flex space-x-8 px-6">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                class="py-4 px-2 border-b-2 font-semibold text-sm transition-all duration-200 relative"
                :class="activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              >
                <span class="flex items-center space-x-2">
                  <svg v-if="tab.id === 'description'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <svg v-else-if="tab.id === 'specifications'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                  </svg>
                  <span>{{ tab.name }}</span>
                </span>
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="p-8">
            <!-- Description Tab -->
            <div v-if="activeTab === 'description'" class="space-y-6">
              <div class="flex items-center space-x-2 mb-6">
                <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900">Mô tả sản phẩm</h3>
              </div>
              
              <div class="prose max-w-none">
                <div class="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                  {{ cleanedDescription || product.description || "Chưa có mô tả chi tiết cho sản phẩm này." }}
                </div>

                <div v-if="product.description_detail" class="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-indigo-200">
                  <h4 class="text-xl font-semibold mb-4 text-indigo-900">Mô tả chi tiết</h4>
                  <div class="text-gray-700 leading-relaxed whitespace-pre-line">
                    {{ product.description_detail }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Specifications Tab -->
            <div v-if="activeTab === 'specifications'" class="space-y-6">
              <div class="flex items-center space-x-2 mb-6">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900">Thông số kỹ thuật</h3>
              </div>
              
              <div v-if="productSpecifications.length > 0" class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div class="divide-y divide-gray-200">
                  <div
                    v-for="(spec, index) in productSpecifications"
                    :key="spec.label"
                    class="hover:bg-gray-50 transition-colors duration-200"
                    :class="index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'"
                  >
                    <div class="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div class="font-semibold text-gray-900 flex items-center">
                        <div class="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                        {{ spec.label }}
                      </div>
                      <div class="md:col-span-2 text-gray-700 font-medium">
                        {{ spec.value }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else class="text-center py-12">
                <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <h4 class="text-lg font-semibold text-gray-900 mb-2">Chưa có thông số kỹ thuật</h4>
                <p class="text-gray-600">Thông số kỹ thuật chi tiết sẽ được cập nhật sớm</p>
              </div>
            </div>

            <!-- Reviews Tab -->
            <div v-if="activeTab === 'reviews'" class="space-y-6">
              <div class="flex items-center space-x-2 mb-6">
                <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900">Đánh giá sản phẩm</h3>
              </div>
              
              <div class="text-center py-12">
                <div class="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <h4 class="text-lg font-semibold text-gray-900 mb-2">Tính năng đánh giá đang phát triển</h4>
                <p class="text-gray-600">Chúng tôi đang xây dựng hệ thống đánh giá để bạn có thể chia sẻ trải nghiệm về sản phẩm</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div v-if="relatedProducts.length > 0" class="mt-16">
        <div class="flex items-center space-x-3 mb-8">
          <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-900">Sản phẩm liên quan</h2>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <ProductCard
            v-for="relatedProduct in relatedProducts"
            :key="relatedProduct._id"
            :product="relatedProduct"
            class="transform hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCartStore } from "@stores/cart";
import { useAuthStore } from "@stores/auth";
import { useNotification } from "@composables/useNotification";
import { useGlobalLoading } from "@composables/useLoading";
import { getProductById, getRelatedProducts } from "@api/productService";
import { orderService } from "@api/orderService";
import { getFullImage } from "@utils/imageUtils";
import {
  extractSpecifications,
  cleanDescription,
  formatSpecifications,
} from "@utils/productUtils";
import ProductCard from "@components/client/productCard.vue";
import Header from "@components/client/Header.vue";
import Footer from "@components/client/Footer.vue";

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const { showSuccess, showError } = useNotification();
const { showPageLoading, showApiLoading, hideLoading } = useGlobalLoading();

// State
const product = ref(null);
const relatedProducts = ref([]);
const loading = ref(true);
const selectedImage = ref("");
const quantity = ref(1);
const addingToCart = ref(false);
const isInWishlist = ref(false);
const activeTab = ref("description");

// Tabs configuration
const tabs = [
  { id: "description", name: "Mô tả" },
  { id: "specifications", name: "Thông số kỹ thuật" },
  { id: "reviews", name: "Đánh giá" },
];

// Computed properties for specifications
const productSpecifications = computed(() => {
  if (!product.value) return [];

  const extracted = extractSpecifications(
    product.value.description,
    product.value.specifications
  );

  return formatSpecifications(extracted);
});

const cleanedDescription = computed(() => {
  if (!product.value || !product.value.description) return "";

  const extracted = extractSpecifications(
    product.value.description,
    product.value.specifications
  );

  return cleanDescription(product.value.description, extracted);
});

// Computed
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Methods
const fetchProduct = async (productId) => {
  let loader;
  try {
    loading.value = true;

    // Hiển thị loading overlay cho page
    loader = showPageLoading("Đang tải thông tin sản phẩm...");

    const response = await getProductById(productId);
    product.value = response.data;
    selectedImage.value = getFullImage(response.data.main_image);

    // Fetch related products
    if (response.data.category_id?._id) {
      const relatedResponse = await getRelatedProducts(
        productId, // productId để tìm related products
        4 // limit
      );
      relatedProducts.value = relatedResponse.data;
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    showError("Có lỗi xảy ra khi tải thông tin sản phẩm");
  } finally {
    loading.value = false;
    hideLoading(loader);
  }
};

const handleImageError = (event) => {
  console.log("Image load error for:", event.target.src);
  event.target.src = "/assets/images/placeholder.jpg";
};

const increaseQuantity = () => {
  if (quantity.value < product.value.stock) {
    quantity.value++;
  }
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const addToCart = async () => {
  if (!authStore.isAuthenticated) {
    showError("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
    router.push("/login");
    return;
  }

  let loader;
  try {
    addingToCart.value = true;

    // Hiển thị loading cho API call
    loader = showApiLoading("Đang thêm vào giỏ hàng...");

    await cartStore.addToCart(product.value, quantity.value);
    showSuccess(`Đã thêm ${quantity.value} sản phẩm vào giỏ hàng`);
  } catch (error) {
    console.error("Error adding to cart:", error);
    showError("Có lỗi xảy ra khi thêm vào giỏ hàng");
  } finally {
    addingToCart.value = false;
    hideLoading(loader);
  }
};

const buyNow = async () => {
  if (!authStore.isAuthenticated) {
    showError("Vui lòng đăng nhập để mua hàng");
    router.push("/login");
    return;
  }

  if (product.value.stock === 0) {
    showError("Sản phẩm đã hết hàng");
    return;
  }

  let loader;
  try {
    loader = showApiLoading("Đang tạo đơn hàng...");
    
    // Tạo đơn hàng trực tiếp với sản phẩm hiện tại
    const orderResponse = await orderService.createDirectOrder(
      product.value._id,
      quantity.value
    );

    if (orderResponse.success) {
      showSuccess("Đã tạo đơn hàng thành công!");
      // Chuyển hướng đến trang thanh toán với thông tin đơn hàng
      router.push({
        name: "Payment",
        params: { orderId: orderResponse.data._id }
      });
    } else {
      showError(orderResponse.message || "Có lỗi xảy ra khi tạo đơn hàng");
    }
  } catch (error) {
    console.error("Error creating order:", error);
    console.error("Error response data:", error.response?.data);
    const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra khi tạo đơn hàng";
    showError(errorMessage);
  } finally {
    hideLoading(loader);
  }
};

const toggleWishlist = () => {
  if (!authStore.isAuthenticated) {
    showError("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
    router.push("/login");
    return;
  }

  isInWishlist.value = !isInWishlist.value;
  const message = isInWishlist.value
    ? "Đã thêm vào danh sách yêu thích"
    : "Đã xóa khỏi danh sách yêu thích";
  showSuccess(message);
};

// Watchers
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      // Scroll to top when viewing different product
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      fetchProduct(newId);
      quantity.value = 1;
      activeTab.value = "description";
    }
  },
  { immediate: true }
);

// Lifecycle
onMounted(() => {
  // Scroll to top when component mounts
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  if (route.params.id) {
    fetchProduct(route.params.id);
  }
});
</script>

<style scoped>
.prose {
  max-width: none;
}

.prose h3 {
  margin-bottom: 1rem;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Smooth gradient animations */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}
</style>

<script setup>
import { ref } from 'vue';

const stats = [
  { icon: 'fas fa-users', value: '10,000+', label: 'Khách hàng' },
  { icon: 'fas fa-box', value: '5,000+', label: 'Sản phẩm' },
  { icon: 'fas fa-award', value: '99%', label: 'Hài lòng' },
  { icon: 'fas fa-shipping-fast', value: '50,000+', label: 'Đơn hàng' },
];

const team = [
  {
    name: 'Lê Ngọc Trường',
    position: 'CEO & Founder',
    image: '/assets/team1.jpg',
    description: 'Chuyên gia về IoT và Arduino',
  },
  {
    name: 'Nguyễn Văn A',
    position: 'Technical Director',
    image: '/assets/team2.jpg',
    description: 'Kỹ sư điện tử 10 năm kinh nghiệm',
  },
  {
    name: 'Trần Thị B',
    position: 'Customer Service Manager',
    image: '/assets/team3.jpg',
    description: 'Chăm sóc khách hàng chuyên nghiệp',
  },
];

const values = [
  {
    icon: 'fas fa-star',
    title: 'Chất lượng',
    description: 'Cam kết sản phẩm chính hãng, chất lượng cao',
  },
  {
    icon: 'fas fa-handshake',
    title: 'Uy tín',
    description: 'Đối tác tin cậy của hàng ngàn khách hàng',
  },
  {
    icon: 'fas fa-rocket',
    title: 'Đổi mới',
    description: 'Luôn cập nhật công nghệ và xu hướng mới',
  },
  {
    icon: 'fas fa-heart',
    title: 'Tận tâm',
    description: 'Hỗ trợ khách hàng 24/7 với đội ngũ chuyên nghiệp',
  },
];
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-6">
            Về LNT Electronics
          </h1>
          <p class="text-xl text-blue-100">
            Chúng tôi là đơn vị hàng đầu cung cấp linh kiện điện tử, 
            Arduino, IoT và thiết bị tự động hóa tại Việt Nam
          </p>
        </div>
      </div>
    </section>

    <!-- Story Section -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl font-bold mb-6 text-gray-900">Câu chuyện của chúng tôi</h2>
            <div class="space-y-4 text-gray-600">
              <p>
                <strong>LNT Electronics</strong> được thành lập với sứ mệnh mang đến cho 
                cộng đồng maker, kỹ sư và người đam mê công nghệ những sản phẩm 
                điện tử chất lượng cao với giá cả hợp lý.
              </p>
              <p>
                Từ một cửa hàng nhỏ, chúng tôi đã phát triển thành một trong những 
                nhà cung cấp linh kiện điện tử uy tín nhất tại Việt Nam. Với hơn 5,000 
                sản phẩm và phục vụ hơn 10,000 khách hàng, chúng tôi tự hào là đối tác 
                tin cậy của cộng đồng.
              </p>
              <p>
                Chúng tôi không chỉ bán sản phẩm mà còn xây dựng một cộng đồng, 
                nơi mọi người có thể chia sẻ kiến thức, học hỏi và sáng tạo cùng nhau.
              </p>
            </div>
          </div>
          <div class="relative">
            <div class="bg-blue-600 rounded-2xl p-8 text-white">
              <div class="space-y-6">
                <div>
                  <i class="fas fa-bullseye text-4xl mb-3"></i>
                  <h3 class="text-xl font-bold mb-2">Sứ mệnh</h3>
                  <p class="text-blue-100">
                    Làm cho công nghệ điện tử dễ tiếp cận và giúp mọi người 
                    biến ý tưởng thành hiện thực.
                  </p>
                </div>
                <div>
                  <i class="fas fa-eye text-4xl mb-3"></i>
                  <h3 class="text-xl font-bold mb-2">Tầm nhìn</h3>
                  <p class="text-blue-100">
                    Trở thành nền tảng hàng đầu Đông Nam Á về linh kiện 
                    điện tử và IoT trong 5 năm tới.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-gray-900">
          Con số ấn tượng
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl"
          >
            <i :class="stat.icon" class="text-4xl text-blue-600 mb-4"></i>
            <div class="text-3xl font-bold text-gray-900 mb-2">{{ stat.value }}</div>
            <div class="text-gray-600">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Values Section -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-gray-900">
          Giá trị cốt lõi
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="value in values"
            :key="value.title"
            class="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow"
          >
            <div class="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <i :class="value.icon" class="text-2xl text-blue-600"></i>
            </div>
            <h3 class="text-xl font-bold mb-3 text-gray-900">{{ value.title }}</h3>
            <p class="text-gray-600">{{ value.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-gray-900">
          Đội ngũ của chúng tôi
        </h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div
            v-for="member in team"
            :key="member.name"
            class="text-center group"
          >
            <div class="relative mb-4 overflow-hidden rounded-xl">
              <div class="w-full h-64 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <i class="fas fa-user text-6xl text-blue-600"></i>
              </div>
              <div class="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-20 transition-all"></div>
            </div>
            <h3 class="text-xl font-bold mb-1 text-gray-900">{{ member.name }}</h3>
            <p class="text-blue-600 font-medium mb-2">{{ member.position }}</p>
            <p class="text-gray-600 text-sm">{{ member.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-4">
          Sẵn sàng bắt đầu dự án của bạn?
        </h2>
        <p class="text-xl text-blue-100 mb-8">
          Liên hệ với chúng tôi để được tư vấn miễn phí
        </p>
        <div class="flex gap-4 justify-center">
          <router-link
            to="/contact"
            class="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Liên hệ ngay
          </router-link>
          <router-link
            to="/products"
            class="px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
          >
            Xem sản phẩm
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

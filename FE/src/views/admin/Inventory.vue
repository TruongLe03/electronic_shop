<script setup>
import { ref, onMounted, computed } from "vue";
import AdminLayout from "@/components/admin/AdminLayout.vue";

// 🟢 Dữ liệu kho
const inventory = ref([]);

// 🟢 Thống kê sản phẩm
const stats = ref({
  totalProducts: 0,
  inStock: 0,
  lowStock: 0,
  outOfStock: 0,
});

// 🟢 Bộ lọc
const selectedCategory = ref("all");
const selectedStatus = ref("all");
const searchQuery = ref("");

// 🟢 Trạng thái tải
const loading = ref(false);
const error = ref(null);

// 🟢 Hàm format
function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("vi-VN");
}

function getStockStatus(quantity) {
  if (quantity === 0) return "Hết hàng";
  if (quantity <= 5) return "Sắp hết";
  return "Còn hàng";
}

// 🟢 Giả lập API
async function loadInventory() {
  loading.value = true;
  error.value = null;
  try {
    // Giả lập dữ liệu từ API
    inventory.value = [
      {
        id: 1,
        name: "Cảm biến nhiệt độ",
        sku: "SP001",
        category: "Cảm biến",
        quantity: 10,
        price: 50000,
        updatedAt: "2025-09-30T12:00:00Z",
      },
      {
        id: 2,
        name: "Nguồn 12V 2A",
        sku: "SP002",
        category: "Nguồn",
        quantity: 0,
        price: 80000,
        updatedAt: "2025-09-29T12:00:00Z",
      },
      {
        id: 3,
        name: "Module Wifi ESP8266",
        sku: "SP003",
        category: "Module",
        quantity: 3,
        price: 120000,
        updatedAt: "2025-09-28T12:00:00Z",
      },
    ];

    // Cập nhật thống kê
    const total = inventory.value.length;
    const inStock = inventory.value.filter((i) => i.quantity > 5).length;
    const lowStock = inventory.value.filter(
      (i) => i.quantity > 0 && i.quantity <= 5
    ).length;
    const outOfStock = inventory.value.filter((i) => i.quantity === 0).length;

    stats.value = { totalProducts: total, inStock, lowStock, outOfStock };
  } catch (err) {
    error.value = "Không thể tải dữ liệu kho";
    console.error(err);
  } finally {
    loading.value = false;
  }
}

// 🟢 Tính toán inventory sau khi lọc
const filteredInventory = computed(() => {
  return inventory.value.filter((item) => {
    const matchCategory =
      selectedCategory.value === "all" ||
      item.category === selectedCategory.value;
    const matchStatus =
      selectedStatus.value === "all" ||
      getStockStatus(item.quantity) === selectedStatus.value;
    const matchSearch =
      !searchQuery.value ||
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchCategory && matchStatus && matchSearch;
  });
});

onMounted(() => {
  loadInventory();
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Header />

    <main class="flex-1 container mx-auto px-4 py-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">📦 Quản lý tồn kho</h1>

      <!-- Thống kê -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-xl shadow">
          <p class="text-gray-500">Tổng sản phẩm</p>
          <p class="text-2xl font-bold">{{ stats.totalProducts }}</p>
        </div>
        <div class="bg-green-100 p-4 rounded-xl shadow">
          <p class="text-gray-500">Còn hàng</p>
          <p class="text-2xl font-bold text-green-700">{{ stats.inStock }}</p>
        </div>
        <div class="bg-yellow-100 p-4 rounded-xl shadow">
          <p class="text-gray-500">Sắp hết</p>
          <p class="text-2xl font-bold text-yellow-700">{{ stats.lowStock }}</p>
        </div>
        <div class="bg-red-100 p-4 rounded-xl shadow">
          <p class="text-gray-500">Hết hàng</p>
          <p class="text-2xl font-bold text-red-700">{{ stats.outOfStock }}</p>
        </div>
      </div>

      <!-- Bộ lọc -->
      <div class="flex flex-wrap gap-4 mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          class="border rounded-lg px-3 py-2 flex-1"
        />
        <select v-model="selectedCategory" class="border rounded-lg px-3 py-2">
          <option value="all">Tất cả danh mục</option>
          <option value="Cảm biến">Cảm biến</option>
          <option value="Nguồn">Nguồn</option>
          <option value="Module">Module</option>
        </select>
        <select v-model="selectedStatus" class="border rounded-lg px-3 py-2">
          <option value="all">Tất cả trạng thái</option>
          <option value="Còn hàng">Còn hàng</option>
          <option value="Sắp hết">Sắp hết</option>
          <option value="Hết hàng">Hết hàng</option>
        </select>
      </div>

      <!-- Bảng sản phẩm -->
      <div class="bg-white rounded-xl shadow overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="bg-gray-100 text-left">
              <th class="px-4 py-2">Tên sản phẩm</th>
              <th class="px-4 py-2">Mã SP</th>
              <th class="px-4 py-2">Danh mục</th>
              <th class="px-4 py-2">Số lượng</th>
              <th class="px-4 py-2">Giá</th>
              <th class="px-4 py-2">Trạng thái</th>
              <th class="px-4 py-2">Cập nhật</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredInventory"
              :key="item.id"
              class="border-t"
            >
              <td class="px-4 py-2">{{ item.name }}</td>
              <td class="px-4 py-2">{{ item.sku }}</td>
              <td class="px-4 py-2">{{ item.category }}</td>
              <td class="px-4 py-2">{{ item.quantity }}</td>
              <td class="px-4 py-2">{{ formatCurrency(item.price) }}</td>
              <td class="px-4 py-2">
                <span
                  :class="{
                    'text-green-600':
                      getStockStatus(item.quantity) === 'Còn hàng',
                    'text-yellow-600':
                      getStockStatus(item.quantity) === 'Sắp hết',
                    'text-red-600':
                      getStockStatus(item.quantity) === 'Hết hàng',
                  }"
                >
                  {{ getStockStatus(item.quantity) }}
                </span>
              </td>
              <td class="px-4 py-2">{{ formatDate(item.updatedAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <Footer />
  </div>
  <AdminLayout />
</template>

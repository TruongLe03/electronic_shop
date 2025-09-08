<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const users = ref([])
const loading = ref(false)
const searchTerm = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const totalPages = ref(0)
const showUserModal = ref(false)
const selectedUser = ref(null)

const userRoles = ref([
  { value: 'user', label: 'Khách hàng', color: 'bg-blue-100 text-blue-800' },
  { value: 'admin', label: 'Quản trị viên', color: 'bg-purple-100 text-purple-800' }
])

const userStatuses = ref([
  { value: 'active', label: 'Hoạt động', color: 'bg-green-100 text-green-800' },
  { value: 'inactive', label: 'Không hoạt động', color: 'bg-gray-100 text-gray-800' },
  { value: 'suspended', label: 'Tạm khóa', color: 'bg-red-100 text-red-800' }
])

onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
    router.push('/login')
    return
  }
  
  await loadUsers()
})

const loadUsers = async () => {
  try {
    loading.value = true
    
    // Mock users data - replace with real API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    users.value = [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        phone: '0901234567',
        role: 'user',
        status: 'active',
        joinDate: '2025-01-15T10:30:00',
        lastLogin: '2025-09-06T08:45:00',
        totalOrders: 12,
        totalSpent: 5240000,
        avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random'
      },
      {
        id: 2,
        name: 'Trần Thị B',
        email: 'tranthib@email.com',
        phone: '0902345678',
        role: 'user',
        status: 'active',
        joinDate: '2025-02-20T14:15:00',
        lastLogin: '2025-09-05T16:20:00',
        totalOrders: 8,
        totalSpent: 3180000,
        avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=random'
      },
      {
        id: 3,
        name: 'Lê Văn C',
        email: 'levanc@email.com',
        phone: '0903456789',
        role: 'user',
        status: 'inactive',
        joinDate: '2025-03-10T09:00:00',
        lastLogin: '2025-08-20T12:30:00',
        totalOrders: 3,
        totalSpent: 890000,
        avatar: 'https://ui-avatars.com/api/?name=Le+Van+C&background=random'
      },
      {
        id: 4,
        name: 'Admin User',
        email: 'admin@electronic.com',
        phone: '0904567890',
        role: 'admin',
        status: 'active',
        joinDate: '2024-12-01T00:00:00',
        lastLogin: '2025-09-06T10:00:00',
        totalOrders: 0,
        totalSpent: 0,
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff'
      }
    ]
    
    totalPages.value = Math.ceil(users.value.length / itemsPerPage)
  } catch (error) {
    console.error('Error loading users:', error)
  } finally {
    loading.value = false
  }
}

const filteredUsers = computed(() => {
  let filtered = users.value
  
  if (searchTerm.value) {
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      user.phone.includes(searchTerm.value)
    )
  }
  
  if (selectedRole.value) {
    filtered = filtered.filter(user => user.role === selectedRole.value)
  }
  
  if (selectedStatus.value) {
    filtered = filtered.filter(user => user.status === selectedStatus.value)
  }
  
  return filtered
})

const viewUserDetail = (user) => {
  selectedUser.value = user
  showUserModal.value = true
}

const updateUserStatus = async (userId, newStatus) => {
  try {
    const userIndex = users.value.findIndex(user => user.id === userId)
    if (userIndex !== -1) {
      users.value[userIndex].status = newStatus
      alert(`Đã cập nhật trạng thái người dùng thành ${getStatusLabel(newStatus)}`)
    }
  } catch (error) {
    console.error('Error updating user status:', error)
    alert('Có lỗi xảy ra khi cập nhật trạng thái')
  }
}

const updateUserRole = async (userId, newRole) => {
  try {
    const userIndex = users.value.findIndex(user => user.id === userId)
    if (userIndex !== -1) {
      users.value[userIndex].role = newRole
      alert(`Đã cập nhật vai trò người dùng thành ${getRoleLabel(newRole)}`)
    }
  } catch (error) {
    console.error('Error updating user role:', error)
    alert('Có lỗi xảy ra khi cập nhật vai trò')
  }
}

const getRoleLabel = (role) => {
  const roleObj = userRoles.value.find(r => r.value === role)
  return roleObj ? roleObj.label : role
}

const getRoleColor = (role) => {
  const roleObj = userRoles.value.find(r => r.value === role)
  return roleObj ? roleObj.color : 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status) => {
  const statusObj = userStatuses.value.find(s => s.value === status)
  return statusObj ? statusObj.label : status
}

const getStatusColor = (status) => {
  const statusObj = userStatuses.value.find(s => s.value === status)
  return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800'
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('vi-VN')
}

const exportUsers = () => {
  alert('Tính năng xuất danh sách người dùng đang được phát triển')
}

const closeModal = () => {
  showUserModal.value = false
  selectedUser.value = null
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <router-link to="/admin" class="text-indigo-600 hover:text-indigo-700 mr-4">
              ← Dashboard
            </router-link>
            <h1 class="text-2xl font-bold text-gray-900">👥 Quản lý người dùng</h1>
          </div>
          
          <button @click="exportUsers"
                  class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
            📊 Xuất danh sách
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <span class="text-xl">👤</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Tổng người dùng</p>
              <p class="text-2xl font-bold text-gray-900">{{ users.length }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <span class="text-xl">✅</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Hoạt động</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ users.filter(u => u.status === 'active').length }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <span class="text-xl">👑</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Quản trị viên</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ users.filter(u => u.role === 'admin').length }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <span class="text-xl">🆕</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Mới tuần này</p>
              <p class="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <input v-model="searchTerm"
                   type="text"
                   placeholder="Tên, email, số điện thoại..."
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          
          <!-- Role Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
            <select v-model="selectedRole"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">Tất cả vai trò</option>
              <option v-for="role in userRoles" :key="role.value" :value="role.value">
                {{ role.label }}
              </option>
            </select>
          </div>
          
          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select v-model="selectedStatus"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">Tất cả trạng thái</option>
              <option v-for="status in userStatuses" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>
          
          <!-- Actions -->
          <div class="flex items-end">
            <button @click="loadUsers"
                    class="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">
              🔄 Làm mới
            </button>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <span class="ml-2 text-gray-600">Đang tải...</span>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thống kê
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lần cuối online
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
                <!-- User Info -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img :src="user.avatar" :alt="user.name"
                         class="h-10 w-10 rounded-full">
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                      <div class="text-sm text-gray-500">ID: {{ user.id }}</div>
                    </div>
                  </div>
                </td>
                
                <!-- Contact Info -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ user.email }}</div>
                  <div class="text-sm text-gray-500">{{ user.phone }}</div>
                </td>
                
                <!-- Role -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <select :value="user.role" 
                          @change="updateUserRole(user.id, $event.target.value)"
                          :class="`text-sm rounded-full px-2 py-1 font-semibold ${getRoleColor(user.role)}`">
                    <option v-for="role in userRoles" :key="role.value" :value="role.value">
                      {{ role.label }}
                    </option>
                  </select>
                </td>
                
                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <select :value="user.status" 
                          @change="updateUserStatus(user.id, $event.target.value)"
                          :class="`text-sm rounded-full px-2 py-1 font-semibold ${getStatusColor(user.status)}`">
                    <option v-for="status in userStatuses" :key="status.value" :value="status.value">
                      {{ status.label }}
                    </option>
                  </select>
                </td>
                
                <!-- Stats -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>{{ user.totalOrders }} đơn hàng</div>
                  <div class="text-gray-500">{{ formatCurrency(user.totalSpent) }}</div>
                </td>
                
                <!-- Last Login -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(user.lastLogin) }}
                </td>
                
                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click="viewUserDetail(user)"
                          class="text-indigo-600 hover:text-indigo-900">
                    Chi tiết
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Empty State -->
          <div v-if="filteredUsers.length === 0" class="text-center py-12">
            <div class="text-gray-400 text-lg mb-2">👥</div>
            <div class="text-gray-500">Không tìm thấy người dùng nào</div>
          </div>
        </div>
      </div>
    </main>

    <!-- User Detail Modal -->
    <div v-if="showUserModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <!-- Modal Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Chi tiết người dùng</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <span class="text-xl">×</span>
            </button>
          </div>
          
          <!-- User Info -->
          <div v-if="selectedUser" class="space-y-4">
            <div class="text-center">
              <img :src="selectedUser.avatar" :alt="selectedUser.name"
                   class="h-20 w-20 rounded-full mx-auto mb-3">
              <h4 class="text-lg font-semibold text-gray-900">{{ selectedUser.name }}</h4>
              <p class="text-gray-600">{{ selectedUser.email }}</p>
            </div>
            
            <div class="border-t border-gray-200 pt-4 space-y-3">
              <div>
                <span class="text-sm font-medium text-gray-500">Số điện thoại:</span>
                <span class="ml-2 text-sm text-gray-900">{{ selectedUser.phone }}</span>
              </div>
              
              <div>
                <span class="text-sm font-medium text-gray-500">Vai trò:</span>
                <span :class="`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser.role)}`">
                  {{ getRoleLabel(selectedUser.role) }}
                </span>
              </div>
              
              <div>
                <span class="text-sm font-medium text-gray-500">Trạng thái:</span>
                <span :class="`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.status)}`">
                  {{ getStatusLabel(selectedUser.status) }}
                </span>
              </div>
              
              <div>
                <span class="text-sm font-medium text-gray-500">Ngày tham gia:</span>
                <span class="ml-2 text-sm text-gray-900">{{ formatDate(selectedUser.joinDate) }}</span>
              </div>
              
              <div>
                <span class="text-sm font-medium text-gray-500">Lần cuối online:</span>
                <span class="ml-2 text-sm text-gray-900">{{ formatDate(selectedUser.lastLogin) }}</span>
              </div>
              
              <div>
                <span class="text-sm font-medium text-gray-500">Tổng đơn hàng:</span>
                <span class="ml-2 text-sm text-gray-900">{{ selectedUser.totalOrders }}</span>
              </div>
              
              <div>
                <span class="text-sm font-medium text-gray-500">Tổng chi tiêu:</span>
                <span class="ml-2 text-sm text-gray-900">{{ formatCurrency(selectedUser.totalSpent) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Modal Actions -->
          <div class="flex items-center justify-end mt-6">
            <button @click="closeModal"
                    class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.router-link-active {
  @apply text-indigo-600;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import ModernStatsCard from '@/components/admin/ModernStatsCard.vue'

const router = useRouter()
const authStore = useAuthStore()

const users = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedRole = ref('all')
const selectedStatus = ref('all')

const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  newUsersThisMonth: 0
})

const roles = ref([
  { id: 'all', name: 'Tất cả vai trò' },
  { id: 'user', name: 'Khách hàng' },
  { id: 'admin', name: 'Quản trị viên' },
  { id: 'moderator', name: 'Điều hành viên' }
])

const statuses = ref([
  { id: 'all', name: 'Tất cả trạng thái' },
  { id: 'active', name: 'Hoạt động' },
  { id: 'inactive', name: 'Không hoạt động' },
  { id: 'banned', name: 'Bị khóa' }
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
    
    // Mock data - replace with real API calls
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    users.value = [
      {
        id: 1,
        name: 'Nguyễn Văn An',
        email: 'nguyenvanan@gmail.com',
        phone: '0901234567',
        role: 'user',
        status: 'active',
        avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+An&background=random',
        joinDate: '2025-08-15',
        lastLogin: '2025-10-01',
        totalOrders: 12,
        totalSpent: 15600000
      },
      {
        id: 2,
        name: 'Trần Thị Bình',
        email: 'tranthibinh@gmail.com',
        phone: '0902345678',
        role: 'user',
        status: 'active',
        avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+Binh&background=random',
        joinDate: '2025-07-20',
        lastLogin: '2025-09-30',
        totalOrders: 8,
        totalSpent: 9800000
      },
      {
        id: 3,
        name: 'Lê Văn Cường',
        email: 'levancuong@gmail.com',
        phone: '0903456789',
        role: 'moderator',
        status: 'active',
        avatar: 'https://ui-avatars.com/api/?name=Le+Van+Cuong&background=random',
        joinDate: '2025-06-10',
        lastLogin: '2025-10-02',
        totalOrders: 3,
        totalSpent: 2400000
      },
      {
        id: 4,
        name: 'Phạm Thị Dung',
        email: 'phamthidung@gmail.com',
        phone: '0904567890',
        role: 'user',
        status: 'inactive',
        avatar: 'https://ui-avatars.com/api/?name=Pham+Thi+Dung&background=random',
        joinDate: '2025-05-05',
        lastLogin: '2025-08-15',
        totalOrders: 5,
        totalSpent: 3200000
      },
      {
        id: 5,
        name: 'Hoàng Văn Em',
        email: 'hoangvanem@gmail.com',
        phone: '0905678901',
        role: 'user',
        status: 'banned',
        avatar: 'https://ui-avatars.com/api/?name=Hoang+Van+Em&background=random',
        joinDate: '2025-04-12',
        lastLogin: '2025-07-20',
        totalOrders: 1,
        totalSpent: 500000
      }
    ]
    
    stats.value = {
      totalUsers: users.value.length,
      activeUsers: users.value.filter(u => u.status === 'active').length,
      inactiveUsers: users.value.filter(u => u.status === 'inactive').length,
      newUsersThisMonth: users.value.filter(u => new Date(u.joinDate) >= new Date('2025-10-01')).length
    }
    
  } catch (error) {
    console.error('Error loading users:', error)
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN')
}

const getStatusColor = (status) => {
  const colors = {
    active: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    inactive: 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
    banned: 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
  }
  return colors[status] || 'text-gray-700 bg-gray-100'
}

const getStatusText = (status) => {
  const statusText = {
    active: 'Hoạt động',
    inactive: 'Không hoạt động',
    banned: 'Bị khóa'
  }
  return statusText[status] || status
}

const getRoleColor = (role) => {
  const colors = {
    admin: 'text-purple-700 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
    moderator: 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
    user: 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30'
  }
  return colors[role] || 'text-gray-700 bg-gray-100'
}

const getRoleText = (role) => {
  const roleText = {
    admin: 'Quản trị',
    moderator: 'Điều hành',
    user: 'Khách hàng'
  }
  return roleText[role] || role
}

const addUser = () => {
  // Open add user modal or navigate to add user page
  alert('Chức năng thêm người dùng sẽ được phát triển trong phiên bản tiếp theo!')
}

const editUser = (user) => {
  console.log('Edit user:', user.id)
  // Open edit user modal or navigate to edit user page
  alert(`Chức năng chỉnh sửa người dùng "${user.name}" sẽ được phát triển trong phiên bản tiếp theo!`)
}

const deleteUser = async (user) => {
  if (confirm(`Bạn có chắc muốn xóa người dùng "${user.name}"?\nHành động này không thể hoàn tác!`)) {
    try {
      loading.value = true
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Remove from local array
      const index = users.value.findIndex(u => u.id === user.id)
      if (index > -1) {
        users.value.splice(index, 1)
      }
      
      // Update stats
      stats.value = {
        totalUsers: users.value.length,
        activeUsers: users.value.filter(u => u.status === 'active').length,
        inactiveUsers: users.value.filter(u => u.status === 'inactive').length,
        newUsersThisMonth: users.value.filter(u => new Date(u.joinDate) >= new Date('2025-10-01')).length
      }
      
      alert(`Đã xóa người dùng "${user.name}" thành công!`)
      
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Có lỗi xảy ra khi xóa người dùng!')
    } finally {
      loading.value = false
    }
  }
}

const banUser = (user) => {
  if (confirm(`Bạn có chắc muốn khóa tài khoản "${user.name}"?\nNgười dùng sẽ không thể đăng nhập vào hệ thống.`)) {
    user.status = 'banned'
    
    // Update stats
    stats.value = {
      totalUsers: users.value.length,
      activeUsers: users.value.filter(u => u.status === 'active').length,
      inactiveUsers: users.value.filter(u => u.status === 'inactive').length,
      newUsersThisMonth: users.value.filter(u => new Date(u.joinDate) >= new Date('2025-10-01')).length
    }
    
    alert(`Đã khóa tài khoản "${user.name}" thành công!`)
  }
}

const unbanUser = (user) => {
  if (confirm(`Bạn có chắc muốn mở khóa tài khoản "${user.name}"?\nNgười dùng sẽ có thể đăng nhập trở lại.`)) {
    user.status = 'active'
    
    // Update stats
    stats.value = {
      totalUsers: users.value.length,
      activeUsers: users.value.filter(u => u.status === 'active').length,
      inactiveUsers: users.value.filter(u => u.status === 'inactive').length,
      newUsersThisMonth: users.value.filter(u => new Date(u.joinDate) >= new Date('2025-10-01')).length
    }
    
    alert(`Đã mở khóa tài khoản "${user.name}" thành công!`)
  }
}

const viewUserDetails = (user) => {
  console.log('View user details:', user.id)
  alert(`Xem chi tiết người dùng "${user.name}":\n\nEmail: ${user.email}\nPhone: ${user.phone}\nTổng đơn hàng: ${user.totalOrders}\nTổng chi tiêu: ${formatCurrency(user.totalSpent)}\nTham gia: ${formatDate(user.joinDate)}\nĐăng nhập cuối: ${formatDate(user.lastLogin)}`)
}

const resetPassword = (user) => {
  if (confirm(`Bạn có chắc muốn reset mật khẩu cho "${user.name}"?\nMật khẩu mới sỽ được gửi qua email.`)) {
    console.log('Reset password for user:', user.id)
    alert(`Đã gửi email reset mật khẩu cho "${user.name}" thành công!`)
  }
}
</script>

<template>
  <AdminLayout>
    <div class="space-y-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatsCard 
          title="Tổng người dùng"
          :value="stats.totalUsers"
          icon="fas fa-users"
          gradient="from-blue-500 to-cyan-500"
          :loading="loading"
        />
        
        <ModernStatsCard 
          title="Đang hoạt động"
          :value="stats.activeUsers"
          icon="fas fa-user-check"
          gradient="from-green-500 to-emerald-500"
          :loading="loading"
        />
        
        <ModernStatsCard 
          title="Không hoạt động"
          :value="stats.inactiveUsers"
          icon="fas fa-user-clock"
          gradient="from-yellow-500 to-orange-500"
          :loading="loading"
        />
        
        <ModernStatsCard 
          title="Mới tháng này"
          :value="stats.newUsersThisMonth"
          icon="fas fa-user-plus"
          gradient="from-purple-500 to-pink-500"
          :loading="loading"
        />
      </div>

      <!-- Users Table -->
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-xl">
                <i class="fas fa-users"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-800 dark:text-white">Quản lý người dùng</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Danh sách tất cả người dùng trong hệ thống</p>
              </div>
            </div>
            
            <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <!-- Add User Button -->
              <button
                @click="addUser"
                class="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <i class="fas fa-user-plus mr-2"></i>
                Thêm người dùng
              </button>
              
              <!-- Search -->
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Tìm kiếm người dùng..."
                  class="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                >
                <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <!-- Role Filter -->
              <select
                v-model="selectedRole"
                class="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              >
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </option>
              </select>
              
              <!-- Status Filter -->
              <select
                v-model="selectedStatus"
                class="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              >
                <option v-for="status in statuses" :key="status.id" :value="status.id">
                  {{ status.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Table Content -->
        <div class="overflow-x-auto">
          <!-- Loading State -->
          <div v-if="loading" class="p-8">
            <div class="animate-pulse space-y-4">
              <div v-for="i in 5" :key="i" class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
                <div class="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div class="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>

          <!-- Users Table -->
          <table v-else class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Người dùng
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vai trò
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Đơn hàng
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tổng chi tiêu
                </th>
                <th class="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr 
                v-for="user in users" 
                :key="user.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
              >
                <!-- User Info -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-4">
                    <img
                      class="w-12 h-12 rounded-full ring-2 ring-purple-500/20"
                      :src="user.avatar"
                      :alt="user.name"
                    >
                    <div>
                      <div class="text-sm font-semibold text-gray-900 dark:text-white">
                        {{ user.name }}
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        Tham gia: {{ formatDate(user.joinDate) }}
                      </div>
                    </div>
                  </div>
                </td>
                
                <!-- Contact Info -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ user.email }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ user.phone }}
                  </div>
                </td>
                
                <!-- Role -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`">
                    {{ getRoleText(user.role) }}
                  </span>
                </td>
                
                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`">
                    {{ getStatusText(user.status) }}
                  </span>
                </td>
                
                <!-- Orders -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ user.totalOrders }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    đơn hàng
                  </div>
                </td>
                
                <!-- Total Spent -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ formatCurrency(user.totalSpent) }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    Đăng nhập: {{ formatDate(user.lastLogin) }}
                  </div>
                </td>
                
                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="viewUserDetails(user)"
                      class="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                      title="Xem chi tiết"
                    >
                      <i class="fas fa-eye w-4 h-4"></i>
                    </button>
                    
                    <button
                      @click="editUser(user)"
                      class="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <i class="fas fa-edit w-4 h-4"></i>
                    </button>
                    
                    <button
                      @click="resetPassword(user)"
                      class="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                      title="Reset mật khẩu"
                    >
                      <i class="fas fa-key w-4 h-4"></i>
                    </button>
                    
                    <button
                      @click="deleteUser(user)"
                      class="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                      title="Xóa người dùng"
                    >
                      <i class="fas fa-trash w-4 h-4"></i>
                    </button>
                    
                    <button
                      v-if="user.status !== 'banned'"
                      @click="banUser(user)"
                      class="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                      title="Khóa tài khoản"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                      </svg>
                    </button>
                    
                    <button
                      v-else
                      @click="unbanUser(user)"
                      class="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors"
                      title="Mở khóa tài khoản"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Hiển thị <span class="font-semibold">1-{{ users.length }}</span> của <span class="font-semibold">{{ users.length }}</span> người dùng
            </div>
            
            <div class="flex items-center space-x-2">
              <button class="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
                Trước
              </button>
              <button class="px-3 py-1 text-sm bg-purple-500 text-white rounded-lg">
                1
              </button>
              <button class="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
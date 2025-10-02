<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  gradient: {
    type: String,
    default: 'from-blue-500 to-purple-600'
  },
  trend: {
    type: String,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  isCurrency: {
    type: Boolean,
    default: false
  }
})

const formatValue = (value) => {
  if (props.loading) return '---'
  if (props.isCurrency) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value)
  }
  return value.toLocaleString()
}

const getTrendColor = (trend) => {
  if (!trend) return ''
  return trend.startsWith('+') ? 'text-green-500' : 'text-red-500'
}
</script>

<template>
  <div class="group relative overflow-hidden">
    <!-- Background with glassmorphism -->
    <div class="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl group-hover:shadow-2xl transition-all duration-300"></div>
    
    <!-- Gradient overlay -->
    <div :class="`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`"></div>
    
    <!-- Content -->
    <div class="relative p-6">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {{ title }}
          </p>
          <div class="flex items-baseline space-x-2">
            <p class="text-3xl font-bold text-gray-900 dark:text-white transition-all duration-300 group-hover:scale-105">
              <span v-if="loading" class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-8 w-20 inline-block"></span>
              <span v-else>{{ formatValue(value) }}</span>
            </p>
            <span v-if="trend && !loading" :class="`text-sm font-semibold ${getTrendColor(trend)}`">
              {{ trend }}
            </span>
          </div>
        </div>
        
        <!-- Icon with gradient background -->
        <div :class="`w-14 h-14 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center text-white text-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`">
          <i v-if="icon.startsWith('fas')" :class="icon"></i>
          <span v-else>{{ icon }}</span>
        </div>
      </div>
      
      <!-- Progress bar animation -->
      <div class="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div :class="`h-full bg-gradient-to-r ${gradient} transform origin-left transition-transform duration-1000 ${loading ? 'scale-x-0' : 'scale-x-100'}`"></div>
      </div>
    </div>
  </div>
</template>
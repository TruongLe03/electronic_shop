<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  showViewAll: {
    type: Boolean,
    default: true
  },
  viewAllLink: {
    type: String,
    default: '#'
  }
})
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100">
    <div class="p-6 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
        <router-link 
          v-if="showViewAll"
          :to="viewAllLink" 
          class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          Xem tất cả →
        </router-link>
      </div>
    </div>
    
    <div class="p-6">
      <slot />
    </div>
  </div>
</template>

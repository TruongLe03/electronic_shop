<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  to: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'blue'
  }
})

const colorClasses = {
  blue: 'bg-blue-100',
  green: 'bg-green-100',
  yellow: 'bg-yellow-100',
  purple: 'bg-purple-100',
  red: 'bg-red-100'
}
</script>

<template>
  <router-link 
    :to="to"
    class="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div :class="`p-2 rounded-lg mr-3 ${colorClasses[color]}`">
      <span class="text-xl">{{ icon }}</span>
    </div>
    <div>
      <p class="font-medium text-gray-900">{{ title }}</p>
      <p class="text-sm text-gray-600">{{ description }}</p>
    </div>
  </router-link>
</template>

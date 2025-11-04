<template>
  <div>
    <!-- Vùng đánh giá sao -->
    <div class="flex items-center">
      <div class="flex items-center space-x-1">
        <button
          v-for="star in 5"
          :key="star"
          type="button"
          @click="setRating(star)"
          @mouseover="hoverRating = star"
          @mouseleave="hoverRating = 0"
          class="focus:outline-none transform transition-transform duration-200 hover:scale-110"
          :class="{ 'scale-110': activeStars >= star }"
        >
          <svg
            class="w-6 h-6 transition-colors duration-200"
            :class="activeStars >= star ? 'text-yellow-400' : 'text-gray-300'"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        </button>
      </div>

      <!-- Hiển thị số sao -->
      <span v-if="showRating && modelValue" class="ml-2 text-sm text-gray-600">
        {{ modelValue }} sao
      </span>
    </div>

    <!-- Hiển thị lỗi -->
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
  error: {
    type: String,
    default: "",
  },
  showRating: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const hoverRating = ref(0);

// Tính toán giá trị sao đang được highlight (hover hoặc đã chọn)
const activeStars = computed(() => hoverRating.value || props.modelValue);

// Cập nhật giá trị khi người dùng chọn sao
const setRating = (rating) => {
  emit("update:modelValue", rating);
};
</script>

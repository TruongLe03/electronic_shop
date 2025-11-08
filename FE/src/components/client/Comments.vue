<template>
  <div class="space-y-8">
    <!-- Comment Input -->
    <div
      v-if="isAuthenticated"
      class="bg-white rounded-lg p-6 shadow-sm space-y-4"
    >
      <div class="flex items-start space-x-4">
        <img
          :src="userAvatar || '/assets/images/default-avatar.png'"
          :alt="userName"
          class="w-10 h-10 rounded-full object-cover"
        />

        <div class="flex-grow">
          <textarea
            v-model="newComment"
            rows="3"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Viết bình luận của bạn..."
            :disabled="loading"
          ></textarea>

          <div class="mt-2 flex justify-end">
            <button
              @click="submitComment"
              :disabled="loading || !newComment.trim()"
              class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <div class="flex items-center space-x-2">
                <svg
                  v-if="loading"
                  class="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                      5.291A7.962 7.962 0 014 12H0c0 
                      3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>{{ loading ? "Đang gửi..." : "Gửi bình luận" }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Login Prompt -->
    <div v-else class="bg-indigo-50 rounded-lg p-6 text-center">
      <p class="text-indigo-700">
        Vui lòng
        <a @click.prevent="goToLogin" href="#" class="font-medium underline">
          đăng nhập
        </a>
        để bình luận
      </p>
    </div>

    <!-- Comments List -->
    <template v-if="comments.length > 0">
      <div
        v-for="comment in comments"
        :key="comment._id"
        class="bg-white rounded-lg p-6 shadow-sm"
      >
        <div class="flex items-start space-x-4">
          <img
            :src="comment.userId?.avatar || '/assets/images/default-avatar.png'"
            :alt="comment.userId?.name || 'Người dùng'"
            class="w-10 h-10 rounded-full object-cover"
          />

          <div class="flex-grow">
            <div class="flex items-center justify-between">
              <h4 class="font-medium text-gray-900">
                {{ comment.userId?.name || 'Người dùng' }}
              </h4>
              <span class="text-sm text-gray-500">
                {{ formatDate(comment.createdAt) }}
              </span>
            </div>

            <p class="mt-2 text-gray-700">{{ comment.content }}</p>

            <!-- Actions -->
            <div class="mt-3 flex items-center space-x-4">
              <button
                @click="() => { if (!isAuthenticated.value) return goToLogin(); toggleLike(comment) }"
                :class="isLiked(comment) ? 'text-red-600' : 'text-gray-500 hover:text-indigo-600'"
                class="text-sm flex items-center space-x-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.54 0 3.04.99 3.57 2.36h1.87C13.46 4.99 14.96 4 16.5 4 19 4 21 6 21 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span>{{ comment.likes || 0 }}</span>
              </button>

              <button
                @click="toggleReplyForm(comment._id)"
                class="text-sm text-gray-500 hover:text-indigo-600"
              >
                Trả lời
              </button>

              <template v-if="comment.userId?._id === currentUserId">
                <button
                  @click="startEdit(comment)"
                  class="text-sm text-gray-500 hover:text-indigo-600"
                >
                  Sửa
                </button>
                <button
                  @click="deleteComment(comment._id)"
                  class="text-sm text-gray-500 hover:text-red-600"
                >
                  Xóa
                </button>
              </template>
            </div>

            <!-- Edit Form -->
            <template v-if="editingComment?._id === comment._id">
              <div class="mt-4">
                  <textarea
                    v-model="editingContent"
                    rows="2"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  ></textarea>
                <div class="mt-2 flex space-x-2">
                  <button
                    @click="updateComment"
                    class="px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Lưu
                  </button>
                  <button
                    @click="cancelEdit"
                    class="px-4 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </template>

            <!-- Reply Form -->
            <template v-if="replyingTo === comment._id">
              <div class="mt-4">
                <textarea
                  v-model="replyContent"
                  rows="2"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Viết phản hồi của bạn..."
                ></textarea>
                <div class="mt-2 flex space-x-2">
                  <button
                    @click="submitReply(comment._id)"
                    :disabled="!replyContent.trim()"
                    class="px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
                  >
                    Gửi
                  </button>
                  <button
                    @click="cancelReply"
                    class="px-4 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </template>

            <!-- Replies -->
            <div v-if="comment.replies?.length" class="mt-4 ml-6 space-y-4">
              <div
                v-for="reply in comment.replies"
                :key="reply._id"
                class="bg-gray-50 rounded-lg p-4"
              >
                <div class="flex items-start space-x-3">
                  <img
                    :src="reply.userId?.avatar || '/assets/images/default-avatar.png'"
                    :alt="reply.userId?.name || 'Người dùng'"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <div class="flex-grow">
                    <div class="flex items-center justify-between">
                      <h5 class="font-medium text-gray-900">
                        {{ reply.userId?.name || 'Người dùng' }}
                      </h5>
                      <span class="text-sm text-gray-500">
                        {{ formatDate(reply.createdAt) }}
                      </span>
                    </div>
                    <p class="mt-1 text-gray-700">{{ reply.content }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Empty -->
    <div v-else-if="!loading" class="text-center py-12 bg-gray-50 rounded-lg">
      <div
        class="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center"
      >
        <svg
          class="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 
              12c0 4.418-4.03 8-9 
              8a9.863 9.863 0 
              01-4.255-.949L3 
              20l1.395-3.72C3.512 
              15.042 3 13.574 3 
              12c0-4.418 4.03-8 
              9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <p class="text-gray-600">
        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
      </p>
    </div>

    <!-- Pagination -->
    <nav v-if="totalPages > 1" class="flex justify-center mt-8 space-x-2">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="changePage(page)"
        class="px-4 py-2 rounded-lg"
        :class="
          currentPage === page
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        "
      >
        {{ page }}
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { commentService } from "@/api/commentService";
import { useAuthStore } from "@/stores/auth";
import { useNotification } from "@/composables/client/useNotification";
const props = defineProps({ productId: { type: String, required: true } });

const router = useRouter();
const authStore = useAuthStore();
const { showSuccess, showError } = useNotification();

const comments = ref([]);
const loading = ref(true); // Start with loading state
const newComment = ref("");
const replyingTo = ref(null);
const replyContent = ref("");
const editingComment = ref(null);
// Separate ref for edit textarea content to avoid template binding to a possibly null object
const editingContent = ref("");
const currentPage = ref(1);
const totalPages = ref(1);

import { io } from 'socket.io-client';

const isAuthenticated = computed(() => authStore.isAuthenticated);
const currentUserId = computed(() => authStore.user?._id);
const userName = computed(() => authStore.user?.name);
const userAvatar = computed(() => authStore.user?.avatar);

const loadComments = async (page = 1) => {
  try {
    loading.value = true;
    const res = await commentService.getProductComments(props.productId, page);
    // Backend responses are wrapped: { success, message, data }
    const payload = res.data?.data || res.data;
    comments.value = payload?.comments || payload || [];
    currentPage.value = payload?.pagination?.page || 1;
    totalPages.value = payload?.pagination?.totalPages || 1;
  } catch (error) {
    console.error('Error loading comments:', error);
    showError("Không thể tải bình luận");
    comments.value = [];
  } finally {
    loading.value = false;
  }
};

// Socket.IO client for realtime updates
const socket = io('http://localhost:5000');

// Helper to find and update a comment in comments array
const upsertComment = (updated) => {
  const index = comments.value.findIndex(c => c._id === updated._id);
  if (index === -1) {
    // new comment, add to top
    comments.value.unshift(updated);
  } else {
    comments.value[index] = { ...comments.value[index], ...updated };
  }
};

onMounted(() => {
  loadComments();
  // join product room
  socket.emit('joinProduct', props.productId);

  socket.on('comment:created', (comment) => {
    if (comment.productId === props.productId) upsertComment(comment);
  });

  socket.on('comment:updated', ({ _id, content }) => {
    const idx = comments.value.findIndex(c => c._id === _id);
    if (idx !== -1) comments.value[idx].content = content;
  });

  socket.on('comment:deleted', ({ _id }) => {
    comments.value = comments.value.filter(c => c._id !== _id);
  });

  socket.on('comment:liked', ({ _id, likes, likedBy }) => {
    const idx = comments.value.findIndex(c => c._id === _id);
    if (idx !== -1) {
      comments.value[idx].likes = likes;
      comments.value[idx].likedBy = likedBy;
    }
  });
});

onUnmounted(() => {
  try {
    socket.emit('leaveProduct', props.productId);
    socket.disconnect();
  } catch (e) {
    // ignore
  }
});

const submitComment = async () => {
  if (!newComment.value.trim()) return;
  try {
    loading.value = true;
    const res = await commentService.createComment({
      productId: props.productId,
      content: newComment.value.trim(),
    });
    const created = res.data?.data || res.data;
    if (created) {
      comments.value = [created, ...comments.value];
      newComment.value = "";
      showSuccess("Đã đăng bình luận thành công");
    }
  } catch (error) {
    console.error('Error submitting comment:', error);
    showError("Không thể đăng bình luận");
  } finally {
    loading.value = false;
  }
};

const toggleReplyForm = (id) => {
  if (!isAuthenticated.value) return goToLogin();
  replyingTo.value = replyingTo.value === id ? null : id;
  replyContent.value = "";
};

const submitReply = async (parentId) => {
  if (!replyContent.value.trim()) return;
  try {
    loading.value = true;
    const res = await commentService.createComment({
      productId: props.productId,
      content: replyContent.value.trim(),
      parentId,
    });
    const created = res.data?.data || res.data;
    const parent = comments.value.find((c) => c._id === parentId);
    if (parent) (parent.replies ||= []).push(created);
    replyContent.value = "";
    replyingTo.value = null;
    showSuccess("Đã gửi phản hồi thành công");
  } catch {
    showError("Không thể gửi phản hồi");
  } finally {
    loading.value = false;
  }
};

// Check if current user liked a comment
const isLiked = (comment) => {
  if (!currentUserId.value) return false;
  const likedBy = comment.likedBy || [];
  return likedBy.some(id => (id && id.toString ? id.toString() : id) === currentUserId.value.toString());
};

// Toggle like/unlike
const toggleLike = async (comment) => {
  if (!isAuthenticated.value) return goToLogin();
  try {
    if (isLiked(comment)) {
      await commentService.unlikeComment(comment._id);
      // optimistic update
      comment.likedBy = (comment.likedBy || []).filter(id => (id && id.toString ? id.toString() : id) !== currentUserId.value.toString());
      comment.likes = comment.likedBy.length;
    } else {
      await commentService.likeComment(comment._id);
      comment.likedBy = (comment.likedBy || []).concat([currentUserId.value]);
      comment.likes = comment.likedBy.length;
    }
  } catch (err) {
    console.error('Like toggle error', err);
  }
};

const startEdit = (c) => {
  editingComment.value = { ...c };
  editingContent.value = c.content || "";
};
const cancelEdit = () => {
  editingComment.value = null;
  editingContent.value = "";
};

const updateComment = async () => {
  if (!editingComment.value) return;
  const newContent = (editingContent.value || "").trim();
  if (!newContent) return;
  try {
    loading.value = true;
    await commentService.updateComment(editingComment.value._id, {
      content: newContent,
    });
    const index = comments.value.findIndex(
      (c) => c._id === editingComment.value._id
    );
    if (index !== -1)
      comments.value[index].content = newContent;
    editingComment.value = null;
    editingContent.value = "";
    showSuccess("Đã cập nhật bình luận");
  } catch {
    showError("Không thể cập nhật bình luận");
  } finally {
    loading.value = false;
  }
};

const deleteComment = async (id) => {
  if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
  try {
    loading.value = true;
    await commentService.deleteComment(id);
    comments.value = comments.value.filter((c) => c._id !== id);
    showSuccess("Đã xóa bình luận");
  } catch {
    showError("Không thể xóa bình luận");
  } finally {
    loading.value = false;
  }
};

const changePage = (page) => {
  if (page !== currentPage.value) loadComments(page);
};

const goToLogin = () => {
  localStorage.setItem("intendedRoute", router.currentRoute.value.fullPath);
  router.push("/login");
};

const formatDate = (dateStr) => {
  // Guard against missing/invalid dates to avoid RangeError: Invalid time value
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch (err) {
    // Fallback: return empty string on any formatting error
    return "";
  }
};

onMounted(() => loadComments());
</script>

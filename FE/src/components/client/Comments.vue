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
            :src="comment.userId.avatar || '/assets/images/default-avatar.png'"
            :alt="comment.userId.name"
            class="w-10 h-10 rounded-full object-cover"
          />

          <div class="flex-grow">
            <div class="flex items-center justify-between">
              <h4 class="font-medium text-gray-900">
                {{ comment.userId.name }}
              </h4>
              <span class="text-sm text-gray-500">
                {{ formatDate(comment.createdAt) }}
              </span>
            </div>

            <p class="mt-2 text-gray-700">{{ comment.content }}</p>

            <!-- Actions -->
            <div class="mt-3 flex items-center space-x-4">
              <button
                @click="toggleReplyForm(comment._id)"
                class="text-sm text-gray-500 hover:text-indigo-600"
              >
                Trả lời
              </button>

              <template v-if="comment.userId._id === currentUserId">
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
                  v-model="editingComment.content"
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
                    :src="
                      reply.userId.avatar || '/assets/images/default-avatar.png'
                    "
                    :alt="reply.userId.name"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <div class="flex-grow">
                    <div class="flex items-center justify-between">
                      <h5 class="font-medium text-gray-900">
                        {{ reply.userId.name }}
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
import { ref, onMounted, computed } from "vue";
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
const currentPage = ref(1);
const totalPages = ref(1);

const isAuthenticated = computed(() => authStore.isAuthenticated);
const currentUserId = computed(() => authStore.user?._id);
const userName = computed(() => authStore.user?.name);
const userAvatar = computed(() => authStore.user?.avatar);

async function loadComments(page = 1) {
  try {
    loading.value = true;
    const res = await commentService.getProductComments(props.productId, page);
    comments.value = res.data?.comments || [];
    currentPage.value = res.data?.pagination?.page || 1;
    totalPages.value = res.data?.pagination?.totalPages || 1;
  } catch (error) {
    console.error('Error loading comments:', error);
    showError("Không thể tải bình luận");
    comments.value = [];
  } finally {
    loading.value = false;
  }
}

async function submitComment() {
  if (!newComment.value.trim()) return;
  try {
    loading.value = true;
    const res = await commentService.createComment({
      productId: props.productId,
      content: newComment.value.trim(),
    });
    if (res.data) {
      comments.value = [res.data, ...comments.value];
      newComment.value = "";
      showSuccess("Đã đăng bình luận thành công");
    }
  } catch (error) {
    console.error('Error submitting comment:', error);
    showError("Không thể đăng bình luận");
  } finally {
    loading.value = false;
  }
}

function toggleReplyForm(id) {
  if (!isAuthenticated.value) return goToLogin();
  replyingTo.value = replyingTo.value === id ? null : id;
  replyContent.value = "";
}

async function submitReply(parentId) {
  if (!replyContent.value.trim()) return;
  try {
    loading.value = true;
    const res = await commentService.createComment({
      productId: props.productId,
      content: replyContent.value.trim(),
      parentId,
    });
    const parent = comments.value.find((c) => c._id === parentId);
    if (parent) (parent.replies ||= []).push(res.data);
    replyContent.value = "";
    replyingTo.value = null;
    showSuccess("Đã gửi phản hồi thành công");
  } catch {
    showError("Không thể gửi phản hồi");
  } finally {
    loading.value = false;
  }
}

function startEdit(c) {
  editingComment.value = { ...c };
}
function cancelEdit() {
  editingComment.value = null;
}

async function updateComment() {
  if (!editingComment.value?.content.trim()) return;
  try {
    loading.value = true;
    await commentService.updateComment(editingComment.value._id, {
      content: editingComment.value.content.trim(),
    });
    const index = comments.value.findIndex(
      (c) => c._id === editingComment.value._id
    );
    if (index !== -1)
      comments.value[index].content = editingComment.value.content;
    editingComment.value = null;
    showSuccess("Đã cập nhật bình luận");
  } catch {
    showError("Không thể cập nhật bình luận");
  } finally {
    loading.value = false;
  }
}

async function deleteComment(id) {
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
}

function changePage(page) {
  if (page !== currentPage.value) loadComments(page);
}

function goToLogin() {
  localStorage.setItem("intendedRoute", router.currentRoute.value.fullPath);
  router.push("/login");
}

function formatDate(dateStr) {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

onMounted(loadComments);
</script>

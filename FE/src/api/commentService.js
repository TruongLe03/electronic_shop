import axiosClient from '../utils/axiosConfig';

export const commentService = {
  // Get comments for a product
  getProductComments(productId, page = 1, limit = 10) {
    return axiosClient.get(`/comments/product/${productId}`, {
      params: { page, limit }
    });
  },

  // Create a new comment
  createComment(data) {
    return axiosClient.post('/comments', data);
  },

  // Update a comment
  updateComment(commentId, data) {
    return axiosClient.put(`/comments/${commentId}`, data);
  },

  // Delete a comment
  deleteComment(commentId) {
    return axiosClient.delete(`/comments/${commentId}`);
  }
,

  // Like a comment
  likeComment(commentId) {
    return axiosClient.post(`/comments/${commentId}/like`);
  },

  // Unlike a comment
  unlikeComment(commentId) {
    return axiosClient.post(`/comments/${commentId}/unlike`);
  }
};
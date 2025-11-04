import Comment from "../models/comments.model.js";
import Order from "../models/orders.model.js";
import { ResponseUtil } from "../utils/response.util.js";

export const commentController = {
  // Create a new comment or review
  async create(req, res) {
    try {
      const { productId, content, rating, parentId } = req.body;
      const userId = req.user._id;

      // If rating is provided, verify that user has purchased the product
      if (rating) {
        const hasOrderedProduct = await Order.findOne({
          userId,
          "items.productId": productId,
          status: "delivered", // Only delivered orders
        });

        if (!hasOrderedProduct) {
          return ResponseUtil.error(res, "Bạn cần mua và nhận sản phẩm trước khi đánh giá", 400);
        }
      }

      const comment = await Comment.create({
        productId,
        userId,
        content,
        rating,
        parentId,
        orderId: rating ? hasOrderedProduct._id : undefined,
      });

      // Populate user info
      await comment.populate("userId", "name avatar");

      return ResponseUtil.success(res, comment, "Đã đăng bình luận thành công");
    } catch (error) {
      console.error("Create comment error:", error);
      return ResponseUtil.error(res, "Lỗi khi tạo bình luận");
    }
  },

  // Get comments for a product
  async getByProduct(req, res) {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const skip = (page - 1) * limit;

      // Get parent comments first (no parentId)
      const comments = await Comment.find({
        productId,
        parentId: null,
        status: "active",
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name avatar")
        .lean();

      // Get replies for these comments
      const commentIds = comments.map(c => c._id);
      const replies = await Comment.find({
        parentId: { $in: commentIds },
        status: "active",
      })
        .populate("userId", "name avatar")
        .lean();

      // Organize replies under their parent comments
      const commentsWithReplies = comments.map(comment => ({
        ...comment,
        replies: replies.filter(r => r.parentId.toString() === comment._id.toString()),
      }));

      // Get total count for pagination
      const total = await Comment.countDocuments({
        productId,
        parentId: null,
        status: "active",
      });

      return ResponseUtil.success(res, {
        comments: commentsWithReplies,
        pagination: {
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get comments error:", error);
      return ResponseUtil.error(res, "Lỗi khi lấy bình luận");
    }
  },

  // Delete a comment (soft delete)
  async delete(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user._id;

      const comment = await Comment.findById(commentId);

      if (!comment) {
        return ResponseUtil.notFound(res, "Không tìm thấy bình luận");
      }

      if (comment.userId.toString() !== userId.toString()) {
        return ResponseUtil.forbidden(res, "Không có quyền xóa bình luận này");
      }

      comment.status = "deleted";
      await comment.save();

      return ResponseUtil.success(res, null, "Đã xóa bình luận");
    } catch (error) {
      console.error("Delete comment error:", error);
      return ResponseUtil.error(res, "Lỗi khi xóa bình luận");
    }
  },

  // Update a comment
  async update(req, res) {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const userId = req.user._id;

      const comment = await Comment.findById(commentId);

      if (!comment) {
        return ResponseUtil.notFound(res, "Không tìm thấy bình luận");
      }

      if (comment.userId.toString() !== userId.toString()) {
        return ResponseUtil.forbidden(res, "Không có quyền sửa bình luận này");
      }

      comment.content = content;
      await comment.save();

      return ResponseUtil.success(res, null, "Đã cập nhật bình luận");
    } catch (error) {
      console.error("Update comment error:", error);
      return ResponseUtil.error(res, "Lỗi khi cập nhật bình luận");
    }
  },
};
import Comment from "../models/comments.model.js";
import Order from "../models/orders.model.js";
import { ResponseUtil } from "../utils/response.util.js";

export const commentController = {
  // Create a new comment or review
  async create(req, res) {
    try {
      const { productId, content, rating, parentId } = req.body;
      const userId = req.user._id;

      // Use a single variable so it's available after branching
      let comment;

      // Determine if this request is a rating (review) or a plain comment
      const isRating = typeof rating !== "undefined" && rating !== null;

      if (isRating) {
        const hasOrderedProduct = await Order.findOne({
          user_id: userId,
          "products.product_id": productId,
          status: "delivered",
        });

        if (!hasOrderedProduct) {
          return ResponseUtil.error(
            res,
            "Bạn cần mua và nhận sản phẩm trước khi đánh giá",
            400
          );
        }

        // Prevent duplicate rating for the same order
        const existingRating = await Comment.findOne({
          userId,
          productId,
          orderId: hasOrderedProduct._id,
          rating: { $exists: true },
        });

        if (existingRating) {
          return ResponseUtil.error(
            res,
            "Bạn đã đánh giá sản phẩm này trong đơn hàng trước đó",
            400
          );
        }

        comment = await Comment.create({
          productId,
          userId,
          content,
          rating,
          parentId,
          orderId: hasOrderedProduct._id,
        });
      } else {
        // Plain comment: no order check required
        comment = await Comment.create({
          productId,
          userId,
          content,
          parentId,
        });
      }

      // Populate user info for the comment/review
      await comment.populate("userId", "name avatar");

      // Emit realtime event to product room if socket.io available
      try {
        const io = req.app.get("io");
        if (io) io.to(`product_${productId}`).emit("comment:created", comment);
      } catch (e) {
        console.warn("Socket emit failed:", e.message);
      }

      const successMessage = isRating
        ? "Đã đăng đánh giá thành công"
        : "Đã đăng bình luận thành công";
      return ResponseUtil.success(res, comment, successMessage);
    } catch (error) {
      console.error("Create comment error:", error);
      const isRating =
        typeof req.body.rating !== "undefined" && req.body.rating !== null;
      const errorMessage = isRating
        ? "Lỗi khi tạo đánh giá"
        : "Lỗi khi tạo bình luận";
      return ResponseUtil.error(res, errorMessage);
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
      const commentIds = comments.map((c) => c._id);
      const replies = await Comment.find({
        parentId: { $in: commentIds },
        status: "active",
      })
        .populate("userId", "name avatar")
        .lean();

      // Organize replies under their parent comments
      const commentsWithReplies = comments.map((comment) => ({
        ...comment,
        replies: replies.filter(
          (r) => r.parentId.toString() === comment._id.toString()
        ),
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

      // If comment has an owner, allow owner or admin to delete. If no owner, only admin can delete.
      const commentOwnerId = comment.userId ? comment.userId.toString() : null;
      if (commentOwnerId) {
        if (commentOwnerId !== userId.toString() && req.user.role !== "admin") {
          return ResponseUtil.forbidden(
            res,
            "Không có quyền xóa bình luận này"
          );
        }
      } else {
        if (req.user.role !== "admin") {
          return ResponseUtil.forbidden(
            res,
            "Không có quyền xóa bình luận này"
          );
        }
      }

      comment.status = "deleted";
      await comment.save();

      // Emit deleted event
      try {
        const io = req.app.get("io");
        if (io)
          io.to(`product_${comment.productId}`).emit("comment:deleted", {
            _id: comment._id,
          });
      } catch (e) {
        console.warn("Socket emit failed:", e.message);
      }

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

      // Only owner or admin may update. If no owner, only admin allowed.
      const commentOwnerId = comment.userId ? comment.userId.toString() : null;
      if (commentOwnerId) {
        if (commentOwnerId !== userId.toString() && req.user.role !== "admin") {
          return ResponseUtil.forbidden(
            res,
            "Không có quyền sửa bình luận này"
          );
        }
      } else {
        if (req.user.role !== "admin") {
          return ResponseUtil.forbidden(
            res,
            "Không có quyền sửa bình luận này"
          );
        }
      }

      comment.content = content;
      await comment.save();

      // Emit updated event
      try {
        const io = req.app.get("io");
        if (io)
          io.to(`product_${comment.productId}`).emit("comment:updated", {
            _id: comment._id,
            content: comment.content,
          });
      } catch (e) {
        console.warn("Socket emit failed:", e.message);
      }

      return ResponseUtil.success(res, null, "Đã cập nhật bình luận");
    } catch (error) {
      console.error("Update comment error:", error);
      return ResponseUtil.error(res, "Lỗi khi cập nhật bình luận");
    }
  },

  // Like a comment
  async like(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user._id;

      const comment = await Comment.findById(commentId);
      if (!comment)
        return ResponseUtil.notFound(res, "Không tìm thấy bình luận");

      if (
        comment.likedBy &&
        comment.likedBy.find((id) => id.toString() === userId.toString())
      ) {
        return ResponseUtil.error(res, "Bạn đã thích bình luận này", 400);
      }

      comment.likedBy = comment.likedBy || [];
      comment.likedBy.push(userId);
      comment.likes = comment.likedBy.length;
      await comment.save();

      // Emit like update
      try {
        const io = req.app.get("io");
        if (io)
          io.to(`product_${comment.productId}`).emit("comment:liked", {
            _id: comment._id,
            likes: comment.likes,
            likedBy: comment.likedBy,
          });
      } catch (e) {
        console.warn("Socket emit failed:", e.message);
      }

      return ResponseUtil.success(
        res,
        { _id: comment._id, likes: comment.likes },
        "Đã thích bình luận"
      );
    } catch (error) {
      console.error("Like comment error:", error);
      return ResponseUtil.error(res, "Lỗi khi thích bình luận");
    }
  },

  // Unlike a comment
  async unlike(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user._id;

      const comment = await Comment.findById(commentId);
      if (!comment)
        return ResponseUtil.notFound(res, "Không tìm thấy bình luận");

      comment.likedBy = (comment.likedBy || []).filter(
        (id) => id.toString() !== userId.toString()
      );
      comment.likes = comment.likedBy.length;
      await comment.save();

      // Emit unlike update
      try {
        const io = req.app.get("io");
        if (io)
          io.to(`product_${comment.productId}`).emit("comment:liked", {
            _id: comment._id,
            likes: comment.likes,
            likedBy: comment.likedBy,
          });
      } catch (e) {
        console.warn("Socket emit failed:", e.message);
      }

      return ResponseUtil.success(
        res,
        { _id: comment._id, likes: comment.likes },
        "Đã bỏ thích bình luận"
      );
    } catch (error) {
      console.error("Unlike comment error:", error);
      return ResponseUtil.error(res, "Lỗi khi bỏ thích bình luận");
    }
  },
};

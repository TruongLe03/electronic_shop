import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Optional: allow anonymous comments (not all comments are reviews)
      required: false,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false, // Optional, only for post-purchase reviews
    },
    content: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: false, // Optional, only for post-purchase reviews
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null, // For replies to comments
    },
    status: {
      type: String,
      enum: ["active", "hidden", "deleted"],
      default: "active",
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
commentSchema.index({ productId: 1, createdAt: -1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ parentId: 1 });

// Pre-save hook to update product rating
commentSchema.pre('save', async function(next) {
  try {
    // Only calculate rating for comments that have a rating (reviews)
    if (this.rating) {
      // Get all ratings for this product
      const Comment = this.constructor;
      const comments = await Comment.find({ 
        productId: this.productId,
        rating: { $exists: true, $ne: null },
        status: 'active'
      });

      // Calculate new average rating
      const ratings = comments.map(c => c.rating);
      if (!this.isNew) { // If updating, remove old rating
        const oldComment = await Comment.findById(this._id);
        if (oldComment && oldComment.rating) {
          const oldRatingIndex = ratings.indexOf(oldComment.rating);
          if (oldRatingIndex > -1) {
            ratings.splice(oldRatingIndex, 1);
          }
        }
      }
      ratings.push(this.rating);

      const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

      // Update product
      const Product = mongoose.model('Product');
      await Product.findByIdAndUpdate(this.productId, {
        rating: Number(averageRating.toFixed(1)),
        review_count: ratings.length
      });
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
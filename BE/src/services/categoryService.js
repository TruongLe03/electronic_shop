import Category from "../models/categories.model.js";

export class CategoryService {
  // Lấy tất cả danh mục
  static async getAllCategories(options = {}) {
    // Tạm thời không filter status để lấy tất cả categories
    const query = {};
    return await Category.find(query).sort({ name: 1 });
  }

  // Lấy danh mục theo ID
  static async getCategoryById(categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error("Không tìm thấy danh mục");
    }
    return category;
  }

  // Lấy subcategories của một category
  static async getSubcategories(parentId) {
    return await Category.find({ parent_id: parentId })
      .sort({ name: 1 });
  }

  // Tạo danh mục mới
  static async createCategory(categoryData) {
    // Kiểm tra slug đã tồn tại chưa
    if (categoryData.slug) {
      const existingCategory = await Category.findOne({ slug: categoryData.slug });
      if (existingCategory) {
        throw new Error("Slug danh mục đã tồn tại");
      }
    }

    const category = new Category({
      name: categoryData.name,
      slug: categoryData.slug,
      description: categoryData.description,
      parent_id: categoryData.parentId || null,
      image: categoryData.image
    });

    const saved = await category.save();
    
    // Populate parent information if exists
    return await Category.findById(saved._id)
      .populate('parent_id', 'name slug');
  }

  // Cập nhật danh mục
  static async updateCategory(categoryId, updateData) {
    // Kiểm tra slug mới nếu có
    if (updateData.slug) {
      const existingCategory = await Category.findOne({ 
        slug: updateData.slug,
        _id: { $ne: categoryId }
      });
      if (existingCategory) {
        throw new Error("Slug danh mục đã tồn tại");
      }
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      updateData,
      { new: true, runValidators: true }
    ).populate('parent_id', 'name slug');

    if (!category) {
      throw new Error("Không tìm thấy danh mục");
    }

    return category;
  }

  // Xóa danh mục
  static async deleteCategory(categoryId) {
    // Import Product model for checking
    const Product = (await import("../models/products.model.js")).default;
    
    // Kiểm tra có subcategories không
    const subcategories = await Category.countDocuments({ parent_id: categoryId });
    if (subcategories > 0) {
      throw new Error("Không thể xóa category có subcategories");
    }

    // Kiểm tra có sản phẩm trong category không
    const productsInCategory = await Product.countDocuments({ category_id: categoryId });
    if (productsInCategory > 0) {
      throw new Error(`Không thể xóa category có ${productsInCategory} sản phẩm`);
    }

    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
      throw new Error("Không tìm thấy danh mục");
    }

    return category;
  }

  // Lấy danh mục với số lượng sản phẩm
  static async getCategoriesWithProductCount() {
    return await Category.aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category_id',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      },
      {
        $project: {
          products: 0
        }
      },
      { $sort: { name: 1 } }
    ]);
  }
}
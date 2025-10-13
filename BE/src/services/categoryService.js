import Category from "../models/categories.model.js";
import Product from "../models/products.model.js";

export class CategoryService {
  // 🟢 Lấy tất cả danh mục (có thể thêm phân trang, tìm kiếm, filter)
  static async getAllCategories(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = "",
      parent_id = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const query = {};
    if (search && search.trim() !== "") {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (parent_id) {
      if (parent_id === "null" || parent_id === "root") query.parent_id = null;
      else query.parent_id = parent_id;
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      Category.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "category_id",
            as: "products",
          },
        },
        {
          $addFields: {
            productCount: { $size: "$products" },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "parent_id",
            foreignField: "_id",
            as: "parent_category",
          },
        },
        {
          $addFields: {
            parent_id: { 
              $cond: {
                if: { $eq: [{ $size: "$parent_category" }, 0] },
                then: null,
                else: { 
                  $arrayElemAt: [
                    {
                      $map: {
                        input: "$parent_category",
                        as: "parent",
                        in: {
                          _id: "$$parent._id",
                          name: "$$parent.name",
                          slug: "$$parent.slug"
                        }
                      }
                    }, 0
                  ]
                }
              }
            }
          },
        },
        {
          $project: {
            products: 0,
            parent_category: 0,
          },
        },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
      ]),
      Category.countDocuments(query),
    ]);

    return {
      categories,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  // 🟢 Lấy danh mục theo ID
  static async getCategoryById(categoryId) {
    const category = await Category.findById(categoryId).populate(
      "parent_id",
      "name slug"
    );
    if (!category) throw new Error("Không tìm thấy danh mục");
    return category;
  }

  // 🟢 Lấy danh mục con (subcategories)
  static async getSubcategories(parentId) {
    return await Category.find({ parent_id: parentId }).sort({ name: 1 });
  }

  // 🟢 Tạo danh mục mới
  static async createCategory(categoryData) {
    if (categoryData.slug) {
      const existingCategory = await Category.findOne({
        slug: categoryData.slug,
      });
      if (existingCategory) throw new Error("Slug danh mục đã tồn tại");
    }

    const category = new Category({
      name: categoryData.name,
      slug: categoryData.slug,
      description: categoryData.description,
      parent_id: categoryData.parent_id || null,
      image: categoryData.image,
    });

    const saved = await category.save();
    return await Category.findById(saved._id).populate(
      "parent_id",
      "name slug"
    );
  }

  // 🟢 Cập nhật danh mục
  static async updateCategory(categoryId, updateData) {
    try {
      console.log('🔄 Updating category:', categoryId, updateData);

      // Kiểm tra slug trùng lặp
      if (updateData.slug) {
        const existingCategory = await Category.findOne({
          slug: updateData.slug,
          _id: { $ne: categoryId },
        });
        if (existingCategory) {
          console.log('❌ Slug already exists:', updateData.slug);
          throw new Error("Slug danh mục đã tồn tại");
        }
      }

      // Kiểm tra tên trùng lặp
      if (updateData.name) {
        const existingName = await Category.findOne({
          name: updateData.name,
          _id: { $ne: categoryId },
        });
        if (existingName) {
          console.log('❌ Name already exists:', updateData.name);
          throw new Error("Tên danh mục đã tồn tại");
        }
      }

      // Xử lý parent_id: nếu là empty string thì set thành null
      if (updateData.parent_id === '' || updateData.parent_id === 'null') {
        updateData.parent_id = null;
      }

      console.log('🔄 Final updateData:', updateData);

    const category = await Category.findByIdAndUpdate(categoryId, updateData, {
      new: true,
      runValidators: true,
    }).populate("parent_id", "name slug");

      if (!category) {
        console.log('❌ Category not found:', categoryId);
        throw new Error("Không tìm thấy danh mục");
      }

      console.log('✅ Category updated successfully:', category.name);
      return category;
    } catch (error) {
      console.error('❌ Update category error:', error.message);
      throw error;
    }
  }

  // 🟢 Xóa danh mục (kiểm tra con + sản phẩm)
  static async deleteCategory(categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) return { success: false, reason: "NOT_FOUND" };

    // Kiểm tra danh mục con
    const childCategories = await Category.find({ parent_id: categoryId }).select('name');
    console.log(`🔍 Children for category ${categoryId}:`, childCategories);
    if (childCategories.length > 0) {
      const childNames = childCategories.map(c => c.name).join(', ');
      return { 
        success: false, 
        reason: "HAS_CHILDREN",
        childNames: childNames,
        childCount: childCategories.length
      };
    }

    // Kiểm tra sản phẩm - đảm bảo so sánh đúng kiểu dữ liệu
    const productCount = await Product.countDocuments({ category_id: categoryId });
    console.log(`🔍 Products count for category ${categoryId}: ${productCount}`);
    if (productCount > 0) return { success: false, reason: "HAS_PRODUCTS" };

    await Category.findByIdAndDelete(categoryId);
    console.log(`✅ Successfully deleted category ${categoryId}`);
    return { success: true };
  }

  // 🟢 Lấy danh mục kèm số lượng sản phẩm
  static async getCategoriesWithProductCount() {
    return await Category.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "category_id",
          as: "products",
        },
      },
      {
        $addFields: {
          productCount: { $size: "$products" },
        },
      },
      {
        $project: {
          products: 0,
        },
      },
      { $sort: { name: 1 } },
    ]);
  }

  // 🟢 Lấy cây danh mục (dạng cha - con)
  static async getCategoryTree() {
    const categories = await Category.find({})
      .populate("parent_id", "name slug")
      .sort({ name: 1 });

    const categoryMap = {};
    const roots = [];

    categories.forEach((c) => {
      categoryMap[c._id] = { ...c.toObject(), children: [] };
    });

    categories.forEach((c) => {
      if (c.parent_id) {
        if (categoryMap[c.parent_id]) {
          categoryMap[c.parent_id].children.push(categoryMap[c._id]);
        }
      } else {
        roots.push(categoryMap[c._id]);
      }
    });

    return roots;
  }
}

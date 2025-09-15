import Category from "../models/categrories.model.js";
import Product from "../models/products.model.js";
import mongoose from "mongoose";

// Lấy tất cả category với phân trang và tùy chọn
export const getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const includeProductCount = req.query.includeProductCount === 'true';
    const parentOnly = req.query.parentOnly === 'true';

    let query = {};
    if (parentOnly) {
      query.parent_id = null; // Chỉ lấy category cha
    }

    const [categories, total] = await Promise.all([
      Category.find(query)
        .populate('parent_id', 'name slug')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      Category.countDocuments(query)
    ]);

    // Nếu cần đếm số sản phẩm trong mỗi category
    if (includeProductCount) {
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const productCount = await Product.countDocuments({ 
            category_id: category._id 
          });
          return {
            ...category.toObject(),
            productCount
          };
        })
      );

      return res.json({
        categories: categoriesWithCount,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    }

    res.json({
      categories,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Lấy category theo ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID category không hợp lệ" });
    }

    const category = await Category.findById(id)
      .populate('parent_id', 'name slug');

    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy category" });
    }

    // Lấy subcategories nếu có
    const subcategories = await Category.find({ parent_id: id });
    
    // Đếm số sản phẩm trong category
    const productCount = await Product.countDocuments({ category_id: id });

    res.json({
      category: {
        ...category.toObject(),
        subcategories,
        productCount
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Lấy subcategories của một category
export const getSubcategories = async (req, res) => {
  try {
    const { parentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({ message: "Parent ID không hợp lệ" });
    }

    const subcategories = await Category.find({ parent_id: parentId })
      .sort({ name: 1 });

    res.json({ subcategories });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Thêm category mới
export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, parentId, image } = req.body;

    // Kiểm tra slug đã tồn tại chưa
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({ 
        message: "Slug đã tồn tại", 
        field: "slug" 
      });
    }

    // Kiểm tra parentId hợp lệ nếu có
    if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({ 
        message: "Parent ID không hợp lệ" 
      });
    }

    const newCategory = new Category({
      name,
      slug,
      description,
      parent_id: parentId || null,
      image
    });

    const saved = await newCategory.save();
    const populated = await Category.findById(saved._id)
      .populate('parent_id', 'name slug');

    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "Tên category hoặc slug đã tồn tại",
        field: Object.keys(err.keyValue)[0]
      });
    }
    res.status(400).json({ 
      message: "Không thêm được category", 
      error: err.message 
    });
  }
};

// Cập nhật category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID category không hợp lệ" });
    }

    // Kiểm tra slug mới nếu có
    if (updateData.slug) {
      const existingCategory = await Category.findOne({ 
        slug: updateData.slug,
        _id: { $ne: id }
      });
      if (existingCategory) {
        return res.status(400).json({ 
          message: "Slug đã tồn tại", 
          field: "slug" 
        });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('parent_id', 'name slug');

    if (!updatedCategory) {
      return res.status(404).json({ message: "Không tìm thấy category" });
    }

    res.json(updatedCategory);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "Tên category hoặc slug đã tồn tại",
        field: Object.keys(err.keyValue)[0]
      });
    }
    res.status(400).json({ 
      message: "Không cập nhật được category", 
      error: err.message 
    });
  }
};

// Xóa category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID category không hợp lệ" });
    }

    // Kiểm tra có subcategories không
    const subcategories = await Category.countDocuments({ parent_id: id });
    if (subcategories > 0) {
      return res.status(400).json({ 
        message: "Không thể xóa category có subcategories" 
      });
    }

    // Kiểm tra có sản phẩm trong category không
    const productsInCategory = await Product.countDocuments({ category_id: id });
    if (productsInCategory > 0) {
      return res.status(400).json({ 
        message: `Không thể xóa category có ${productsInCategory} sản phẩm` 
      });
    }

    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Không tìm thấy category" });
    }

    res.json({ 
      message: "Xóa category thành công",
      deletedCategory: deletedCategory.name
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Không xóa được category", 
      error: err.message 
    });
  }
};

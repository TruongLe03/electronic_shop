import { CategoryService } from "../services/categoryService.js";
import { ResponseUtil, asyncHandler } from "../utils/response.util.js";
import { ValidationUtil } from "../utils/validation.util.js";

/**
 * Lấy tất cả category
 */
export const getCategories = asyncHandler(async (req, res) => {
  const includeProductCount = req.query.includeProductCount === "true";
  const { page, limit, parentOnly } = req.query;

  const options = {
    includeProductCount,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
    parentOnly: parentOnly === "true",
  };

  const result = await CategoryService.getAllCategories(options);
  return ResponseUtil.success(res, result, "Lấy danh sách danh mục thành công");
});

/**
 * Lấy category theo ID
 */
export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ["Category ID không hợp lệ"]);
  }

  const category = await CategoryService.getCategoryById(id);

  if (!category) {
    return ResponseUtil.notFound(res, "Không tìm thấy danh mục");
  }

  return ResponseUtil.success(
    res,
    category,
    "Lấy thông tin danh mục thành công"
  );
});

/**
 * Lấy subcategories theo parentId
 */
export const getSubcategories = asyncHandler(async (req, res) => {
  const { parentId } = req.params;

  if (!parentId || !ValidationUtil.isValidObjectId(parentId)) {
    return ResponseUtil.validationError(res, ["Parent ID không hợp lệ"]);
  }

  const subcategories = await CategoryService.getSubcategories(parentId);

  return ResponseUtil.success(
    res,
    subcategories,
    "Lấy danh sách subcategories thành công"
  );
});

/**
 * Tạo category mới
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, parentId, image } = req.body;

  // Validation
  const errors = [];
  if (!name) errors.push("Tên danh mục là bắt buộc");
  if (!slug) errors.push("Slug là bắt buộc");
  if (parentId && !ValidationUtil.isValidObjectId(parentId)) {
    errors.push("Parent ID không hợp lệ");
  }

  if (errors.length > 0) {
    return ResponseUtil.validationError(res, errors);
  }

  const categoryData = { name, slug, description, parentId, image };
  const newCategory = await CategoryService.createCategory(categoryData);

  return ResponseUtil.success(res, newCategory, "Tạo danh mục thành công", 201);
});

/**
 * Cập nhật category
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id || !ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ["Category ID không hợp lệ"]);
  }

  const updatedCategory = await CategoryService.updateCategory(id, updateData);

  if (!updatedCategory) {
    return ResponseUtil.notFound(res, "Không tìm thấy danh mục");
  }

  return ResponseUtil.success(
    res,
    updatedCategory,
    "Cập nhật danh mục thành công"
  );
});

/**
 * Xóa category
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !ValidationUtil.isValidObjectId(id)) {
    return ResponseUtil.validationError(res, ["Category ID không hợp lệ"]);
  }

  const deletedCategory = await CategoryService.deleteCategory(id);

  if (!deletedCategory) {
    return ResponseUtil.notFound(res, "Không tìm thấy danh mục");
  }

  return ResponseUtil.success(
    res,
    { deletedCategory: deletedCategory.name },
    "Xóa danh mục thành công"
  );
});

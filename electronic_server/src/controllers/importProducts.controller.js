import ProductsImport from "../models/productimport.model.js";
import Inventory from "../models/inventory.model.js";
import Product from "../models/products.model.js";

// Tạo phiếu nhập hàng và cập nhật tồn kho
export const createImport = async (req, res) => {
  try {
    const { productId, supplierId, quantity, importPrice, note } = req.body;
    const createdBy = req.user?._id || req.body.createdBy; // Lấy từ token hoặc body

    // Validate tồn tại sản phẩm
    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    // Validate tồn tại nhà cung cấp (nếu có bảng Supplier)
    // ...

    // Tạo phiếu nhập
    const importDoc = await ProductsImport.create({
      productId,
      supplierId,
      quantity,
      importPrice,
      note,
      createdBy,
    });

    // Cập nhật tồn kho: tăng số lượng
    const inventory = await Inventory.findOne({ product_id: productId });
    if (inventory) {
      inventory.stock += quantity;
      await inventory.save();
    } else {
      // Nếu chưa có tồn kho, tạo mới
      await Inventory.create({ product_id: productId, stock: quantity });
    }

    res.status(201).json({ success: true, data: importDoc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi nhập hàng", error: error.message });
  }
};

// Lấy danh sách phiếu nhập hàng
export const getAllImports = async (req, res) => {
  try {
    const imports = await ProductsImport.find()
      .populate("productId", "name sku")
      .populate("supplierId", "name")
      .populate("createdBy", "name");
    res.json({ success: true, data: imports });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi lấy danh sách nhập hàng", error: error.message });
  }
};

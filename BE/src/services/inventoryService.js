import Inventory from "../models/inventory.model.js";
import { ProductService } from "./productService.js";

export class InventoryService {
  // Lấy thông tin inventory theo product ID
  static async getInventoryByProduct(productId) {
    console.log('Searching inventory for productId:', productId); // Debug log
    const inventory = await Inventory.findOne({ productId: productId })
      .populate('productId');
    console.log('Found inventory:', inventory); // Debug log
    
    if (!inventory) {
      // Trả về object mặc định với format mà frontend expect
      return {
        productId: productId,
        quantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
        available: false,
        currentStock: 0,
        lastUpdated: new Date()
      };
    }
    
    // Tính toán available quantity
    const availableQuantity = inventory.quantity - inventory.reservedQuantity;
    
    return {
      ...inventory.toObject(),
      availableQuantity: availableQuantity,
      available: availableQuantity > 0,
      currentStock: inventory.quantity
    };
  }

  // Cập nhật stock cho sản phẩm
  static async updateStock(productId, quantity, operation = 'set', reason = '') {
    let inventory = await Inventory.findOne({ product_id: productId });
    
    if (!inventory) {
      // Tạo mới nếu chưa có
      inventory = new Inventory({
        product_id: productId,
        stock_quantity: operation === 'set' ? quantity : 0,
        reserved_quantity: 0,
        last_updated: new Date()
      });
    }

    const oldQuantity = inventory.stock_quantity;

    switch (operation) {
      case 'set':
        inventory.stock_quantity = quantity;
        break;
      case 'increase':
        inventory.stock_quantity += quantity;
        break;
      case 'decrease':
        if (inventory.stock_quantity < quantity) {
          throw new Error("Không đủ hàng trong kho");
        }
        inventory.stock_quantity -= quantity;
        break;
      default:
        throw new Error("Operation không hợp lệ");
    }

    // Cập nhật thời gian
    inventory.last_updated = new Date();

    // Lưu lịch sử thay đổi
    if (!inventory.stock_history) {
      inventory.stock_history = [];
    }

    inventory.stock_history.push({
      date: new Date(),
      old_quantity: oldQuantity,
      new_quantity: inventory.stock_quantity,
      change_quantity: inventory.stock_quantity - oldQuantity,
      operation,
      reason
    });

    // Chỉ giữ lại 100 records gần nhất
    if (inventory.stock_history.length > 100) {
      inventory.stock_history = inventory.stock_history.slice(-100);
    }

    const savedInventory = await inventory.save();

    // Đồng bộ với Product model
    await ProductService.updateProductStock(
      productId, 
      inventory.stock_quantity, 
      'set'
    );

    return savedInventory;
  }

  // Reserve stock (dành cho đơn hàng pending)
  static async reserveStock(productId, quantity) {
    const inventory = await Inventory.findOne({ product_id: productId });
    
    if (!inventory) {
      throw new Error("Không tìm thấy thông tin kho hàng");
    }

    const availableStock = inventory.stock_quantity - inventory.reserved_quantity;
    
    if (availableStock < quantity) {
      throw new Error("Không đủ hàng để đặt chỗ");
    }

    inventory.reserved_quantity += quantity;
    inventory.last_updated = new Date();

    return await inventory.save();
  }

  // Release reserved stock
  static async releaseReservedStock(productId, quantity) {
    const inventory = await Inventory.findOne({ product_id: productId });
    
    if (!inventory) {
      throw new Error("Không tìm thấy thông tin kho hàng");
    }

    inventory.reserved_quantity = Math.max(0, inventory.reserved_quantity - quantity);
    inventory.last_updated = new Date();

    return await inventory.save();
  }

  // Lấy danh sách sản phẩm sắp hết hàng
  static async getLowStockProducts(threshold = 10) {
    return await Inventory.find({
      stock_quantity: { $lte: threshold }
    })
    .populate('product_id')
    .sort({ stock_quantity: 1 });
  }

  // Lấy báo cáo inventory
  static async getInventoryReport(filters = {}) {
    const matchStage = {};
    
    if (filters.lowStock) {
      matchStage.stock_quantity = { $lte: filters.threshold || 10 };
    }
    
    if (filters.outOfStock) {
      matchStage.stock_quantity = 0;
    }

    const report = await Inventory.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'products',
          localField: 'product_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock_quantity' },
          totalReserved: { $sum: '$reserved_quantity' },
          lowStockProducts: {
            $sum: { $cond: [{ $lte: ['$stock_quantity', 10] }, 1, 0] }
          },
          outOfStockProducts: {
            $sum: { $cond: [{ $eq: ['$stock_quantity', 0] }, 1, 0] }
          },
          totalValue: {
            $sum: { $multiply: ['$stock_quantity', '$product.price'] }
          }
        }
      }
    ]);

    return report[0] || {
      totalProducts: 0,
      totalStock: 0,
      totalReserved: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      totalValue: 0
    };
  }

  // Bulk update inventory
  static async bulkUpdateInventory(updates) {
    const results = [];
    
    for (const update of updates) {
      try {
        const result = await this.updateStock(
          update.productId,
          update.quantity,
          update.operation || 'set',
          update.reason || 'Bulk update'
        );
        results.push({ success: true, productId: update.productId, result });
      } catch (error) {
        results.push({ success: false, productId: update.productId, error: error.message });
      }
    }
    
    return results;
  }
}
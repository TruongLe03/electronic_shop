import Inventory from '../models/inventory.model.js';
import Product from '../models/products.model.js';
import { migrateProductStockToInventory } from '../migrations/migrateProductStock.js';

// Get all inventories with pagination and filters
const getInventories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { isActive: true };
    
    // Filter by stock status
    if (req.query.stockStatus) {
      // This will be handled in aggregation pipeline since stockStatus is virtual
    }
    
    // Filter by warehouse
    if (req.query.warehouse) {
      filter['location.warehouse'] = req.query.warehouse;
    }
    
    // Filter by low stock
    if (req.query.lowStock === 'true') {
      // Will be handled in aggregation
    }
    
    const aggregationPipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $addFields: {
          availableQuantity: { $subtract: ['$quantity', '$reservedQuantity'] },
          stockStatus: {
            $switch: {
              branches: [
                {
                  case: { $lte: [{ $subtract: ['$quantity', '$reservedQuantity'] }, 0] },
                  then: 'OUT_OF_STOCK'
                },
                {
                  case: { $lte: [{ $subtract: ['$quantity', '$reservedQuantity'] }, '$reorderPoint'] },
                  then: 'LOW_STOCK'
                },
                {
                  case: { $lte: [{ $subtract: ['$quantity', '$reservedQuantity'] }, '$minStockLevel'] },
                  then: 'MINIMUM_STOCK'
                }
              ],
              default: 'IN_STOCK'
            }
          }
        }
      }
    ];
    
    // Add stock status filter if specified
    if (req.query.stockStatus) {
      aggregationPipeline.push({
        $match: { stockStatus: req.query.stockStatus }
      });
    }
    
    // Add low stock filter
    if (req.query.lowStock === 'true') {
      aggregationPipeline.push({
        $match: { 
          $or: [
            { stockStatus: 'LOW_STOCK' },
            { stockStatus: 'OUT_OF_STOCK' },
            { stockStatus: 'MINIMUM_STOCK' }
          ]
        }
      });
    }
    
    // Add sorting
    aggregationPipeline.push({
      $sort: { 'product.name': 1 }
    });
    
    // Count total documents
    const countPipeline = [...aggregationPipeline, { $count: 'total' }];
    const countResult = await Inventory.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;
    
    // Add pagination
    aggregationPipeline.push(
      { $skip: skip },
      { $limit: limit }
    );
    
    const inventories = await Inventory.aggregate(aggregationPipeline);
    
    res.json({
      success: true,
      data: inventories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching inventories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventories',
      error: error.message
    });
  }
};

// Get inventory by product ID
const getInventoryByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const inventory = await Inventory.findOne({ productId, isActive: true })
      .populate('productId', 'name price image')
      .populate('stockMovements.createdBy', 'name email');
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found for this product'
      });
    }
    
    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory',
      error: error.message
    });
  }
};

// Update inventory
const updateInventory = async (req, res) => {
  try {
    const { productId } = req.params;
    const { 
      quantity, 
      minStockLevel, 
      maxStockLevel, 
      reorderPoint, 
      cost, 
      location,
      reason 
    } = req.body;
    
    const inventory = await Inventory.findOne({ productId, isActive: true });
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found for this product'
      });
    }
    
    const oldQuantity = inventory.quantity;
    
    // Update inventory fields
    if (quantity !== undefined) {
      inventory.quantity = quantity;
      
      // Add stock movement for quantity change
      if (quantity !== oldQuantity) {
        const movementType = quantity > oldQuantity ? 'IN' : 'ADJUSTMENT';
        const movementQuantity = Math.abs(quantity - oldQuantity);
        const movementReason = reason || `Inventory ${movementType.toLowerCase()} by admin`;
        
        inventory.addStockMovement(
          movementType,
          movementQuantity,
          movementReason,
          `ADMIN_UPDATE_${Date.now()}`,
          req.user.id
        );
      }
    }
    
    if (minStockLevel !== undefined) inventory.minStockLevel = minStockLevel;
    if (maxStockLevel !== undefined) inventory.maxStockLevel = maxStockLevel;
    if (reorderPoint !== undefined) inventory.reorderPoint = reorderPoint;
    if (cost !== undefined) inventory.cost = cost;
    if (location) inventory.location = { ...inventory.location, ...location };
    
    await inventory.save();
    
    res.json({
      success: true,
      data: inventory,
      message: 'Inventory updated successfully'
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating inventory',
      error: error.message
    });
  }
};

// Add stock (stock in)
const addStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, reason, reference, cost } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }
    
    let inventory = await Inventory.findOne({ productId, isActive: true });
    
    if (!inventory) {
      // Create new inventory if doesn't exist
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      inventory = new Inventory({
        productId,
        quantity: 0,
        cost: cost || 0
      });
    }
    
    await inventory.addStockMovement(
      'IN',
      quantity,
      reason || 'Stock replenishment',
      reference || `STOCK_IN_${Date.now()}`,
      req.user.id
    );
    
    res.json({
      success: true,
      data: inventory,
      message: 'Stock added successfully'
    });
  } catch (error) {
    console.error('Error adding stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding stock',
      error: error.message
    });
  }
};

// Remove stock (stock out)
const removeStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, reason, reference } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }
    
    const inventory = await Inventory.findOne({ productId, isActive: true });
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found for this product'
      });
    }
    
    if (inventory.availableQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }
    
    await inventory.addStockMovement(
      'OUT',
      quantity,
      reason || 'Manual stock removal',
      reference || `STOCK_OUT_${Date.now()}`,
      req.user.id
    );
    
    res.json({
      success: true,
      data: inventory,
      message: 'Stock removed successfully'
    });
  } catch (error) {
    console.error('Error removing stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing stock',
      error: error.message
    });
  }
};

// Check stock availability
const checkStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.query;
    
    const requestedQuantity = parseInt(quantity) || 1;
    const stockCheck = await Inventory.checkStock(productId, requestedQuantity);
    
    res.json({
      success: true,
      data: stockCheck
    });
  } catch (error) {
    console.error('Error checking stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking stock',
      error: error.message
    });
  }
};

// Get stock movements history
const getStockMovements = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const inventory = await Inventory.findOne({ productId, isActive: true })
      .populate('stockMovements.createdBy', 'name email')
      .select('stockMovements');
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found for this product'
      });
    }
    
    // Sort movements by date (newest first) and paginate
    const movements = inventory.stockMovements
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + limit);
    
    const total = inventory.stockMovements.length;
    
    res.json({
      success: true,
      data: movements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stock movements',
      error: error.message
    });
  }
};

// Get inventory dashboard stats
const getInventoryStats = async (req, res) => {
  try {
    const stats = await Inventory.aggregate([
      { $match: { isActive: true } },
      {
        $addFields: {
          availableQuantity: { $subtract: ['$quantity', '$reservedQuantity'] },
          stockValue: { $multiply: ['$quantity', '$cost'] }
        }
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$quantity' },
          totalReserved: { $sum: '$reservedQuantity' },
          totalAvailable: { $sum: '$availableQuantity' },
          totalValue: { $sum: '$stockValue' },
          lowStockItems: {
            $sum: {
              $cond: [
                { $lte: ['$availableQuantity', '$reorderPoint'] },
                1,
                0
              ]
            }
          },
          outOfStockItems: {
            $sum: {
              $cond: [
                { $lte: ['$availableQuantity', 0] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    const dashboardStats = stats[0] || {
      totalProducts: 0,
      totalStock: 0,
      totalReserved: 0,
      totalAvailable: 0,
      totalValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0
    };
    
    res.json({
      success: true,
      data: dashboardStats
    });
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory stats',
      error: error.message
    });
  }
};

// Run migration to sync Product stock to Inventory
const runStockMigration = async (req, res) => {
  try {
    console.log('🔄 Starting stock migration requested by admin:', req.user?.email);
    
    const result = await migrateProductStockToInventory();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Stock migration completed successfully',
        data: result.summary
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Migration failed',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error running stock migration:', error);
    res.status(500).json({
      success: false,
      message: 'Error running stock migration',
      error: error.message
    });
  }
};

export default {
  getInventories,
  getInventoryByProduct,
  updateInventory,
  addStock,
  removeStock,
  checkStock,
  getStockMovements,
  getInventoryStats,
  runStockMigration
};
import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  reservedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  availableQuantity: {
    type: Number,
    default: function() {
      return this.quantity - this.reservedQuantity;
    }
  },
  minStockLevel: {
    type: Number,
    default: 10,
    min: 0
  },
  maxStockLevel: {
    type: Number,
    default: 1000,
    min: 0
  },
  reorderPoint: {
    type: Number,
    default: 20,
    min: 0
  },
  purchasePrice: {
    type: Number,
    default: 0,
    min: 0
  },
  salePrice: {
    type: Number,
    default: 0,
    min: 0
  },
  cost: {
    type: Number,
    default: 0,
    min: 0
  },
  supplier: {
    name: String,
    contact: String,
    email: String
  },
  location: {
    warehouse: {
      type: String,
      default: 'Main Warehouse'
    },
    zone: {
      type: String,
      default: 'A'
    },
    shelf: {
      type: String,
      default: '001'
    }
  },
  stockMovements: [{
    type: {
      type: String,
      enum: ['IN', 'OUT', 'ADJUSTMENT', 'RESERVED', 'RELEASED'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    reference: {
      type: String, // Order ID, Purchase ID, etc.
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
  if (this.availableQuantity <= 0) return 'OUT_OF_STOCK';
  if (this.availableQuantity <= this.reorderPoint) return 'LOW_STOCK';
  if (this.availableQuantity <= this.minStockLevel) return 'MINIMUM_STOCK';
  return 'IN_STOCK';
});

// Virtual for stock value
inventorySchema.virtual('stockValue').get(function() {
  return this.quantity * this.cost;
});

// Update availableQuantity before save
inventorySchema.pre('save', function(next) {
  this.availableQuantity = this.quantity - this.reservedQuantity;
  this.lastUpdated = new Date();
  next();
});

// Instance method to add stock movement
inventorySchema.methods.addStockMovement = function(type, quantity, reason, reference, userId) {
  this.stockMovements.push({
    type,
    quantity,
    reason,
    reference,
    createdBy: userId
  });
  
  // Update quantities based on movement type
  switch(type) {
    case 'IN':
      this.quantity += Math.abs(quantity);
      break;
    case 'OUT':
      this.quantity -= Math.abs(quantity);
      break;
    case 'ADJUSTMENT':
      this.quantity = Math.abs(quantity);
      break;
    case 'RESERVED':
      this.reservedQuantity += Math.abs(quantity);
      break;
    case 'RELEASED':
      this.reservedQuantity -= Math.abs(quantity);
      break;
  }
  
  // Ensure quantities don't go negative
  this.quantity = Math.max(0, this.quantity);
  this.reservedQuantity = Math.max(0, this.reservedQuantity);
  
  return this.save();
};

// Static method to check if enough stock available
inventorySchema.statics.checkStock = async function(productId, requestedQuantity) {
  const inventory = await this.findOne({ productId, isActive: true });
  if (!inventory) {
    return { available: false, currentStock: 0, message: 'Product not found in inventory' };
  }
  
  const available = inventory.availableQuantity >= requestedQuantity;
  return {
    available,
    currentStock: inventory.availableQuantity,
    message: available ? 'Stock available' : 'Insufficient stock'
  };
};

// Static method to reserve stock
inventorySchema.statics.reserveStock = async function(productId, quantity, orderId, userId) {
  const inventory = await this.findOne({ productId, isActive: true });
  if (!inventory) {
    throw new Error('Product not found in inventory');
  }
  
  if (inventory.availableQuantity < quantity) {
    throw new Error('Insufficient stock available');
  }
  
  return inventory.addStockMovement('RESERVED', quantity, 'Order reservation', orderId, userId);
};

// Static method to release reserved stock
inventorySchema.statics.releaseStock = async function(productId, quantity, orderId, userId) {
  const inventory = await this.findOne({ productId, isActive: true });
  if (!inventory) {
    throw new Error('Product not found in inventory');
  }
  
  return inventory.addStockMovement('RELEASED', quantity, 'Order cancellation', orderId, userId);
};

// Static method to confirm stock out (when order is shipped)
inventorySchema.statics.confirmStockOut = async function(productId, quantity, orderId, userId) {
  const inventory = await this.findOne({ productId, isActive: true });
  if (!inventory) {
    throw new Error('Product not found in inventory');
  }
  
  // Release the reserved stock and reduce actual stock
  await inventory.addStockMovement('RELEASED', quantity, 'Order fulfillment', orderId, userId);
  return inventory.addStockMovement('OUT', quantity, 'Order shipped', orderId, userId);
};

// Index for better performance
inventorySchema.index({ productId: 1 });
inventorySchema.index({ 'stockMovements.createdAt': -1 });
inventorySchema.index({ stockStatus: 1 });

export default mongoose.model('Inventory', inventorySchema);
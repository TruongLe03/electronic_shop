import mongoose from 'mongoose';
import Product from '../models/products.model.js';
import Inventory from '../models/inventory.model.js';
import dotenv from 'dotenv';

dotenv.config();

// Migration script to sync Product stock data to Inventory
export const migrateProductStockToInventory = async () => {
  try {
    console.log('🔄 Starting migration: Product stock → Inventory...');
    
    // Get all products with stock data
    const products = await Product.find({}, 'name stock price sku');
    console.log(`📦 Found ${products.length} products to migrate`);
    
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const product of products) {
      try {
        // Check if inventory already exists for this product
        let inventory = await Inventory.findOne({ productId: product._id });
        
        if (inventory) {
          // Update existing inventory if stock is different
          if (inventory.quantity !== product.stock) {
            const oldQuantity = inventory.quantity;
            inventory.quantity = product.stock;
            
            // Add stock movement to track this migration
            inventory.stockMovements.push({
              type: 'ADJUSTMENT',
              quantity: product.stock,
              reason: `Migration from Product.stock (was ${oldQuantity})`,
              reference: `MIGRATION_${Date.now()}`,
              createdAt: new Date()
            });
            
            await inventory.save();
            updatedCount++;
            console.log(`✅ Updated inventory for ${product.name}: ${oldQuantity} → ${product.stock}`);
          } else {
            skippedCount++;
            console.log(`⏭️  Skipped ${product.name}: inventory already up to date`);
          }
        } else {
          // Create new inventory record
          inventory = new Inventory({
            productId: product._id,
            quantity: product.stock || 0,
            reservedQuantity: 0,
            minStockLevel: 10,
            maxStockLevel: 1000,
            reorderPoint: 20,
            cost: product.price * 0.7, // Assume cost is 70% of selling price
            location: {
              warehouse: 'Main Warehouse',
              zone: 'A',
              shelf: '001'
            },
            stockMovements: [{
              type: 'IN',
              quantity: product.stock || 0,
              reason: 'Initial stock migration from Product model',
              reference: `MIGRATION_${Date.now()}`,
              createdAt: new Date()
            }],
            isActive: true
          });
          
          await inventory.save();
          createdCount++;
          console.log(`🆕 Created inventory for ${product.name}: ${product.stock} units`);
        }
      } catch (error) {
        console.error(`❌ Error migrating product ${product.name}:`, error.message);
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Created: ${createdCount} new inventory records`);
    console.log(`🔄 Updated: ${updatedCount} existing inventory records`);
    console.log(`⏭️  Skipped: ${skippedCount} already up-to-date records`);
    console.log(`📦 Total products processed: ${products.length}`);
    console.log('🎉 Migration completed successfully!');
    
    return {
      success: true,
      summary: {
        totalProducts: products.length,
        created: createdCount,
        updated: updatedCount,
        skipped: skippedCount
      }
    };
  } catch (error) {
    console.error('💥 Migration failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Connect to database
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/electronics_shop')
    .then(() => {
      console.log('📡 Connected to MongoDB');
      return migrateProductStockToInventory();
    })
    .then((result) => {
      if (result.success) {
        console.log('✅ Migration completed successfully');
      } else {
        console.error('❌ Migration failed:', result.error);
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database connection failed:', error);
      process.exit(1);
    });
}

export default migrateProductStockToInventory;